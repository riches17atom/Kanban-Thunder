from django.core.exceptions import ValidationError
import re


def validate_no_special_chars(value):
    if re.search(r'[<>{}[\]\\]', value):
        raise ValidationError('Special characters <, >, {, }, [, ], \\ are not allowed.')


def validate_min_length(min_length):
    def validator(value):
        if len(value.strip()) < min_length:
            raise ValidationError(f'This field must be at least {min_length} characters long.')
    return validator