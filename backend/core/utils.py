from rest_framework.response import Response


def api_response(data=None, meta=None, errors=None, status=200):
    return Response(
        {
            "data": data if data is not None else {},
            "meta": meta if meta is not None else {},
            "errors": errors if errors is not None else [],
        },
        status=status,
    )