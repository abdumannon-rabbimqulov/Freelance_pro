from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.username')
    seller_name = serializers.ReadOnlyField(source='seller.username')

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'client', 'seller', 'price', 'delivery_time', 'created_at', 'updated_at', 'completed_at']
