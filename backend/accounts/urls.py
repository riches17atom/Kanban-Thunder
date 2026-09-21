from django.urls import path
from .views import RegisterView, LoginView, RefreshTokenView, LogoutView, MeView, UserSearchView, GoogleLoginView

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google/', GoogleLoginView.as_view(), name='google-login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('users/search/', UserSearchView.as_view(), name='user-search'),
]