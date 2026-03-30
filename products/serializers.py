from rest_framework import serializers
from .models import *

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']



class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class ProductSerializers(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    slug = serializers.SlugField(read_only=True)
    seller = serializers.StringRelatedField(read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'seller', 'category',
            'description', 'full_description', 'price_standard',
            'delivery_time_standard', 'revisions_standard',
            'main_image', 'views_count', 'orders_count',
            'is_active', 'created_at','average_rating','reviews'
        ]
        read_only_fields = ['views_count', 'orders_count',  'created_at']


    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return sum([r.rating for r in reviews]) / reviews.count()
        return 0

    def create(self, validated_data):

            return super().create(validated_data)



class ReviewCreateSerializers(serializers.ModelSerializer):
    class Meta:
        model=Review
        fields=('rating','comment')

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Reyting 1 dan 5 gacha bo'lishi kerak!")
        return value



class MessageStartSerializers(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model=Messages
        fields=('created_at','image','text','is_read')

class MessageSerializers(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model=Messages
        fields=('created_at','image','text','is_read')


from rest_framework import serializers

class ChatListSerializer(serializers.ModelSerializer):
    recipient_username = serializers.SerializerMethodField()
    last_message_text = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'recipient_username', 'last_message_text', 'last_message_time']

    def get_recipient_username(self, obj):
        request_user = self.context.get('request').user
        recipient = obj.get_recipient(request_user)
        return recipient.username if recipient else "Noma'lum foydalanuvchi"

    def get_last_message_text(self, obj):
        last_msg = obj.last_message()
        return last_msg.text if last_msg else "Xabarlar yo'q"

    def get_last_message_time(self, obj):
        last_msg = obj.last_message()
        return last_msg.created_at if last_msg else None
