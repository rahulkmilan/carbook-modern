from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsDealer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'dealer'

class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'customer'

class IsAdminOrDealer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'dealer']

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if hasattr(obj, 'dealer'):
            return obj.dealer == request.user
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        return obj == request.user
