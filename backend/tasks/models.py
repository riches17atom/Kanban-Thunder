from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
from columns.models import Column
from core.validators import validate_no_special_chars

# Create your models here.
class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    column = models.ForeignKey(
        Column,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    title = models.CharField(
        max_length=200,
        validators=[
            MinLengthValidator(1, 'Task title cannot be empty.'),
            MaxLengthValidator(200, 'Task title cannot exceed 200 characters.'),
            validate_no_special_chars,
        ]
    )
    description = models.TextField(
        blank=True,
        max_length=2000,
        validators=[MaxLengthValidator(2000, 'Description cannot exceed 2000 characters.')]
    )
    position = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0, 'Position cannot be negative.')]
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    due_date = models.DateField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']
        indexes = [
            models.Index(fields=['column', 'position']),
            models.Index(fields=['column', 'is_archived']),
            models.Index(fields=['due_date']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return self.title

    def clean(self):
        self.title = self.title.strip()
        if self.description:
            self.description = self.description.strip()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class TaskNote(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='task_notes'
    )
    content = models.TextField(
        validators=[
            MinLengthValidator(1, 'Note content cannot be empty.'),
            MaxLengthValidator(1000, 'Note content cannot exceed 1000 characters.')
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['task', 'created_at']),
        ]

    def __str__(self):
        return f"Note by {self.author.email} on Task {self.task.id}"