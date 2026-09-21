from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from accounts.serializers import UserSerializer
from .models import Board


class BoardSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.email')
    owner_id = serializers.ReadOnlyField(source='owner.id')
    owner_name = serializers.SerializerMethodField()
    members = UserSerializer(many=True, read_only=True)
    columns_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = [
            'id',
            'slug',
            'name',
            'description',
            'is_archived',
            'owner',
            'owner_id',
            'owner_name',
            'members',
            'invite_token',
            'columns_count',
            'tasks_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'owner', 'members', 'invite_token', 'is_archived', 'created_at', 'updated_at']

    @extend_schema_field(OpenApiTypes.STR)
    def get_owner_name(self, obj) -> str:
        return f"{obj.owner.first_name} {obj.owner.last_name}".strip() or obj.owner.email

    @extend_schema_field(OpenApiTypes.INT)
    def get_columns_count(self, obj) -> int:
        return obj.columns.count() if hasattr(obj, 'columns') else 0

    @extend_schema_field(OpenApiTypes.INT)
    def get_tasks_count(self, obj) -> int:
        if hasattr(obj, 'columns'):
            return sum(col.tasks.filter(is_archived=False).count() for col in obj.columns.all())
        return 0

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Board name cannot be empty.")
        if len(value) > 100:
            raise serializers.ValidationError("Board name cannot exceed 100 characters.")
        
        user = self.context['request'].user
        existing = Board.objects.filter(owner=user, name__iexact=value, is_archived=False)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError("You already have a board with this name.")
        
        return value

    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Description cannot exceed 500 characters.")
        return value.strip() if value else ''


class BoardDetailSerializer(BoardSerializer):
    columns = serializers.SerializerMethodField()

    class Meta(BoardSerializer.Meta):
        fields = BoardSerializer.Meta.fields + ['columns']

    @extend_schema_field(serializers.ListSerializer(child=serializers.DictField()))
    def get_columns(self, obj):
        from columns.serializers import ColumnWithTasksSerializer
        columns = obj.columns.all().order_by('position')
        return ColumnWithTasksSerializer(columns, many=True).data


class BoardCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['name', 'description']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Board name cannot be empty.")
        if len(value) > 100:
            raise serializers.ValidationError("Board name cannot exceed 100 characters.")
        
        user = self.context['request'].user
        if Board.objects.filter(owner=user, name__iexact=value, is_archived=False).exists():
            raise serializers.ValidationError("You already have a board with this name.")
        
        return value