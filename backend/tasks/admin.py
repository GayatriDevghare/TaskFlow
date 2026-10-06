from django.contrib import admin
from .models import Category, Task


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "color", "created_at")
    search_fields = ("name", "user__username", "user__email")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "user",
        "priority",
        "status",
        "due_date",
        "created_at",
    )
    list_filter = ("priority", "status", "due_date")
    search_fields = ("title", "description", "user__username", "user__email")