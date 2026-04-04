from rest_framework import serializers
from .models import PlatformSetting, Transaction, PayoutRequest
from users.models import CustomUser

class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = ('commission_percent', 'updated_at')

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class PayoutRequestSerializer(serializers.ModelSerializer):
    seller_name = serializers.ReadOnlyField(source='seller.username')
    
    class Meta:
        model = PayoutRequest
        fields = '__all__'
        read_only_fields = ('seller', 'status', 'rejection_reason')

class AdminPayoutUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutRequest
        fields = ('status', 'rejection_reason')

    def validate(self, attrs):
        if attrs.get('status') == 'rejected' and not attrs.get('rejection_reason'):
            raise serializers.ValidationError({"rejection_reason": "Rad etish sababini ko'rsatishingiz shart."})
        return attrs

from .models import Card

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ('id', 'card_number', 'expiry_date', 'cvv', 'card_holder', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Mask card number for security
        data['card_number'] = f"**** **** **** {instance.card_number[-4:]}"
        return data

class DepositSerializer(serializers.Serializer):
    card_id = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=True, min_value=1.0)
