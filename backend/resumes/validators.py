"""
File validation utilities for resume uploads.
"""

import os
from django.core.exceptions import ValidationError


def validate_file_extension(value):
    """Validate that uploaded file is a PDF."""
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.pdf']
    
    if not ext.lower() in valid_extensions:
        raise ValidationError('Only PDF files are allowed.')


def validate_file_size(value):
    """Validate file size (max 5MB)."""
    filesize = value.size
    max_size_mb = 5
    
    if filesize > max_size_mb * 1024 * 1024:
        raise ValidationError(f'Maximum file size is {max_size_mb}MB')
