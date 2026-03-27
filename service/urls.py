from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    ReviewCreateView,
    ReviewListView
)

urlpatterns = [
    path('projects/', ProjectListCreateView.as_view()),
    path('projects/<slug:slug>/', ProjectDetailView.as_view()),

    path('projects/<int:pk>/reviews/', ReviewListView.as_view()),
    path('projects/<int:pk>/reviews/create/', ReviewCreateView.as_view()),
]