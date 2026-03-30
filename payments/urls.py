from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlatformSettingView, TransactionListView, PayoutRequestViewSet

router = DefaultRouter()
router.register(r'payouts', PayoutRequestViewSet, basename='payout')

urlpatterns = [
    path('', include(router.urls)),
    path('settings/', PlatformSettingView.as_view(), name='platform-settings'),
    path('transactions/', TransactionListView.as_view(), name='user-transactions'),
]
