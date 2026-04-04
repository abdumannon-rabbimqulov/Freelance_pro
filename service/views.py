from rest_framework import generics, permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from .models import ProjectBoard, ReviewBoard, ProjectImage, Proposal
from .serializers import ProjectBoardSerializers, ReviewBoardSerializer, ProposalSerializer
from shared.permissions import IsProfileComplete, IsProfileCompleteOrReadOnly, IsOwnerOrReadOnly
from orders.utils import process_order_escrow, create_order_with_notifications


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


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectBoard.objects.all()
    serializer_class = ProjectBoardSerializers
    permission_classes = [IsProfileCompleteOrReadOnly, IsOwnerOrReadOnly]

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        pk = self.kwargs.get('pk')
        slug = self.kwargs.get('slug')
        
        if pk:
            obj = generics.get_object_or_404(queryset, pk=pk)
        else:
            obj = generics.get_object_or_404(queryset, slug=slug)
            
        self.check_object_permissions(self.request, obj)
        
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


class ProposalViewSet(viewsets.ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Proposal.objects.filter(
            Q(seller=user) | Q(project__seller=user)
        ).distinct()

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if project.seller == self.request.user:
            raise ValidationError({"error": "O'zingizning e'loningizga taklif bera olmaysiz."})
        
        if Proposal.objects.filter(project=project, seller=self.request.user, status='pending').exists():
            raise ValidationError({"error": "Siz ushbu loyihaga allaqachon taklif yuborgansiz."})

        serializer.save(seller=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        proposal = self.get_object()
        project = proposal.project

        if request.user != project.seller:
            return Response({"error": "Faqat loyiha egasi taklifni qabul qilishi mumkin."}, status=403)
        
        if proposal.status != 'pending':
            return Response({"error": "Ushbu taklifni qabul qilib bo'lmaydi."}, status=400)

        from django.db import transaction
        try:
            with transaction.atomic():
                # Lock necessary records
                proposal = Proposal.objects.select_for_update().get(id=pk)
                project = ProjectBoard.objects.select_for_update().get(id=proposal.project.id)

                if proposal.status != 'pending':
                    return Response({"error": "Ushbu taklif allaqachon ko'rib chiqilgan."}, status=400)

                desc = f"Loyihaga kelib tushgan taklif qabul qilindi ({project.title})"
                process_order_escrow(request.user, proposal.price, desc)

                order = create_order_with_notifications(
                    client=request.user,
                    seller=proposal.seller,
                    price=proposal.price,
                    delivery_time=proposal.delivery_time,
                    requirements=proposal.description,
                    project=project
                )

                # Update statuses
                proposal.status = 'accepted'
                proposal.save()

                # Hide the project and reject others
                project.is_active = False
                project.save()
                project.proposals.filter(status='pending').exclude(id=proposal.id).update(status='rejected')
                
                return Response({
                    "message": "Taklif qabul qilindi, buyurtma yaratildi va loyiha yopildi!", 
                    "order_id": order.id
                })
        except Exception as e:
            return Response({"error": str(e)}, status=400)