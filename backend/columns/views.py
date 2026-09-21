from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db import transaction, models
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .models import Column
from .serializers import (
    ColumnSerializer,
    ColumnWithTasksSerializer,
    ColumnCreateSerializer,
    ColumnUpdateSerializer,
    ColumnReorderSerializer
)
from django.db.models import Q
from core.utils import api_response
from core.permissions import IsOwner, IsOwnerOrMember

# Create your views here.

@extend_schema_view(
    list=extend_schema(
        tags=['Columns'],
        summary='List columns',
        description='Get all columns. Filter by board using the `board` query parameter.',
        parameters=[
            OpenApiParameter(
                name='board',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Filter columns by board ID',
                required=False,
            ),
        ],
        responses={
            200: OpenApiResponse(description='Columns retrieved successfully'),
        }
    ),
    retrieve=extend_schema(
        tags=['Columns'],
        summary='Get column details',
        description='Get detailed information about a specific column including all tasks.',
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Column ID',
            ),
        ],
        responses={
            200: OpenApiResponse(description='Column details retrieved successfully'),
            404: OpenApiResponse(description='Column not found'),
        }
    ),
    create=extend_schema(
        tags=['Columns'],
        summary='Create column',
        description='Create a new column in a board. Maximum 10 columns per board.',
        request=ColumnCreateSerializer,
        responses={
            201: OpenApiResponse(description='Column created successfully'),
            400: OpenApiResponse(description='Validation error'),
        },
        examples=[
            OpenApiExample(
                'Create Column',
                value={'board': 1, 'name': 'Review'},
                request_only=True,
            ),
        ]
    ),
    update=extend_schema(
        tags=['Columns'],
        summary='Update column',
        description='Update column name.',
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Column ID',
            ),
        ],
        request=ColumnUpdateSerializer,
        responses={
            200: OpenApiResponse(description='Column updated successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Column not found'),
        }
    ),
    partial_update=extend_schema(
        tags=['Columns'],
        summary='Partially update column',
        description='Partially update column fields.',
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Column ID',
            ),
        ],
        request=ColumnUpdateSerializer,
        responses={
            200: OpenApiResponse(description='Column updated successfully'),
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Column not found'),
        }
    ),
    destroy=extend_schema(
        tags=['Columns'],
        summary='Delete column',
        description='Delete a column and all its tasks.',
        parameters=[
            OpenApiParameter(
                name='id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='Column ID',
            ),
        ],
        responses={
            200: OpenApiResponse(description='Column deleted successfully'),
            404: OpenApiResponse(description='Column not found'),
        }
    ),
)
class ColumnViewSet(viewsets.ModelViewSet):
    serializer_class = ColumnSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrMember]
    lookup_field = 'pk'

    def get_queryset(self):
    # Handle schema generation
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Column.objects.none()
    
        queryset = Column.objects.filter(
            Q(board__owner=self.request.user) | Q(board__members=self.request.user),
            board__is_archived=False
        ).distinct().prefetch_related('tasks').select_related('board')
        
        board_id = self.request.query_params.get('board')
        if board_id:
            queryset = queryset.filter(board_id=board_id)
        
        return queryset.order_by('position')
        


    def get_serializer_class(self):
        if self.action == 'create':
            return ColumnCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ColumnUpdateSerializer
        if self.action == 'retrieve':
            return ColumnWithTasksSerializer
        if self.action == 'reorder':
            return ColumnReorderSerializer
        return ColumnSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = ColumnWithTasksSerializer(queryset, many=True)
        return api_response(
            data=serializer.data,
            meta={"count": queryset.count()}
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ColumnWithTasksSerializer(instance)
        return api_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        board = serializer.validated_data['board']
        max_position = Column.objects.filter(board=board).count()
        column = serializer.save(position=max_position)
        
        return api_response(
            data=ColumnSerializer(column).data,
            meta={"message": "Column created successfully"},
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(
            data=ColumnSerializer(instance).data,
            meta={"message": "Column updated successfully"}
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        board = instance.board
        position = instance.position
        
        if Column.objects.filter(board=board).count() <= 1:
            return api_response(
                errors=[{"detail": "Cannot delete the last column. A board must have at least one column."}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.delete()
        
        Column.objects.filter(
            board=board,
            position__gt=position
        ).update(position=models.F('position') - 1)
        
        return api_response(
            meta={"message": "Column deleted successfully"},
            status=status.HTTP_200_OK
        )

    @extend_schema(
        tags=['Columns'],
        summary='Reorder columns',
        description='Reorder columns within a board by providing a list of column IDs in the new order.',
        request=ColumnReorderSerializer,
        responses={
            200: OpenApiResponse(description='Columns reordered successfully'),
            400: OpenApiResponse(description='Validation error'),
        },
        examples=[
            OpenApiExample(
                'Reorder Columns',
                value={'column_ids': [3, 1, 2]},
                request_only=True,
            ),
        ]
    )
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        serializer = ColumnReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        column_ids = serializer.validated_data['column_ids']
        
        columns = Column.objects.filter(
            Q(board__owner=request.user) | Q(board__members=request.user),
            id__in=column_ids
        ).distinct()
        
        if columns.count() != len(column_ids):
            return api_response(
                errors=[{"detail": "One or more column IDs are invalid."}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        boards = set(columns.values_list('board_id', flat=True))
        if len(boards) > 1:
            return api_response(
                errors=[{"detail": "All columns must belong to the same board."}],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            for index, column_id in enumerate(column_ids):
                Column.objects.filter(id=column_id).update(position=index)
        
        return api_response(
            meta={"message": "Columns reordered successfully"}
        )