from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PlatformSetting, Transaction, PayoutRequest
from .serializers import (
    PlatformSettingSerializer, TransactionSerializer, 
    PayoutRequestSerializer, AdminPayoutUpdateSerializer
)
from users.models import ADMIN, SELLER

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
        payout = self.get_object()
        if payout.status != 'pending':
            return Response({"error": "Ushbu so'rov allaqachon ko'rib chiqilgan."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Balansdan yechish
        seller = payout.seller
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
