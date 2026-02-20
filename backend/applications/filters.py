"""
Filters for applications API.
"""

import django_filters
from .models import Application


class ApplicationFilter(django_filters.FilterSet):
    """Filter applications by status, date range, and company."""
    
    applied_date_from = django_filters.DateFilter(field_name='applied_date', lookup_expr='gte')
    applied_date_to = django_filters.DateFilter(field_name='applied_date', lookup_expr='lte')
    company = django_filters.CharFilter(field_name='company_name', lookup_expr='icontains')
    
    class Meta:
        model = Application
        fields = ['status', 'applied_date_from', 'applied_date_to', 'company']
