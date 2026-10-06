from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.filter(
            user=self.request.user
        ).select_related("category")

        params = self.request.query_params

        search = params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
            )

        status = params.get("status")
        if status:
            queryset = queryset.filter(status=status)

        priority = params.get("priority")
        if priority:
            queryset = queryset.filter(priority=priority)

        category = params.get("category")
        if category:
            queryset = queryset.filter(category_id=category)

        ordering = params.get("ordering", "-created_at")
        allowed_ordering = {
            "created_at", "-created_at",
            "due_date", "-due_date",
            "priority", "-priority",
            "title", "-title",
        }

        if ordering not in allowed_ordering:
            raise ValidationError({
                "ordering": "Unsupported ordering value."
            })

        return queryset.order_by(ordering)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(
            user=self.request.user
        ).select_related("category")

    def perform_update(self, serializer):
        task = serializer.save()

        if task.status == Task.Status.COMPLETED:
            if not task.completed_at:
                task.completed_at = timezone.now()
                task.save(update_fields=["completed_at"])
        elif task.completed_at:
            task.completed_at = None
            task.save(update_fields=["completed_at"])


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            user=self.request.user
        )


class TaskSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.filter(user=request.user)
        today = timezone.localdate()

        return Response({
            "total": tasks.count(),
            "completed": tasks.filter(
                status=Task.Status.COMPLETED
            ).count(),
            "pending": tasks.filter(
                status=Task.Status.TODO
            ).count(),
            "in_progress": tasks.filter(
                status=Task.Status.IN_PROGRESS
            ).count(),
            "overdue": tasks.filter(
                due_date__lt=today
            ).exclude(
                status=Task.Status.COMPLETED
            ).count(),
            "today": tasks.filter(
                due_date=today
            ).exclude(
                status=Task.Status.COMPLETED
            ).count(),
        })