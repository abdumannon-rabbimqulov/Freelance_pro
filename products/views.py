from django.shortcuts import render,get_object_or_404
from .models import ProductImage,Product
from .serializers import *
from rest_framework import viewsets, permissions,status
from .services import generate_image_vector
from rest_framework.generics import ListAPIView,CreateAPIView
import numpy as np
from django.db import models
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

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
                raise ValidationError({"message":f"Rasm vektorlashda xatolik: {e}"})




class SimilarProductListView(APIView):
    permission_classes = (AllowAny, )

    def post(self, request, *args, **kwargs):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({"error": "Rasm yuklanmadi (key nomi 'image' bo'lishi kerak)"}, status=400)

        query_vector = generate_image_vector(image_file)
        if not query_vector:
            return Response({"error": "Rasmni qayta ishlab bo'lmadi"}, status=500)

        all_products = Product.objects.exclude(image_vector__isnull=True)
        product_matches = []

        v1 = np.array(query_vector)
        v1_norm = np.linalg.norm(v1)

        for product in all_products:
            v2 = np.array(product.image_vector)
            v2_norm = np.linalg.norm(v2)

            similarity = np.dot(v1, v2) / (v1_norm * v2_norm)

            if similarity > 0.7:
                product_matches.append((product.id, similarity))

        product_matches.sort(key=lambda x: x[1], reverse=True)
        matched_ids = [item[0] for item in product_matches[:10]]

        if not matched_ids:
            return Response([], status=200)

        preserved = models.Case(*[models.When(pk=pk, then=pos) for pos, pk in enumerate(matched_ids)])
        queryset = Product.objects.filter(id__in=matched_ids).order_by(preserved)

        serializer = ProductSerializers(queryset, many=True)
        return Response(serializer.data)

class ProductListView(ListAPIView):
    permission_classes = (AllowAny, )
    queryset = Product.objects.all()
    serializer_class = ProductSerializers



class ProductDetailView(APIView):
    permission_classes = (AllowAny, )
    def get(self,request,pk):
        product=get_object_or_404(Product,id=pk)
        product.increment_views()
        serializer=ProductSerializers(product)
        response={
            'status':status.HTTP_200_OK,
            'message':'product',
            'data':serializer.data
        }
        return Response(response)
    def post(self,request,pk):
        product = get_object_or_404(Product, pk=pk)
        user=self.request.user
        if not user.is_authenticated:
            raise ValidationError({'message':'siz royxatdan otmagansiz'})
        serializer=ReviewCreateSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save(user=user,product=product)
        except Exception as e:
            return Response(
                {"error": f"Siz bu mahsulotga allaqachon sharh qoldirgansiz."},
            )
        else:
            response={
                'status':status.HTTP_200_OK,
                'message':'sharhingiz uchun raxmat',
                'data':serializer.data
            }
        return Response(response)



class ProductList(ListAPIView):
    """userni o'ziniki"""
    permission_classes = (AllowAny,)
    serializer_class = ProductSerializers

    def get_queryset(self):
        user=self.request.user
        return Product.objects.filter(seller=user)



class MessageStart(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self,request,pk):
        user=self.request.user
        serialiser=MessageStartSerializers(data=request.data)
        serialiser.is_valid(raise_exception=True)
        product=get_object_or_404(Product,pk=pk)
        chat = Chat.objects.filter(participants=user).filter(participants__id=product.seller).first()
        if not chat:
            new_chat=Chat.objects.create()
            new_chat.participants.add(user,product.seller)
            serialiser.save(
                user=user,
                chat=new_chat,
                product=product
            )

        serialiser.save(
            user=user,
            chat=chat,
            product=product
        )

        response={
            'status':status.HTTP_200_OK,
            'message':'xabariz  yuborildi'
        }
        return Response(response)



class ChatListView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        user = request.user
        chats = Chat.objects.filter(participants=user).order_by('-created_at')

        serializer = ChatListSerializer(chats, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)





