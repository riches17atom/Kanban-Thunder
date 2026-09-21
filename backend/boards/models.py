import secrets
import uuid
from django.utils.text import slugify
from django.db import models
from django.conf import settings
from django.core.validators import MinLengthValidator, MaxLengthValidator
from core.validators import validate_no_special_chars

# Create your models here.

class Board(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='boards'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='joined_boards',
        blank=True
    )
    invite_token = models.CharField(
        max_length=64,
        unique=True,
        null=True,
        blank=True
    )
    slug = models.SlugField(
        max_length=150,
        unique=True,
        null=True,
        blank=True
    )
    name = models.CharField(
        max_length=100,
        validators=[
            MinLengthValidator(1, 'Board name cannot be empty.'),
            MaxLengthValidator(100, 'Board name cannot exceed 100 characters.'),
            validate_no_special_chars,
        ]
    )
    description = models.TextField(
        blank=True,
        max_length=500,
        validators=[MaxLengthValidator(500, 'Description cannot exceed 500 characters.')]
    )
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'is_archived']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        self.name = self.name.strip()
        if self.description:
            self.description = self.description.strip()

    def save(self, *args, **kwargs):
        if not self.invite_token:
            self.invite_token = secrets.token_urlsafe(16)
        
        slugified_name = slugify(self.name) or "board"
        if not self.id:
            # Creation
            self.slug = f"{slugified_name}-{uuid.uuid4().hex[:8]}"
        else:
            # Update (or data migration)
            if not self.slug:
                # Populate if empty
                self.slug = f"{slugified_name}-{uuid.uuid4().hex[:8]}"
            else:
                try:
                    orig = Board.objects.get(pk=self.pk)
                    if orig.name != self.name:
                        # Name changed, update slug but preserve suffix
                        parts = self.slug.split('-')
                        suffix = parts[-1] if len(parts) > 1 and len(parts[-1]) == 8 else uuid.uuid4().hex[:8]
                        self.slug = f"{slugified_name}-{suffix}"
                except Board.DoesNotExist:
                    # In case of custom id creation
                    self.slug = f"{slugified_name}-{uuid.uuid4().hex[:8]}"

        self.full_clean()
        super().save(*args, **kwargs)