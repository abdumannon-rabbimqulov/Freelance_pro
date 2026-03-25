from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

router.register(r'products', ProductViewSet, basename='product')

urlpatterns=[
    path('', include(router.urls)),
    path('similar-search/', SimilarProductListView.as_view(), name='similar-product-search'),
]