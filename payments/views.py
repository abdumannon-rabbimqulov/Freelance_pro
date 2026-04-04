from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PlatformSetting, Transaction, PayoutRequest
from .serializers import (
    PlatformSettingSerializer, TransactionSerializer, 
    PayoutRequestSerializer, AdminPayoutUpdateSerializer
)
from users.models import ADMIN, SELLER, CustomUser
from django.db.models import Sum
from orders.models import Order

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.auth_role == ADMIN

class PlatformSettingView(generics.RetrieveUpdateAPIView):
    serializer_class = PlatformSettingSerializer
    permission_classes = [IsAdmin]

    def get_object(self):
        return PlatformSetting.get_setting()

class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-created_at')

class PayoutRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PayoutRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.auth_role == ADMIN:
            return PayoutRequest.objects.all().order_by('-created_at')
        return PayoutRequest.objects.filter(seller=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        amount = serializer.validated_data.get('amount')
        
        if user.balance < amount:
            raise generics.ValidationError({"amount": "Balansingizda yetarli mablag' mavjud emas."})
        
        serializer.save(seller=user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        from django.db import transaction
        with transaction.atomic():
            payout = PayoutRequest.objects.select_for_update().get(pk=pk)
            if payout.status != 'pending':
                return Response({"error": "Ushbu so'rov allaqachon ko'rib chiqilgan."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Balansdan yechish
            seller = CustomUser.objects.select_for_update().get(id=payout.seller.id)
            if seller.balance < payout.amount:
                  return Response({"error": "Sotuvchi balansida yetarli mablag' qolmagan."}, status=status.HTTP_400_BAD_REQUEST)
            
            seller.balance -= payout.amount
            seller.save()
            
            # Transaction yaratish
            Transaction.objects.create(
                user=seller,
                amount=payout.amount,
                transaction_type='withdrawal',
                description=f"Yechib olish so'rovi #{str(payout.id)[:8]} tasdiqlandi."
            )
            
            payout.status = 'approved'
            payout.save()
        return Response({"message": "Yechib olish tasdiqlandi!"})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        payout = self.get_object()
        if payout.status != 'pending':
            return Response({"error": "Ushbu so'rov allaqachon ko'rib chiqilgan."}, status=status.HTTP_400_BAD_REQUEST)
        
        reason = request.data.get('rejection_reason')
        if not reason:
             return Response({"error": "Rad etish sababini kiritishingiz shart."}, status=status.HTTP_400_BAD_REQUEST)
        
        payout.status = 'rejected'
        payout.rejection_reason = reason
        payout.save()
        return Response({"message": "Yechib olish rad etildi."})

from .models import Card
from .serializers import CardSerializer, DepositSerializer

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DepositView(generics.CreateAPIView):
    serializer_class = DepositSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        card_id = serializer.validated_data.get('card_id')
        amount = serializer.validated_data.get('amount')
        
        from django.db import transaction
        with transaction.atomic():
            try:
                card = Card.objects.get(id=card_id, user=request.user)
            except Card.DoesNotExist:
                return Response({"error": "Karta topilmadi."}, status=status.HTTP_404_NOT_FOUND)
            
            # Virtual Deposit Lojikasi
            user = CustomUser.objects.select_for_update().get(id=request.user.id)
            user.balance += amount
            user.save()
            
            Transaction.objects.create(
                user=user,
                amount=amount,
                transaction_type='deposit',
                description=f"Kartadan to'ldirish (****{card.card_number[-4:]})"
            )
            
            return Response({
                "message": "Balans muvaffaqiyatli to'ldirildi!",
                "new_balance": user.balance
            }, status=status.HTTP_200_OK)

class AdminStatsView(generics.RetrieveAPIView):
    permission_classes = [IsAdmin]

    def get(self, request, *args, **kwargs):
        # 1. Total Turnover (Completed Orders Volume)
        total_turnover = Order.objects.filter(status='completed').aggregate(total=Sum('price'))['total'] or 0
        
        # 2. Total Commission (Admin Profit)
        total_commission = Transaction.objects.filter(transaction_type='commission').aggregate(total=Sum('amount'))['total'] or 0
        
        # 3. Total User Balances (Platform liability)
        total_user_balances = CustomUser.objects.aggregate(total=Sum('balance'))['total'] or 0
        
        # 4. User List
        users = CustomUser.objects.all().order_by('-balance')
        user_data = []
        for u in users:
            user_data.append({
                "username": u.username,
                "role": u.auth_role,
                "balance": u.balance,
                "completed_orders": u.completed_orders_count,
                "cancelled_orders": u.cancelled_orders_count
            })
            
        return Response({
            "total_turnover": total_turnover,
            "total_commission": total_commission,
            "total_user_balances": total_user_balances,
            "users": user_data
        })
