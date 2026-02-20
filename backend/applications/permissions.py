"""
Custom permissions for applications.
"""

from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Custom permission to only allow owners to access their own objects."""
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
