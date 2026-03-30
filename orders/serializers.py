from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.username')
    seller_name = serializers.ReadOnlyField(source='seller.username')
    product_title = serializers.ReadOnlyField(source='product.title')
    project_title = serializers.ReadOnlyField(source='project.title')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'client', 'client_name', 'seller', 'seller_name', 
            'product', 'product_title', 'project', 'project_title', 
            'price', 'delivery_time', 'status', 'status_display', 
            'requirements', 'rating', 'feedback', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'client', 'seller', 'price', 'delivery_time', 'created_at', 'updated_at', 'completed_at']
