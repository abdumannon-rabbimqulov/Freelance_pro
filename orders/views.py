from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Order
from .serializers import OrderSerializer
from notifications.models import Notification
from shared.permissions import IsProfileComplete
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from decimal import Decimal
from django.db import transaction
from payments.models import PlatformSetting, Transaction
from .utils import process_order_escrow, create_order_with_notifications

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsProfileComplete]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(client=user) | Order.objects.filter(seller=user)

    def perform_create(self, serializer):
        product = serializer.validated_data.get('product')
        project = serializer.validated_data.get('project')
        
        if product:
            seller = product.seller
            price = product.price_standard if product.price_standard else 0
            delivery_time = product.delivery_time_standard if product.delivery_time_standard else 1
        elif project:
            seller = project.seller
            price = project.price_standard if project.price_standard else 0
            delivery_time = project.delivery_standard if project.delivery_standard else 1
        else:
            raise ValidationError({"error": "Maxsulot yoki loyihani tanlashingiz kerak"})

        if seller == self.request.user:
            raise ValidationError({"error": "O'zingizning ishingizga buyurtma bera olmaysiz."})

        # Moliyaviy Escrow Logic
        client = self.request.user
        desc = f"Buyurtma uchun to'lov bloklandi ({product.title if product else project.title})"
        process_order_escrow(client, price, desc)

        # Create Order & Send Notifications
        serializer.instance = create_order_with_notifications(
            client=client, 
            seller=seller, 
            price=price, 
            delivery_time=delivery_time, 
            requirements=serializer.validated_data.get('requirements'),
            product=product,
            project=project
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)
        
        # Sifat nazorati ma'lumotlari
        rating = serializer.validated_data.get('rating')
        feedback = serializer.validated_data.get('feedback')

        # Faqat mijoz 'completed' qila oladi
        if new_status == 'completed' and old_status != 'completed':
            if self.request.user != instance.client:
                raise ValidationError({"error": "Faqat buyurtmachi ishni yakunlashi mumkin."})
            if not rating:
                raise ValidationError({"error": "Iltimos, ish sifatini baholang (Rating)."})

        with transaction.atomic():
            # Refresh and Lock the order
            order = Order.objects.select_for_update().get(id=instance.id)
            
            # Save the new status/rating
            serializer.save()

            # Moliyaviy mantiq: Buyurtma yakunlanganda pul taqsimlanadi
            if new_status == 'completed' and old_status != 'completed':
                config = PlatformSetting.get_setting()
                commission_percent = config.commission_percent
                
                total_price = order.price
                commission_amount = total_price * (commission_percent / Decimal('100'))
                seller_share = total_price - commission_amount

                # 1. Admin balansidan sotuvchi ulushini yechamiz (Admin allaqachon to'liq summani olgan)
                from users.models import ADMIN, CustomUser
                admin_user = CustomUser.objects.select_for_update().filter(auth_role=ADMIN).first()
                if admin_user:
                    admin_user.balance -= seller_share
                    admin_user.save()
                    
                    # Sotuvchiga yuborilgan qism (Withdrawal for Admin)
                    Transaction.objects.create(
                        user=admin_user,
                        amount=seller_share,
                        transaction_type='withdrawal',
                        description=f"Buyurtma #{str(order.id)[:8]} uchun sotuvchiga to'lov."
                    )
                    
                    # Admin o'zida olib qolgan qism (Commission for Admin)
                    Transaction.objects.create(
                        user=admin_user,
                        amount=commission_amount,
                        transaction_type='commission',
                        description=f"Buyurtma #{str(order.id)[:8]} uchun platforma komissiyasi."
                    )
                else:
                    raise ValidationError({"error": "Admin topilmadi. To'lov amalga oshirilmadi."})

                # 2. Sotuvchi balansi
                seller = CustomUser.objects.select_for_update().get(id=order.seller.id)
                seller.balance += seller_share
                seller.save()
                Transaction.objects.create(
                    user=seller,
                    amount=seller_share,
                    transaction_type='order_payment',
                    description=f"Buyurtma #{str(order.id)[:8]} uchun to'lov qabul qilindi."
                )

            # Refund Logic: Buyurtma bekor bo'lganda pul mijozga qaytadi
            if new_status == 'cancelled' and old_status != 'cancelled':
                total_price = order.price
                
                # Admin balansidan yechib mijozga qaytarish
                from users.models import ADMIN, CustomUser
                admin_user = CustomUser.objects.select_for_update().filter(auth_role=ADMIN).first()
                client = CustomUser.objects.select_for_update().get(id=order.client.id)
                
                if admin_user:
                    if admin_user.balance < total_price:
                        # Bu holat nazariy jihatdan bo'lmasligi kerak (Admin escrowda ushlab turadi)
                        pass
                    admin_user.balance -= total_price
                    admin_user.save()
                
                client.balance += total_price
                client.save()
                
                Transaction.objects.create(
                    user=client,
                    amount=total_price,
                    transaction_type='deposit',
                    description=f"Bekor qilingan buyurtma #{str(order.id)[:8]} uchun mablag' qaytarildi."
                )

        if old_status != order.status:
            user_to_notify = order.client if self.request.user == order.seller else order.seller
            notification = Notification.objects.create(
                user=user_to_notify,
                title="Buyurtma holati o'zgardi",
                message=f"Buyurtma #{str(order.id)[:8]} holati {order.get_status_display()} ga o'zgardi."
            )
            
            # WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{user_to_notify.id}",
                {
                    "type": "send_notification",
                    "title": notification.title,
                    "message": notification.message
                }
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def deliver(self, request, pk=None):
        order = self.get_object()
        if request.user != order.seller:
            return Response({"error": "Faqat sotuvchi ishni topshirishi mumkin."}, status=403)
        
        if order.status not in ['pending', 'in_progress']:
            return Response({"error": "Ushbu holatda ishni topshirib bo'lmaydi."}, status=400)

        delivery_text = request.data.get('delivery_text')
        delivery_file = request.FILES.get('delivery_file')

        if not delivery_text and not delivery_file:
            return Response({"error": "Iltimos, ish natijasini (matn yoki fayl) biriktiring."}, status=400)

        order.delivery_text = delivery_text
        if delivery_file:
            order.delivery_file = delivery_file
        
        order.status = 'delivered'
        order.save()

        # Notify client
        notification = Notification.objects.create(
            user=order.client,
            title="Sizga ish topshirildi!",
            message=f"Buyurtma #{str(order.id)[:8]} bo'yicha ish natijalari yuborildi. Iltimos, tekshirib ko'ring."
        )
        
        return Response({"message": "Ish muvaffaqiyatli topshirildi!"})
