from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from django.utils import timezone
from django.contrib.auth import get_user_model
from accounts.serializers import UserSerializer
from .models import Task, TaskNote
from columns.models import Column


class TaskNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_email = serializers.ReadOnlyField(source='author.email')
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = TaskNote
        fields = ['id', 'content', 'author_name', 'author_email', 'is_author', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    @extend_schema_field(OpenApiTypes.STR)
    def get_author_name(self, obj) -> str:
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.email

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_author(self, obj) -> bool:
        request = self.context.get('request')
        return request.user == obj.author if request else False

    def validate_content(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Note content cannot be empty.")
        if len(value) > 1000:
            raise serializers.ValidationError("Note content cannot exceed 1000 characters.")
        return value


class TaskSerializer(serializers.ModelSerializer):
    column_name = serializers.ReadOnlyField(source='column.name')
    board_id = serializers.ReadOnlyField(source='column.board.id')
    board_name = serializers.ReadOnlyField(source='column.board.name')
    is_overdue = serializers.SerializerMethodField()
    assignee = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        source='assignee',
        write_only=True,
        required=False,
        allow_null=True
    )
    notes = TaskNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'column',
            'column_name',
            'board_id',
            'board_name',
            'title',
            'description',
            'position',
            'priority',
            'due_date',
            'is_overdue',
            'is_archived',
            'assignee',
            'assignee_id',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'position', 'is_archived', 'created_at', 'updated_at']

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_overdue(self, obj) -> bool:
        if obj.due_date and not obj.is_archived:
            return obj.due_date < timezone.now().date()
        return False

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Task title cannot be empty.")
        if len(value) > 200:
            raise serializers.ValidationError("Task title cannot exceed 200 characters.")
        return value

    def validate_description(self, value):
        if value and len(value) > 2000:
            raise serializers.ValidationError("Description cannot exceed 2000 characters.")
        return value.strip() if value else ''

    def validate_priority(self, value):
        valid_priorities = ['low', 'medium', 'high']
        if value not in valid_priorities:
            raise serializers.ValidationError(f"Priority must be one of: {', '.join(valid_priorities)}")
        return value

    def validate_column(self, value):
        request = self.context.get('request')
        if request:
            is_owner = value.board.owner == request.user
            is_member = value.board.members.filter(id=request.user.id).exists()
            if not (is_owner or is_member):
                raise serializers.ValidationError("You don't have permission to add tasks to this column.")
        if value.board.is_archived:
            raise serializers.ValidationError("Cannot add tasks to an archived board.")
        return value


class TaskCreateSerializer(serializers.ModelSerializer):
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = ['column', 'title', 'description', 'priority', 'due_date', 'assignee']

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Task title cannot be empty.")
        if len(value) > 200:
            raise serializers.ValidationError("Task title cannot exceed 200 characters.")
        return value

    def validate_description(self, value):
        if value and len(value) > 2000:
            raise serializers.ValidationError("Description cannot exceed 2000 characters.")
        return value.strip() if value else ''

    def validate_priority(self, value):
        valid_priorities = ['low', 'medium', 'high']
        if value not in valid_priorities:
            raise serializers.ValidationError(f"Priority must be one of: {', '.join(valid_priorities)}")
        return value

    def validate_column(self, value):
        request = self.context.get('request')
        if request:
            is_owner = value.board.owner == request.user
            is_member = value.board.members.filter(id=request.user.id).exists()
            if not (is_owner or is_member):
                raise serializers.ValidationError("You don't have permission to add tasks to this column.")
        if value.board.is_archived:
            raise serializers.ValidationError("Cannot add tasks to an archived board.")
        return value

    def validate(self, data):
        column = data.get('column')
        assignee = data.get('assignee')
        if column:
            task_count = Task.objects.filter(column=column, is_archived=False).count()
            if task_count >= 100:
                raise serializers.ValidationError({"column": "A column cannot have more than 100 tasks."})
            if assignee:
                board = column.board
                is_owner = board.owner == assignee
                is_member = board.members.filter(id=assignee.id).exists()
                if not (is_owner or is_member):
                    raise serializers.ValidationError({"assignee": "Assignee must be a member or owner of the board."})
        return data


class TaskUpdateSerializer(serializers.ModelSerializer):
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = ['title', 'description', 'priority', 'due_date', 'assignee']

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Task title cannot be empty.")
        if len(value) > 200:
            raise serializers.ValidationError("Task title cannot exceed 200 characters.")
        return value

    def validate_description(self, value):
        if value and len(value) > 2000:
            raise serializers.ValidationError("Description cannot exceed 2000 characters.")
        return value.strip() if value else ''

    def validate_priority(self, value):
        valid_priorities = ['low', 'medium', 'high']
        if value not in valid_priorities:
            raise serializers.ValidationError(f"Priority must be one of: {', '.join(valid_priorities)}")
        return value

    def validate(self, data):
        assignee = data.get('assignee')
        if assignee and self.instance:
            board = self.instance.column.board
            is_owner = board.owner == assignee
            is_member = board.members.filter(id=assignee.id).exists()
            if not (is_owner or is_member):
                raise serializers.ValidationError({"assignee": "Assignee must be a member or owner of the board."})
        return data


class TaskMoveSerializer(serializers.Serializer):
    column = serializers.IntegerField(
        min_value=1,
        help_text="Target column ID"
    )
    position = serializers.IntegerField(
        min_value=0,
        help_text="New position in the column (0-indexed)"
    )


class TaskReorderSerializer(serializers.Serializer):
    task_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
        max_length=100,
        help_text="List of task IDs in new order"
    )

    def validate_task_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Duplicate task IDs are not allowed.")
        return value


class TaskBulkMoveSerializer(serializers.Serializer):
    task_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
        max_length=50,
        help_text="List of task IDs to move"
    )
    column = serializers.IntegerField(
        min_value=1,
        help_text="Target column ID"
    )

    def validate_task_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Duplicate task IDs are not allowed.")
        return value