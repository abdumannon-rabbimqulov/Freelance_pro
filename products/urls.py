from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

router.register(r'products', ProductViewSet, basename='product')

urlpatterns=[
    path('', include(router.urls)),
    path('similar-search/', SimilarProductListView.as_view(), name='similar-product-search'),
    path('product-list/',ProductListView.as_view()),
    path('product/<int:pk>/',ProductDetailView.as_view()),
    path('product-seller-list/',ProductList.as_view())
]