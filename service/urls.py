from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailView, ReviewCreateView, ReviewListView,
    MyProjectListView, AdminProjectListView, ApproveProjectView
)

urlpatterns = [
    path('', ProjectListCreateView.as_view()),
    path('my-projects/', MyProjectListView.as_view()),
    path('admin-list/', AdminProjectListView.as_view()),
    path('approve/<int:pk>/', ApproveProjectView.as_view()),
    path('<int:pk>/', ProjectDetailView.as_view()),
    path('<slug:slug>/', ProjectDetailView.as_view()),
    path('<int:pk>/review/', ReviewCreateView.as_view()),
    path('<int:pk>/reviews/', ReviewListView.as_view()),
]