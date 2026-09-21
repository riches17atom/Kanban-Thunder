from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from .models import Column


class ColumnSerializer(serializers.ModelSerializer):
    board_name = serializers.ReadOnlyField(source='board.name')
    tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Column
        fields = [
            'id',
            'board',
            'board_name',
            'name',
            'position',
            'tasks_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'position', 'created_at', 'updated_at']

    @extend_schema_field(OpenApiTypes.INT)
    def get_tasks_count(self, obj) -> int:
        return obj.tasks.filter(is_archived=False).count() if hasattr(obj, 'tasks') else 0

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Column name cannot be empty.")
        if len(value) > 50:
            raise serializers.ValidationError("Column name cannot exceed 50 characters.")
        return value

    def validate_board(self, value):
        request = self.context.get('request')
        if request and value.owner != request.user:
            raise serializers.ValidationError("You don't have permission to add columns to this board.")
        if value.is_archived:
            raise serializers.ValidationError("Cannot add columns to an archived board.")
        return value

    def validate(self, data):
        board = data.get('board') or (self.instance.board if self.instance else None)
        name = data.get('name', '').strip()
        
        if board and name:
            existing = Column.objects.filter(board=board, name__iexact=name)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError({"name": "A column with this name already exists in this board."})
        
        return data


class ColumnWithTasksSerializer(ColumnSerializer):
    tasks = serializers.SerializerMethodField()

    class Meta(ColumnSerializer.Meta):
        fields = ColumnSerializer.Meta.fields + ['tasks']

    @extend_schema_field(serializers.ListSerializer(child=serializers.DictField()))
    def get_tasks(self, obj):
        from tasks.serializers import TaskSerializer
        tasks = obj.tasks.filter(is_archived=False).order_by('position')
        return TaskSerializer(tasks, many=True).data


class ColumnCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = ['board', 'name']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Column name cannot be empty.")
        if len(value) > 50:
            raise serializers.ValidationError("Column name cannot exceed 50 characters.")
        return value

    def validate_board(self, value):
        request = self.context.get('request')
        if request and value.owner != request.user:
            raise serializers.ValidationError("You don't have permission to add columns to this board.")
        if value.is_archived:
            raise serializers.ValidationError("Cannot add columns to an archived board.")
        return value

    def validate(self, data):
        board = data.get('board')
        name = data.get('name', '').strip()
        
        if Column.objects.filter(board=board, name__iexact=name).exists():
            raise serializers.ValidationError({"name": "A column with this name already exists in this board."})
        
        if Column.objects.filter(board=board).count() >= 10:
            raise serializers.ValidationError({"board": "A board cannot have more than 10 columns."})
        
        return data


class ColumnReorderSerializer(serializers.Serializer):
    column_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
        max_length=10,
        help_text="List of column IDs in new order"
    )

    def validate_column_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Duplicate column IDs are not allowed.")
        return value


class ColumnUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = ['name']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Column name cannot be empty.")
        if len(value) > 50:
            raise serializers.ValidationError("Column name cannot exceed 50 characters.")
        
        if self.instance:
            existing = Column.objects.filter(
                board=self.instance.board,
                name__iexact=value
            ).exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError("A column with this name already exists in this board.")
        
        return value