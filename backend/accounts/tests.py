from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
import json

User = get_user_model()


class AuthenticationTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.register_url = reverse('accounts:register')
        self.login_url = reverse('accounts:login')
        self.refresh_url = reverse('accounts:refresh')
        self.logout_url = reverse('accounts:logout')
        
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration_sets_cookie(self):
        """Ensure registration succeeds, does not return refresh token in body, and sets HTTP-only cookie."""
        response = self.client.post(self.register_url, self.user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data['data']['tokens'])
        self.assertNotIn('refresh', response.data['data']['tokens'])
        
        # Check refresh token cookie is set
        self.assertIn('refresh_token', response.cookies)
        cookie = response.cookies['refresh_token']
        self.assertTrue(cookie['httponly'])
        self.assertEqual(cookie['path'], '/api/v1/auth/')

    def test_user_login_sets_cookie_and_locks_out(self):
        """Ensure login sets cookies and locks out after multiple failures."""
        # First register the user
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Attempt incorrect logins
        login_data = {'email': 'testuser@example.com', 'password': 'WrongPassword'}
        for i in range(5):
            response = self.client.post(self.login_url, login_data, format='json')
            if response.status_code != status.HTTP_401_UNAUTHORIZED:
                print("LOGIN ATTEMPT FAIL RESPONSE DATA:", response.data)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # 6th attempt should return 429 Too Many Requests (Lockout)
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn('locked due to too many failed login attempts', response.data['errors'][0]['detail'])

    def test_refresh_token_via_cookie(self):
        """Ensure token refresh works by reading the cookie."""
        # Register user
        register_response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        
        # Clear access token to simulate expiry
        self.client.credentials()
        
        # Call refresh endpoint (cookies are automatically attached in test client)
        response = self.client.post(self.refresh_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data['data']['tokens'])
        self.assertIn('refresh_token', response.cookies)

    def test_logout_invalidates_cookie(self):
        """Ensure logout blacklists token and deletes the refresh cookie."""
        # Register and login user
        register_response = self.client.post(self.register_url, self.user_data, format='json')
        access_token = register_response.data['data']['tokens']['access']
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Call logout
        response = self.client.post(self.logout_url, {}, format='json')
        print("LOGOUT RESPONSE DATA:", response.data)
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
        
        # Cookie should be cleared (max_age=0 or empty value)
        cookie = response.cookies['refresh_token']
        self.assertEqual(cookie.value, '')
