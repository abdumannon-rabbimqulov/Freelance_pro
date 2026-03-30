from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Order
from .serializers import OrderSerializer
from notifications.models import Notification
from shared.permissions import IsProfileComplete
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from decimal import Decimal
from payments.models import PlatformSetting, Transaction

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

        order = serializer.save(client=self.request.user, seller=seller, price=price, delivery_time=delivery_time)
        
        notification = Notification.objects.create(
            user=seller,
            title="Sizda yangi buyurtma bor!",
            message=f"{self.request.user.username} sizning xizmatingiz/maxsulotingizga buyurtma berdi."
        )

        # WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{seller.id}",
            {
                "type": "send_notification",
                "title": notification.title,
                "message": notification.message
            }
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

        order = serializer.save()

        # Moliyaviy mantiq: Buyurtma yakunlanganda pul taqsimlanadi
        if new_status == 'completed' and old_status != 'completed':
            config = PlatformSetting.get_setting()
            commission_percent = config.commission_percent
            
            total_price = order.price
            commission_amount = total_price * (commission_percent / Decimal('100'))
            seller_share = total_price - commission_amount

            # 1. Admin balansi (Admin rolidagi birinchi foydalanuvchini olamiz)
            from users.models import ADMIN, CustomUser
            admin_user = CustomUser.objects.filter(auth_role=ADMIN).first()
            if admin_user:
                admin_user.balance += commission_amount
                admin_user.save()
                Transaction.objects.create(
                    user=admin_user,
                    amount=commission_amount,
                    transaction_type='commission',
                    description=f"Buyurtma #{str(order.id)[:8]} dan komissiya."
                )

            # 2. Sotuvchi balansi
            seller = order.seller
            seller.balance += seller_share
            seller.save()
            Transaction.objects.create(
                user=seller,
                amount=seller_share,
                transaction_type='order_payment',
                description=f"Buyurtma #{str(order.id)[:8]} uchun to'lov (Komissiya chegirilgan)."
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
