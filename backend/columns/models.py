from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator
from boards.models import Board
from core.validators import validate_no_special_chars

# Create your models here.

class Column(models.Model):
    board = models.ForeignKey(
        Board,
        on_delete=models.CASCADE,
        related_name='columns'
    )
    name = models.CharField(
        max_length=50,
        validators=[
            MinLengthValidator(1, 'Column name cannot be empty.'),
            MaxLengthValidator(50, 'Column name cannot exceed 50 characters.'),
            validate_no_special_chars,
        ]
    )
    position = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0, 'Position cannot be negative.')]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']
        indexes = [
            models.Index(fields=['board', 'position']),
        ]
        unique_together = ['board', 'name']

    def __str__(self):
        return f"{self.board.name} - {self.name}"

    def clean(self):
        self.name = self.name.strip()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)