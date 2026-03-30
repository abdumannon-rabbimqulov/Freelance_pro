from rest_framework import serializers
from .models import ProjectBoard, ReviewBoard, ProjectImage, Proposal


class ReviewBoardSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    class Meta:
        model = ReviewBoard
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'created_at']

class ProjectBoardSerializers(serializers.ModelSerializer):
    reviews = ReviewBoardSerializer(many=True, read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    slug = serializers.SlugField(read_only=True)
    seller = serializers.StringRelatedField(read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    class Meta:
        model=ProjectBoard
        fields=('id', 'seller', 'slug', 'title', 'category', 'description', 'full_description',
                'price_standard', 'published_at', 'is_published',
                'delivery_standard', 'revisions_standard',
                'main_image', 'views_count', 'orders_count',
                'is_active', 'created_at', 'average_rating', 'reviews', 'images'
                )
        read_only_fields = ['views_count', 'orders_count', 'created_at']
        extra_kwargs = {
            'main_image': {'required': False, 'allow_null': True},
            'delivery_standard': {'required': False, 'allow_null': True},
            'revisions_standard': {'required': False, 'allow_null': True},
            'price_standard': {'required': False, 'allow_null': True},
        }

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return sum([r.rating for r in reviews]) / reviews.count()
        return 0


class ProposalSerializer(serializers.ModelSerializer):
    seller_name = serializers.ReadOnlyField(source='seller.username')
    project_title = serializers.ReadOnlyField(source='project.title')
    seller_completed_orders = serializers.ReadOnlyField(source='seller.completed_orders_count')
    seller_cancelled_orders = serializers.ReadOnlyField(source='seller.cancelled_orders_count')

    class Meta:
        model = Proposal
        fields = [
            'id', 'project', 'project_title', 'seller', 'seller_name', 
            'seller_completed_orders', 'seller_cancelled_orders',
            'price', 'delivery_time', 'description', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'seller', 'status', 'created_at']