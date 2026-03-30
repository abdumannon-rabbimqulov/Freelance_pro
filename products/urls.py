from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

router.register(r'products', ProductViewSet, basename='product')

urlpatterns=[
    path('', include(router.urls)),
    path('similar-search/', SimilarProductListView.as_view(), name='similar-product-search'),
    path('product-list/',ProductList.as_view()),
    path('admin-product-list/', AdminProductList.as_view(), name='admin-product-list'),
    path('product/<int:pk>/approve/', ApproveProduct.as_view(), name='approve-product'),
    path('categories/',CategoryListView.as_view()),
    path('product/<int:pk>/',ProductDetailView.as_view()),
    path('product-seller-list/',SellerProductList.as_view()),
    path('message-start/<int:pk>/',MessageStart.as_view()),
    path('chat-list/',ChatListView.as_view()),
    path('chat-detail/<int:pk>/',ChatDetailView.as_view()),
]