
from rest_framework import generics, permissions
from .models import ProjectBoard, ReviewBoard
from .serializers import ProjectBoardSerializers, ReviewBoardSerializer
from shared.permissions import IsProfileComplete, IsProfileCompleteOrReadOnly


class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = ProjectBoard.objects.filter(is_published=True, is_active=True)
    serializer_class = ProjectBoardSerializers
    permission_classes = [IsProfileCompleteOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectBoard.objects.all()
    serializer_class = ProjectBoardSerializers
    lookup_field = 'slug'

    def get_object(self):
        obj = super().get_object()
        obj.views_count += 1
        obj.save(update_fields=['views_count'])
        return obj


class ReviewCreateView(generics.CreateAPIView):
    queryset = ReviewBoard.objects.all()
    serializer_class = ReviewBoardSerializer
    permission_classes = [IsProfileComplete]

    def perform_create(self, serializer):
        product_id = self.kwargs.get('pk')
        product = ProjectBoard.objects.get(id=product_id)

        serializer.save(
            user=self.request.user,
            product=product
        )


class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewBoardSerializer

    def get_queryset(self):
        product_id = self.kwargs.get('pk')
        return ReviewBoard.objects.filter(product_id=product_id)