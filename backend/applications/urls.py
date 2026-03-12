"""
URL routing for applications API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ApplicationViewSet, basename='application')

urlpatterns = [
    # Explicit paths BEFORE the router catch-all to avoid conflicts
    path('alerts/trigger-daily/', views.trigger_daily_alerts, name='trigger_daily_alerts'),
    path('', include(router.urls)),
]
