from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db import transaction
from django.db.models import Q
from django.contrib.auth import get_user_model
import secrets
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .models import Board
from .serializers import BoardSerializer, BoardDetailSerializer, BoardCreateSerializer
from core.utils import api_response
from core.permissions import IsOwner, IsOwnerOrMember
from accounts.serializers import UserSerializer

# Create your views here.

User = get_user_model()

@extend_schema_view(
    list=extend_schema(
        tags=['Boards'],
        summary='List all boards',
        description='Get a list of all boards owned by the authenticated user.',
        responses={
            200: OpenApiResponse(description='List of boards retrieved successfully'),
        }
    ),
    retrieve=extend_schema(
        tags=['Boards'],
        summary='Get board details',
        description='Get detailed information about a specific board including all columns and tasks.',
        parameters=[
            OpenApiParameter(
                name='slug',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description='Board Slug',
            ),
        ],
        responses={
            200: OpenApiResponse(description='Board details retrieved successfully'),
            404: OpenApiResponse(description='Board not found'),
        }
    ),
    create=extend_schema(
        tags=['Boards'],
        summary='Create a new board',
        description='Create a new Kanban board. Default columns (To Do, In Progress, Done) will be created automatically.',
        request=BoardCreateSerializer,
        responses={
            201: OpenApiResponse(description='Board created successfully'),
            400: OpenApiResponse(description='Validation error'),
        },
        examples=[
            OpenApiExample(
                'Create Board',
                value={'name': 'My Project', 'description': 'A board for tracking project tasks'},
                request_only=True,
            ),
        ]
    ),
    update=extend_schema(
        tags=['Boards'],
        summary='Update board',
        description='Update board name and/or description.',
        parameters=[
            OpenApiParameter(
                name='slug',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description='Board Slug',
            ),
        ],
        responses={
            200: OpenApiResponse(description='Board updated successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Board not found'),
        }
    ),
    partial_update=extend_schema(
        tags=['Boards'],
        summary='Partially update board',
        description='Partially update board fields.',
        parameters=[
            OpenApiParameter(
                name='slug',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description='Board Slug',
            ),
        ],
        responses={
            200: OpenApiResponse(description='Board updated successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Board not found'),
        }
    ),
    destroy=extend_schema(
        tags=['Boards'],
        summary='Delete board',
        description='Soft delete a board. The board can be recovered later.',
        parameters=[
            OpenApiParameter(
                name='slug',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description='Board Slug',
            ),
        ],
        responses={
            200: OpenApiResponse(description='Board deleted successfully'),
            404: OpenApiResponse(description='Board not found'),
        }
    ),
)


class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrMember]
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['join_board']:
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Board.objects.none()
    
        return Board.objects.filter(
            Q(owner=self.request.user) | Q(members=self.request.user),
            is_archived=False
        ).distinct().prefetch_related('columns__tasks')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BoardDetailSerializer
        if self.action == 'create':
            return BoardCreateSerializer
        return BoardSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            data=serializer.data,
            meta={"count": queryset.count()}
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = BoardDetailSerializer(instance)
        return api_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        self._create_default_columns(serializer.instance)
        
        return api_response(
            data=BoardDetailSerializer(serializer.instance).data,
            meta={"message": "Board created successfully"},
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if instance.owner != request.user:
            return api_response(
                errors=[{"detail": "Only the board owner can rename or update board settings."}],
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = BoardSerializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(
            data=serializer.data,
            meta={"message": "Board updated successfully"}
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.owner != request.user:
            return api_response(
                errors=[{"detail": "Only the board owner can delete the board."}],
                status=status.HTTP_403_FORBIDDEN
            )
        instance.is_archived = True
        instance.save()
        return api_response(
            meta={"message": "Board deleted successfully"},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='join/(?P<token>[^/.]+)')
    def join_board(self, request, token=None):
        try:
            board = Board.objects.get(invite_token=token, is_archived=False)
        except Board.DoesNotExist:
            return api_response(
                errors=[{"detail": "Invalid or expired invite link."}],
                status=status.HTTP_404_NOT_FOUND
            )
        
        if board.owner == request.user:
            return api_response(
                data=BoardDetailSerializer(board).data,
                meta={"message": "You are the owner of this board."}
            )
            
        if board.members.filter(id=request.user.id).exists():
            return api_response(
                data=BoardDetailSerializer(board).data,
                meta={"message": "You are already a member of this board."}
            )
            
        board.members.add(request.user)
        return api_response(
            data=BoardDetailSerializer(board).data,
            meta={"message": "Successfully joined the board!"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='members')
    def add_member(self, request, slug=None, **kwargs):
        board = self.get_object()
        if board.owner != request.user:
            return api_response(
                errors=[{"detail": "Only the board owner can add members."}],
                status=status.HTTP_403_FORBIDDEN
            )
            
        email = request.data.get('email', '').strip()
        if not email:
            return api_response(
                errors=[{"field": "email", "detail": "Email is required."}],
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user_to_add = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return api_response(
                errors=[{"field": "email", "detail": "User with this email not found in system."}],
                status=status.HTTP_404_NOT_FOUND
            )
            
        if board.owner == user_to_add:
            return api_response(
                errors=[{"detail": "User is the owner of this board."}],
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if board.members.filter(id=user_to_add.id).exists():
            return api_response(
                errors=[{"detail": "User is already a member of this board."}],
                status=status.HTTP_400_BAD_REQUEST
            )
            
        board.members.add(user_to_add)
        return api_response(
            data=UserSerializer(user_to_add).data,
            meta={"message": f"Added {user_to_add.first_name} {user_to_add.last_name} to the board."}
        )

    @action(detail=True, methods=['delete'], url_path='members/(?P<user_id>[^/.]+)')
    def remove_member(self, request, slug=None, user_id=None, **kwargs):
        board = self.get_object()
        
        try:
            user_to_remove = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return api_response(
                errors=[{"detail": "User not found."}],
                status=status.HTTP_404_NOT_FOUND
            )
        
        is_owner = (board.owner == request.user)
        is_self = (str(request.user.id) == str(user_id))
        
        if not (is_owner or is_self):
            return api_response(
                errors=[{"detail": "You don't have permission to remove this member."}],
                status=status.HTTP_403_FORBIDDEN
            )
            
        if not board.members.filter(id=user_to_remove.id).exists():
            return api_response(
                errors=[{"detail": "User is not a member of this board."}],
                status=status.HTTP_400_BAD_REQUEST
            )
            
        board.members.remove(user_to_remove)
        return api_response(
            meta={"message": "Member removed successfully."}
        )

    @action(detail=True, methods=['post'], url_path='reset-invite')
    def reset_invite(self, request, slug=None, **kwargs):
        board = self.get_object()
        if board.owner != request.user:
            return api_response(
                errors=[{"detail": "Only the board owner can reset the invite link."}],
                status=status.HTTP_403_FORBIDDEN
            )
        board.invite_token = secrets.token_urlsafe(16)
        board.save()
        return api_response(
            data=BoardSerializer(board).data,
            meta={"message": "Invite link has been reset successfully."}
        )

    @extend_schema(
        tags=['Boards'],
        summary='Duplicate board',
        description='Create a copy of an existing board including all columns and tasks.',
        parameters=[
            OpenApiParameter(
                name='slug',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description='Board Slug to duplicate',
            ),
        ],
        responses={
            201: OpenApiResponse(description='Board duplicated successfully'),
            404: OpenApiResponse(description='Board not found'),
        }
    )
    @action(detail=True, methods=['post'])
    def duplicate(self, request, slug=None, **kwargs):
        original_board = self.get_object()
        
        base_name = f"{original_board.name} (Copy)"
        new_name = base_name
        counter = 1
        while Board.objects.filter(owner=request.user, name=new_name, is_archived=False).exists():
            counter += 1
            new_name = f"{original_board.name} (Copy {counter})"
        
        with transaction.atomic():
            new_board = Board.objects.create(
                owner=request.user,
                name=new_name,
                description=original_board.description
            )
            
            for column in original_board.columns.all().order_by('position'):
                from columns.models import Column
                new_column = Column.objects.create(
                    board=new_board,
                    name=column.name,
                    position=column.position
                )
                
                for task in column.tasks.filter(is_archived=False).order_by('position'):
                    from tasks.models import Task
                    Task.objects.create(
                        column=new_column,
                        title=task.title,
                        description=task.description,
                        position=task.position,
                        priority=task.priority,
                        due_date=task.due_date
                    )
        
        return api_response(
            data=BoardDetailSerializer(new_board).data,
            meta={"message": "Board duplicated successfully"},
            status=status.HTTP_201_CREATED
        )

    def _create_default_columns(self, board):
        from columns.models import Column
        default_columns = [
            {'name': 'To Do', 'position': 0},
            {'name': 'In Progress', 'position': 1},
            {'name': 'Done', 'position': 2},
        ]
        Column.objects.bulk_create([
            Column(board=board, **col) for col in default_columns
        ])