from django.shortcuts import render
from .models import ProductImage,Product
from .serializers import ProductSerializers
from rest_framework import viewsets, permissions
from .services import generate_image_vector
from rest_framework.generics import ListAPIView
import numpy as np
from django.db import models
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializers
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def perform_create(self, serializer):
        product=serializer.save(seller=self.request.user)
        if product.main_image:
            try:
                vector = generate_image_vector(product.main_image.path)
                if vector:
                    product.image_vector = vector
                    product.save(update_fields=['image_vector'])
            except Exception as e:
                print(f"Rasm vektorlashda xatolik: {e}")





class SimilarProductListView(APIView):
    permission_classes = (AllowAny, )

    def post(self, request, *args, **kwargs):
        # 1. Rasmni olish
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({"error": "Rasm yuklanmadi (key nomi 'image' bo'lishi kerak)"}, status=400)

        # 2. Vektorlash
        query_vector = generate_image_vector(image_file)
        if not query_vector:
            return Response({"error": "Rasmni qayta ishlab bo'lmadi"}, status=500)

        # 3. O'xshashlikni qidirish
        all_products = Product.objects.exclude(image_vector__isnull=True)
        product_matches = []

        v1 = np.array(query_vector)
        v1_norm = np.linalg.norm(v1)

        for product in all_products:
            v2 = np.array(product.image_vector)
            v2_norm = np.linalg.norm(v2)

            # Cosine Similarity
            similarity = np.dot(v1, v2) / (v1_norm * v2_norm)

            if similarity > 0.7:  # O'xshashlik darajasi
                product_matches.append((product.id, similarity))

        # 4. Saralash va Natija
        product_matches.sort(key=lambda x: x[1], reverse=True)
        matched_ids = [item[0] for item in product_matches[:10]]

        if not matched_ids:
            return Response([], status=200)

        # Tartibni saqlash uchun models.Case
        preserved = models.Case(*[models.When(pk=pk, then=pos) for pos, pk in enumerate(matched_ids)])
        queryset = Product.objects.filter(id__in=matched_ids).order_by(preserved)

        serializer = ProductSerializers(queryset, many=True)
        return Response(serializer.data)