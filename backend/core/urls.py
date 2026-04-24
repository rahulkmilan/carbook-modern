from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CarViewSet, BookingViewSet, UserViewSet,
    RegisterView, MeView,
    PasswordResetRequestView, PasswordResetConfirmView,
    ContactView,
)

router = DefaultRouter()
router.register(r'cars', CarViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('contact/', ContactView.as_view(), name='contact'),
]
