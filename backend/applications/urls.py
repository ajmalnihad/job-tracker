"""
URL routing for applications API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet
from . import views

router = DefaultRouter()
router.register(r'', ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
    path('alerts/trigger-daily/', views.trigger_daily_alerts, name='trigger_daily_alerts'),
]
