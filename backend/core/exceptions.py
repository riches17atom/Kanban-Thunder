from rest_framework.views import exception_handler
from rest_framework import status
from .utils import api_response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is None:
        return api_response(
            errors=[{"code": "server_error", "detail": str(exc)}],
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    errors = []
    
    if isinstance(response.data, dict):
        for field, detail in response.data.items():
            if isinstance(detail, list):
                detail = ' '.join([str(d) for d in detail])
            errors.append({"field": field, "detail": str(detail)})
    elif isinstance(response.data, list):
        errors = [{"detail": str(item)} for item in response.data]
    else:
        errors.append({"detail": str(response.data)})
    
    return api_response(errors=errors, status=response.status_code)