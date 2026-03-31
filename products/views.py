from django.shortcuts import render,get_object_or_404
from .models import ProductImage,Product
from .serializers import *
from rest_framework import viewsets, permissions,status
from rest_framework.generics import ListAPIView,CreateAPIView
from django.db import models
from rest_framework.permissions import AllowAny,IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from shared.permissions import IsProfileComplete, IsProfileCompleteOrReadOnly, IsOwnerOrReadOnly
from notifications.models import Notification

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializers
    permission_classes = [IsProfileCompleteOrReadOnly]
    lookup_field = 'slug'

    def perform_create(self, serializer):
        product=serializer.save(seller=self.request.user, is_active=False)
        
        # Galereya rasmlarini (max 5) saqlash
        images = self.request.FILES.getlist('images')
        for img in images[:5]:
            ProductImage.objects.create(product=product, image=img)

        # if product.main_image:
        #     try:
        #         vector = generate_image_vector(product.main_image.path)
        #         if vector:
        #             product.image_vector = vector
        #             product.save(update_fields=['image_vector'])
        #     except Exception as e:
        #         print(f"Rasm vektorlashda xatolik: {e}")

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Product.objects.all()
        return Product.objects.filter(seller=user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.seller != request.user and not request.user.is_staff:
            return Response({"error": "Sizda bu mahsulotni o'chirish huquqi yo'q"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)




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




class CategoryListView(ListAPIView):
    permission_classes = (AllowAny, )
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer

class ProductDetailView(APIView):
    permission_classes = [IsProfileCompleteOrReadOnly, IsOwnerOrReadOnly]

    def get(self, request, pk):
        product = get_object_or_404(Product, id=pk)
        product.increment_views()
        serializer = ProductSerializers(product)
        response = {
            'status': status.HTTP_200_OK,
            'message': 'product',
            'data': serializer.data
        }
        return Response(response)

    def put(self, request, pk):
        product = get_object_or_404(Product, id=pk)
        self.check_object_permissions(request, product)
        
        serializer = ProductSerializers(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': status.HTTP_200_OK,
                'message': 'Xizmat muvaffaqiyatli yangilandi',
                'data': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = get_object_or_404(Product, id=pk)
        self.check_object_permissions(request, product)
        product.delete()
        return Response({
            'status': status.HTTP_204_NO_CONTENT,
            'message': 'Xizmat muvaffaqiyatli o\'chirildi'
        }, status=status.HTTP_204_NO_CONTENT)
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
    """Bosh sahifa uchn faqat Tasdiqlangan (is_active=True) xizmatlar ro'yxati"""
    permission_classes = (AllowAny,)
    serializer_class = ProductSerializers

    def get_queryset(self):
        user = self.request.user
        queryset = Product.objects.filter(is_active=True)
        
        # Agar foydalanuvchi kirgan bo'lsa, o'zining hali tasdiqlanmagan ishlarini ham qo'shib ko'rsatamiz
        if user.is_authenticated:
            queryset = Product.objects.filter(models.Q(is_active=True) | models.Q(seller=user))
            
        queryset = queryset.order_by('-created_at')
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset


class AdminProductList(ListAPIView):
    """Adminlar uchn Tasdiq kutilayotgan (is_active=False) xizmatlar ro'yxati"""
    permission_classes = (IsAdminUser,)
    serializer_class = ProductSerializers

    def get_queryset(self):
        return Product.objects.filter(is_active=False).order_by('-created_at')


class ApproveProduct(APIView):
    """Admin mahsulotni tasdiqlashi (is_active=True qilish) uchn API"""
    permission_classes = (IsAdminUser,)

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.is_active = True
        product.save()
        return Response({"message": "Mahsulot muvaffaqiyatli tasdiqlandi!"}, status=status.HTTP_200_OK)


class SellerProductList(ListAPIView):
    """Sotuvchining o'zi uchn barcha (Active/Inactive) xizmatlari ro'yxati"""
    permission_classes = (IsProfileComplete,)
    serializer_class = ProductSerializers

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user).order_by('-created_at')



class MessageStart(APIView):
    permission_classes = (IsProfileComplete, )

    def post(self,request,pk):
        user=self.request.user
        serialiser=MessageStartSerializers(data=request.data)
        serialiser.is_valid(raise_exception=True)
        product=get_object_or_404(Product,pk=pk)
        chat = Chat.objects.filter(participants=user).filter(participants__id=product.seller.id).first()
        if not chat:
            chat=Chat.objects.create()
            chat.participants.add(user,product.seller)

        serialiser.save(
            user=user,
            chat=chat,
            product=product
        )

        # Yangi talab: Xabar yozilganda unga xabarnoma tushishi va Real-time yuborilishi kerak
        if user != product.seller:
            notification = Notification.objects.create(
                user=product.seller,
                title="Yangi xabar keldi",
                message=f"{user.username} sizning {product.title} mahsulotingiz yuzasidan xabar yozdi."
            )
            # Socket orqali real-time uzatish
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{product.seller.id}",
                {
                    "type": "send_notification",
                    "title": notification.title,
                    "message": notification.message
                }
            )

        response={
            'status':status.HTTP_200_OK,
            'message':'xabariz  yuborildi'
        }
        return Response(response)



class ChatListView(APIView):
    permission_classes = (IsProfileComplete, )

    def get(self, request):
        user = request.user
        chats = Chat.objects.filter(participants=user).order_by('-created_at')

        serializer = ChatListSerializer(chats, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChatDetailView(APIView):
    permission_classes = (IsProfileComplete, )

    def get(self, request, pk):
        user = request.user
        chat = get_object_or_404(Chat, pk=pk, participants=user)
        messages = Messages.objects.filter(chat=chat).order_by('created_at')
        
        # Maxsus tuzilma bilan qaytaramiz (O'ziniki yoki birovniki ekanligini bildirish uchn)
        data = []
        for msg in messages:
            data.append({
                "id": msg.id,
                "text": msg.text,
                "is_mine": msg.user == user,
                "created_at": msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        user = request.user
        chat = get_object_or_404(Chat, pk=pk, participants=user)
        text = request.data.get('text')
        
        if not text:
            raise ValidationError({"error": "Xabar matni bo'sh bo'lishi mumkin emas."})
            
        msg = Messages.objects.create(
            user=user,
            chat=chat,
            text=text
        )
        
        # Websocket orqali chatdagi ikkinchi shaxsga uzatish
        other_user = chat.get_recipient(user)
        if other_user:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{other_user.id}",
                {
                    "type": "send_notification",
                    "title": f"{user.username} dan yangi xabar",
                    "message": text
                }
            )

        return Response({
            "id": msg.id,
            "text": msg.text,
            "is_mine": True,
            "created_at": msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }, status=status.HTTP_201_CREATED)






