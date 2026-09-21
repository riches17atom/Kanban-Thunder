from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db import transaction, models
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .models import Task, TaskNote
from .serializers import (
    TaskSerializer,
    TaskCreateSerializer,
    TaskUpdateSerializer,
    TaskMoveSerializer,
    TaskReorderSerializer,
    TaskBulkMoveSerializer,
    TaskNoteSerializer
)
from django.db.models import Q
from columns.models import Column
from core.utils import api_response
from core.permissions import IsOwner, IsOwnerOrMember
# Create your views here.

@extend_schema_view(
    list=extend_schema(
        tags=['Tasks'],
        summary='List tasks',
        description='Get all tasks. Filter by column, board, or priority using query parameters.',
        parameters=[
            OpenApiParameter(
                name='column',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Filter tasks by column ID',
                required=False,
            ),
            OpenApiParameter(
                name='board',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Filter tasks by board ID',
                required=False,
            ),
            OpenApiParameter(
                name='priority',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter tasks by priority (low, medium, high)',
                required=False,
            ),
        ],
        responses={
            200: OpenApiResponse(description='Tasks retrieved successfully'),
        }
    ),
    retrieve=extend_schema(
        tags=['Tasks'],
        summary='Get task details',
        description='Get detailed information about a specific task.',
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Task ID',
            ),
        ],
        responses={
            200: OpenApiResponse(description='Task details retrieved successfully'),
            404: OpenApiResponse(description='Task not found'),
        }
    ),
    create=extend_schema(
        tags=['Tasks'],
        summary='Create task',
        description='Create a new task in a column.',
        request=TaskCreateSerializer,
        responses={
            201: OpenApiResponse(description='Task created successfully'),
            400: OpenApiResponse(description='Validation error'),
        },
        examples=[
            OpenApiExample(
                'Create Task',
                value={
                    'column': 1,
                    'title': 'Implement login',
                    'description': 'Add JWT authentication',
                    'priority': 'high',
                    'due_date': '2024-12-31'
                },
                request_only=True,
            ),
        ]
    ),
    update=extend_schema(
        tags=['Tasks'],
        summary='Update task',
        description='Update task details.',
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Task ID',
            ),
        ],
        request=TaskUpdateSerializer,
        responses={
            200: OpenApiResponse(description='Task updated successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Task not found'),
        }
    ),
    partial_update=extend_schema(
        tags=['Tasks'],
        summary='Partially update task',
        description='Partially update task fields.',
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Task ID',
            ),
        ],
        request=TaskUpdateSerializer,
        responses={
            200: OpenApiResponse(description='Task updated successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Task not found'),
        }
    ),
    destroy=extend_schema(
        tags=['Tasks'],
        summary='Delete task',
        description='Soft delete a task. The task can be recovered later.',
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Task ID',
            ),
        ],
        responses={
            200: OpenApiResponse(description='Task deleted successfully'),
            404: OpenApiResponse(description='Task not found'),
        }
    ),
)
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrMember]
    lookup_field = 'pk'

    def get_queryset(self):
    # Handle schema generation
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Task.objects.none()
    
        queryset = Task.objects.filter(
            Q(column__board__owner=self.request.user) | Q(column__board__members=self.request.user),
            column__board__is_archived=False,
            is_archived=False
        ).distinct().select_related('column', 'column__board')
    
        column_id = self.request.query_params.get('column')
        if column_id:
            queryset = queryset.filter(column_id=column_id)
        
        board_id = self.request.query_params.get('board')
        if board_id:
            queryset = queryset.filter(column__board_id=board_id)
        
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.order_by('position')
        
       

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        if self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        if self.action == 'move':
            return TaskMoveSerializer
        if self.action == 'reorder':
            return TaskReorderSerializer
        if self.action == 'bulk_move':
            return TaskBulkMoveSerializer
        return TaskSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            data=serializer.data,
            meta={"count": queryset.count()}
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        column = serializer.validated_data['column']
        max_position = Task.objects.filter(column=column, is_archived=False).count()
        task = serializer.save(position=max_position)
        
        return api_response(
            data=TaskSerializer(task).data,
            meta={"message": "Task created successfully"},
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(
            data=TaskSerializer(instance).data,
            meta={"message": "Task updated successfully"}
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        column = instance.column
        position = instance.position
        
        instance.is_archived = True
        instance.save()
        
        Task.objects.filter(
            column=column,
            position__gt=position,
            is_archived=False
        ).update(position=models.F('position') - 1)
        
        return api_response(
            meta={"message": "Task deleted successfully"},
            status=status.HTTP_200_OK
        )

    @extend_schema(
        tags=['Tasks'],
        summary='Move task',
        description='Move a task to a different column and/or position.',
        parameters=[
            OpenApiParameter(
                name='pk',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Task ID',
            ),
        ],
        request=TaskMoveSerializer,
        responses={
            200: OpenApiResponse(description='Task moved successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Task or column not found'),
        },
        examples=[
            OpenApiExample(
                'Move Task',
                value={'column': 2, 'position': 0},
                request_only=True,
            ),
        ]
    )
    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        task = self.get_object()
        serializer = TaskMoveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        target_column_id = serializer.validated_data['column']
        new_position = serializer.validated_data['position']
        
        try:
            target_column = Column.objects.get(
                Q(board__owner=request.user) | Q(board__members=request.user),
                id=target_column_id,
                board__is_archived=False
            )
        except Column.DoesNotExist:
            return api_response(
                errors=[{"field": "column", "detail": "Target column not found or you don't have access."}],
                status=status.HTTP_404_NOT_FOUND
            )
        
        if task.column.board_id != target_column.board_id:
            return api_response(
                errors=[{"detail": "Cannot move task to a column in a different board."}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_column = task.column
        old_position = task.position
        
        max_position = Task.objects.filter(column=target_column, is_archived=False).count()
        if old_column.id != target_column.id:
            max_position += 1
        
        if new_position > max_position:
            new_position = max_position
        
        with transaction.atomic():
            if old_column.id == target_column.id:
                if new_position > old_position:
                    Task.objects.filter(
                        column=old_column,
                        position__gt=old_position,
                        position__lte=new_position,
                        is_archived=False
                    ).update(position=models.F('position') - 1)
                elif new_position < old_position:
                    Task.objects.filter(
                        column=old_column,
                        position__gte=new_position,
                        position__lt=old_position,
                        is_archived=False
                    ).update(position=models.F('position') + 1)
            else:
                Task.objects.filter(
                    column=old_column,
                    position__gt=old_position,
                    is_archived=False
                ).update(position=models.F('position') - 1)
                
                Task.objects.filter(
                    column=target_column,
                    position__gte=new_position,
                    is_archived=False
                ).update(position=models.F('position') + 1)
            
            task.column = target_column
            task.position = new_position
            task.save()
        
        return api_response(
            data=TaskSerializer(task).data,
            meta={"message": "Task moved successfully"}
        )

    @extend_schema(
        tags=['Tasks'],
        summary='Reorder tasks',
        description='Reorder tasks within a column by providing a list of task IDs in the new order.',
        request=TaskReorderSerializer,
        responses={
            200: OpenApiResponse(description='Tasks reordered successfully'),
            400: OpenApiResponse(description='Validation error'),
        },
        examples=[
            OpenApiExample(
                'Reorder Tasks',
                value={'task_ids': [5, 3, 8, 1]},
                request_only=True,
            ),
        ]
    )
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        serializer = TaskReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        task_ids = serializer.validated_data['task_ids']
        
        tasks = Task.objects.filter(
            Q(column__board__owner=request.user) | Q(column__board__members=request.user),
            id__in=task_ids,
            is_archived=False
        ).distinct()
        
        if tasks.count() != len(task_ids):
            return api_response(
                errors=[{"detail": "One or more task IDs are invalid."}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        columns = set(tasks.values_list('column_id', flat=True))
        if len(columns) > 1:
            return api_response(
                errors=[{"detail": "All tasks must belong to the same column."}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            for index, task_id in enumerate(task_ids):
                Task.objects.filter(id=task_id).update(position=index)
        
        return api_response(
            meta={"message": "Tasks reordered successfully"}
        )

    @extend_schema(
        tags=['Tasks'],
        summary='Bulk move tasks',
        description='Move multiple tasks to a different column.',
        request=TaskBulkMoveSerializer,
        responses={
            200: OpenApiResponse(description='Tasks moved successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Column not found'),
        },
        examples=[
            OpenApiExample(
                'Bulk Move Tasks',
                value={'task_ids': [1, 2, 3], 'column': 2},
                request_only=True,
            ),
        ]
    )
    @action(detail=False, methods=['post'])
    def bulk_move(self, request):
        serializer = TaskBulkMoveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        task_ids = serializer.validated_data['task_ids']
        target_column_id = serializer.validated_data['column']
        
        try:
            target_column = Column.objects.get(
                Q(board__owner=request.user) | Q(board__members=request.user),
                id=target_column_id,
                board__is_archived=False
            )
        except Column.DoesNotExist:
            return api_response(
                errors=[{"field": "column", "detail": "Target column not found or you don't have access."}],
                status=status.HTTP_404_NOT_FOUND
            )
        
        tasks = Task.objects.filter(
            Q(column__board__owner=request.user) | Q(column__board__members=request.user),
            id__in=task_ids,
            is_archived=False
        ).distinct()
        
        if tasks.count() != len(task_ids):
            return api_response(
                errors=[{"detail": "One or more task IDs are invalid."}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task_boards = set(tasks.values_list('column__board_id', flat=True))
        if target_column.board_id not in task_boards or len(task_boards) > 1:
            return api_response(
                errors=[{"detail": "All tasks must belong to the same board as the target column."}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        current_max_position = Task.objects.filter(
            column=target_column,
            is_archived=False
        ).count()
        
        with transaction.atomic():
            for index, task_id in enumerate(task_ids):
                Task.objects.filter(id=task_id).update(
                    column=target_column,
                    position=current_max_position + index
                )
        
        return api_response(
            meta={"message": f"{len(task_ids)} tasks moved successfully"}
        )

    @action(detail=True, methods=['post', 'get'], url_path='notes')
    def notes(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            notes = task.notes.all()
            serializer = TaskNoteSerializer(notes, many=True, context={'request': request})
            return api_response(data=serializer.data)
        
        # POST
        serializer = TaskNoteSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        note = serializer.save(task=task, author=request.user)
        return api_response(
            data=TaskNoteSerializer(note, context={'request': request}).data,
            meta={"message": "Note added successfully"},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['delete'], url_path='notes/(?P<note_id>[^/.]+)')
    def delete_note(self, request, pk=None, note_id=None):
        task = self.get_object()
        try:
            note = task.notes.get(id=note_id)
        except TaskNote.DoesNotExist:
            return api_response(
                errors=[{"detail": "Note not found."}],
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is the author of the note or the owner of the board
        if note.author != request.user and task.column.board.owner != request.user:
            return api_response(
                errors=[{"detail": "You don't have permission to delete this note."}],
                status=status.HTTP_403_FORBIDDEN
            )
            
        note.delete()
        return api_response(meta={"message": "Note deleted successfully"})