from django.urls import path

from .views import (
    TaskListCreateView,
    TaskDetailView,
    CategoryListCreateView,
    CategoryDetailView,
    TaskSummaryView,
)

urlpatterns = [
    path("", TaskListCreateView.as_view(), name="task-list-create"),
    path("summary/", TaskSummaryView.as_view(), name="task-summary"),
    path("<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("categories/", CategoryListCreateView.as_view(), name="category-list"),
    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),
]