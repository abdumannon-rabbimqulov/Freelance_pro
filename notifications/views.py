from rest_framework import viewsets, permissions
from .models import Notification
from .serializers import NotificationSerializer
from shared.permissions import IsProfileComplete

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsProfileComplete]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
