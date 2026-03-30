from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, ReviewCreateView, ReviewListView

urlpatterns = [
    path('', ProjectListCreateView.as_view()),
    path('<slug:slug>/', ProjectDetailView.as_view()),
    path('<int:pk>/review/', ReviewCreateView.as_view()),
    path('<int:pk>/reviews/', ReviewListView.as_view()),
]