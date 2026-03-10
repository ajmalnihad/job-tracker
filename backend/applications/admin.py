from django.contrib import admin
from .models import Application

# ഇത് നിന്റെ Admin Panel-നെ കൂടുതൽ പവർഫുൾ ആക്കും
@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'role', 'status', 'follow_up_date', 'is_notified')
    list_filter = ('status', 'is_notified', 'follow_up_date')
    search_fields = ('company_name', 'role')
    ordering = ('-created_at',)