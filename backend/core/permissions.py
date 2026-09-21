from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    message = "You don't have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'board'):
            return obj.board.owner == request.user
        if hasattr(obj, 'column'):
            return obj.column.board.owner == request.user
        return False


class IsOwnerOrMember(permissions.BasePermission):
    message = "You don't have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if hasattr(obj, 'owner'):
            return obj.owner == user or obj.members.filter(id=user.id).exists()
        if hasattr(obj, 'board'):
            return obj.board.owner == user or obj.board.members.filter(id=user.id).exists()
        if hasattr(obj, 'column'):
            return obj.column.board.owner == user or obj.column.board.members.filter(id=user.id).exists()
        return False