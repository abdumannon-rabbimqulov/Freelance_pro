from rest_framework import serializers
from .models import Product,Category,ProductImage,Review

class ProductSerializers(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)
    seller = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'seller', 'category',
            'description', 'full_description', 'price_standard',
            'delivery_time_standard', 'revisions_standard',
            'main_image', 'views_count', 'orders_count',
            'reviews_count', 'is_active', 'created_at'
        ]
        read_only_fields = ['views_count', 'orders_count', 'reviews_count', 'created_at']

        def create(self, validated_data):

            return super().create(validated_data)