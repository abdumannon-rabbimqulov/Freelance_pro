from rest_framework.exceptions import ValidationError
from payments.models import Transaction, PlatformSetting
from users.models import ADMIN, CustomUser
from notifications.models import Notification
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def process_order_escrow(client, price, description):
    """
    Deducts money from client and holds it in the Admin account.
    Returns the admin user.
    """
    with transaction.atomic():
        # Lock the client record
        client = CustomUser.objects.select_for_update().get(id=client.id)
        
        if client.balance < price:
            raise ValidationError({"error": "Balansingizda yetarli mablag' mavjud emas. Iltimos, hisobingizni to'ldiring."})

        # Lock the admin record
        admin_user = CustomUser.objects.select_for_update().filter(auth_role=ADMIN).first()
        if not admin_user:
            raise ValidationError({"error": "Tizimda admin topilmadi. To'lov amalga oshirilmadi."})

        # Transfer funds to Admin (Escrow)
        client.balance -= price
        admin_user.balance += price
        client.save()
        admin_user.save()

        # Client transaction (Withdrawal/Locked)
        Transaction.objects.create(
            user=client,
            amount=price,
            transaction_type='withdrawal',
            description=description
        )

        # Admin transaction (Escrow received)
        Transaction.objects.create(
            user=admin_user,
            amount=price,
            transaction_type='deposit',
            description=f"Escrow mablag' qabul qilindi (Mijoz: {client.username})"
        )
    
    return admin_user

def create_order_with_notifications(client, seller, price, delivery_time, requirements=None, product=None, project=None):
    """
    Creates an order and sends notifications/websockets.
    """
    from orders.models import Order # avoid circular import
    
    order = Order.objects.create(
        client=client,
        seller=seller,
        price=price,
        delivery_time=delivery_time,
        requirements=requirements,
        product=product,
        project=project,
        status='pending'
    )
    
    # Notification
    notification = Notification.objects.create(
        user=seller,
        title="Sizda yangi buyurtma bor!",
        message=f"{client.username} sizga buyurtma berdi."
    )
    
    # WebSocket
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{seller.id}",
            {
                "type": "send_notification",
                "title": notification.title,
                "message": notification.message
            }
        )
    except:
        pass
        
    return order
