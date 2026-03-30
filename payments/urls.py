from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlatformSettingView, TransactionListView, PayoutRequestViewSet, CardViewSet, DepositView, AdminStatsView

router = DefaultRouter()
router.register(r'payouts', PayoutRequestViewSet, basename='payout')
router.register(r'cards', CardViewSet, basename='card')

urlpatterns = [
    path('', include(router.urls)),
    path('settings/', PlatformSettingView.as_view(), name='platform-settings'),
    path('transactions/', TransactionListView.as_view(), name='user-transactions'),
    path('deposit/', DepositView.as_view(), name='deposit-balance'),
    path('admin-stats/', AdminStatsView.as_view(), name='admin-stats'),
]
