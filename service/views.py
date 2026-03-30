from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import ProjectBoard, ReviewBoard, ProjectImage
from .serializers import ProjectBoardSerializers, ReviewBoardSerializer
from shared.permissions import IsProfileComplete, IsProfileCompleteOrReadOnly


from django.db.models import Q

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectBoardSerializers
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # O'zining ishlari yoki tasdiqlangan boshqa ishlar
            queryset = ProjectBoard.objects.filter(Q(is_active=True) | Q(seller=user))
        else:
            queryset = ProjectBoard.objects.filter(is_active=True)
            
        queryset = queryset.order_by('-created_at')
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def perform_create(self, serializer):
        project = serializer.save(seller=self.request.user, is_active=False)
        
        # Galereya rasmlarini (max 5) saqlash
        images = self.request.FILES.getlist('images')
        for img in images[:5]:
            ProjectImage.objects.create(project=project, image=img)


class MyProjectListView(generics.ListAPIView):
    serializer_class = ProjectBoardSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProjectBoard.objects.filter(seller=self.request.user)


class AdminProjectListView(generics.ListAPIView):
    queryset = ProjectBoard.objects.filter(is_active=False)
    serializer_class = ProjectBoardSerializers
    permission_classes = [IsAdminUser]


class ApproveProjectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            project = ProjectBoard.objects.get(pk=pk)
            project.is_active = True
            project.save()
            return Response({"message": "Loyiha muvaffaqiyatli tasdiqlandi!"}, status=status.HTTP_200_OK)
        except ProjectBoard.DoesNotExist:
            return Response({"error": "Loyiha topilmadi!"}, status=status.HTTP_404_NOT_FOUND)


from shared.permissions import IsProfileCompleteOrReadOnly, IsOwnerOrReadOnly

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectBoard.objects.all()
    serializer_class = ProjectBoardSerializers
    permission_classes = [IsProfileCompleteOrReadOnly, IsOwnerOrReadOnly]

    def get_object(self):
        # Ham ID (pk) ham Slug orqali qidirish imkoniyati
        queryset = self.filter_queryset(self.get_queryset())
        
        # URL dan pk yoki slug ni olish
        pk = self.kwargs.get('pk')
        slug = self.kwargs.get('slug')
        
        if pk:
            obj = generics.get_object_or_404(queryset, pk=pk)
        else:
            obj = generics.get_object_or_404(queryset, slug=slug)
            
        self.check_object_permissions(self.request, obj)
        
        # Ko'rishlar sonini oshirish
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