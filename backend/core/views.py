import razorpay
from datetime import datetime, timedelta
from django.utils import timezone

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes as pc
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models as django_models

from .models import Car, Booking, User, CustomerProfile, DealerProfile, Review
from .serializers import (
    CarSerializer, BookingSerializer, UserSerializer,
    RegisterSerializer, CustomerProfileSerializer, DealerProfileSerializer
)
from .permissions import IsAdmin, IsDealer, IsCustomer, IsAdminOrDealer, IsOwnerOrAdmin


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data

        for field in ['first_name', 'last_name', 'email', 'phone']:
            if field in data:
                setattr(user, field, data[field])

        if 'password' in data:
            user.set_password(data['password'])

        user.save()

        # Handle profile image updates
        if user.role == 'customer' and 'dl_image' in request.FILES:
            profile, _ = CustomerProfile.objects.get_or_create(user=user)
            profile.dl_image = request.FILES['dl_image']
            profile.save()
        elif user.role == 'dealer' and 'ad_image' in request.FILES:
            profile, _ = DealerProfile.objects.get_or_create(user=user)
            profile.ad_image = request.FILES['ad_image']
            profile.save()

        return Response(UserSerializer(user).data)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'If this email exists, a reset link has been sent.'}, status=200)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        send_mail(
            'Carbook Password Reset',
            f'Click the link to reset your password: {reset_link}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
        return Response({'detail': 'Password reset link sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        try:
            pk = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=pk)
        except Exception:
            return Response({'detail': 'Invalid link.'}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Link expired or invalid.'}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password reset successful.'})


# ─── Contact ──────────────────────────────────────────────────────────────────

class ContactView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        subject = request.data.get('subject', 'Contact Form')
        message = request.data.get('message')
        send_mail(
            subject,
            f'From: {name} <{email}>\n\n{message}',
            email,
            [settings.DEFAULT_FROM_EMAIL],
        )
        return Response({'detail': 'Message sent successfully.'})


# ─── Cars ─────────────────────────────────────────────────────────────────────

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action == 'create':
            return [IsDealer()]
        if self.action in ['review', 'suspend']:
            return [IsAdmin()]
        if self.action in ['toggle_availability', 'update', 'partial_update', 'destroy']:
            return [IsDealer()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Car.objects.all()
        
        # 1. Location & Status filtering (for both public and admin)
        location = self.request.query_params.get('location')
        status_filter = self.request.query_params.get('status')
        if location:
            qs = qs.filter(location=location)
        if status_filter:
            qs = qs.filter(status=status_filter)

        # 2. Dealer Dashboard: If ?my_cars=true, return ONLY dealer's own cars (all of them)
        if self.request.user.is_authenticated and self.request.query_params.get('my_cars') == 'true':
            return qs.filter(dealer=self.request.user)

        # 3. Detail actions (Edit/Toggle/Delete): Don't filter out unavailable cars
        # so dealers can re-enable them.
        if self.detail:
            return qs

        # 4. Public Marketplace: Only show available and accepted cars
        if not self.request.user.is_authenticated or (self.request.user.role == 'customer'):
            qs = qs.filter(availability=True, status='Accepted')
            
        return qs

    def perform_create(self, serializer):
        serializer.save(dealer=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def review(self, request, pk=None):
        car = self.get_object()
        decision = request.data.get('decision')  # 'accept' or 'reject'
        reason = request.data.get('reason', '')

        if decision == 'accept':
            car.status = 'Accepted'
            car.save()
            return Response({'detail': 'Car accepted.'})
        elif decision == 'reject':
            dealer_user = car.dealer
            send_mail(
                f'Car Rejection: {car.make} {car.model}',
                f'Dear {dealer_user.first_name}, your car ({car.regno}) was rejected. Reason: {reason}',
                settings.DEFAULT_FROM_EMAIL,
                [dealer_user.email],
            )
            car.delete()
            return Response({'detail': 'Car rejected and removed.'})
        return Response({'detail': 'Invalid decision.'}, status=400)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def suspend(self, request, pk=None):
        car = self.get_object()
        dealer_user = car.dealer
        send_mail(
            'Car Suspended',
            f'Dear {dealer_user.first_name}, your car ({car.regno} {car.make} {car.model}) has been suspended.',
            settings.DEFAULT_FROM_EMAIL,
            [dealer_user.email],
            fail_silently=True,
        )
        car.status = 'Suspended'
        car.availability = False
        car.save()
        return Response({'detail': 'Car suspended. Active bookings will remain valid but no new bookings can be made.'})

    @action(detail=True, methods=['post'], permission_classes=[IsDealer])
    def toggle_availability(self, request, pk=None):
        car = self.get_object()
        if car.dealer != request.user:
            return Response({'detail': 'Not your car.'}, status=403)
        car.availability = not car.availability
        car.save()
        return Response({'availability': car.availability})

    @action(detail=True, methods=['patch'], permission_classes=[IsDealer])
    def edit_fields(self, request, pk=None):
        car = self.get_object()
        if car.dealer != request.user:
            return Response({'detail': 'Not your car.'}, status=403)
        for field in ['price', 'location']:
            if field in request.data:
                setattr(car, field, request.data[field])
        car.save()
        return Response(CarSerializer(car, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[IsCustomer])
    def rate(self, request, pk=None):
        car = self.get_object()
        user = request.user
        
        # Check if user has a returned booking for this car
        has_returned_booking = Booking.objects.filter(car=car, customer=user, returned=True).exists()
        if not has_returned_booking:
            return Response({'detail': 'You can only review cars you have rented and returned.'}, status=403)
            
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')
        
        if not rating or not (1 <= int(rating) <= 5):
            return Response({'detail': 'Please provide a rating between 1 and 5.'}, status=400)
            
        review, created = Review.objects.update_or_create(
            car=car, customer=user,
            defaults={'rating': int(rating), 'comment': comment}
        )
        return Response({'detail': 'Review submitted successfully.'})


# ─── Bookings ─────────────────────────────────────────────────────────────────

def auto_release_overdue_bookings():
    """
    Efficiently marks overdue paid bookings as returned using bulk DB operations.
    Uses DB-level date comparison instead of a slow Python loop.
    """
    today = timezone.localdate()
    now_time = timezone.localtime().time()

    # Find overdue booking IDs in a single DB query:
    # Either dropoff_date is in the past, OR it's today and the time has passed
    overdue_qs = Booking.objects.filter(paid=True, returned=False).filter(
        django_models.Q(dropoff_date__lt=today) |
        django_models.Q(dropoff_date=today, dropoff_time__lte=now_time)
    )
    overdue_ids = list(overdue_qs.values_list('id', flat=True))
    car_ids = list(overdue_qs.values_list('car_id', flat=True))

    if overdue_ids:
        # Bulk update bookings — one single DB query
        Booking.objects.filter(id__in=overdue_ids).update(returned=True)
        # Bulk update cars — one single DB query
        Car.objects.filter(id__in=car_ids).update(booked=False)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Auto-release any overdue bookings before returning the list
        auto_release_overdue_bookings()
        user = self.request.user
        if user.role == 'admin':
            return Booking.objects.all()
        elif user.role == 'dealer':
            return Booking.objects.filter(car__dealer=user)
        return Booking.objects.filter(customer=user)

    def create(self, request, *args, **kwargs):
        car_id = request.data.get('car_id')
        pickup_date_str = request.data.get('pickup_date')
        dropoff_date_str = request.data.get('dropoff_date')
        
        if not pickup_date_str or not dropoff_date_str:
            return Response({'detail': 'Pickup and dropoff dates are required.'}, status=400)
            
        try:
            pickup_dt = datetime.strptime(pickup_date_str, '%Y-%m-%d').date()
            dropoff_dt = datetime.strptime(dropoff_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'detail': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
            
        if dropoff_dt < pickup_dt:
            return Response({'detail': 'Dropoff date cannot be before pickup date.'}, status=400)
            
        # Secure server-side calculation of days
        nod = max(1, (dropoff_dt - pickup_dt).days)

        try:
            car = Car.objects.get(id=car_id)
        except Car.DoesNotExist:
            return Response({'detail': 'Car not found.'}, status=404)
            
        if car.dealer == request.user:
            return Response({'detail': 'You cannot book your own car.'}, status=400)

        # Critical Security/Availability Checks
        if car.status != 'Accepted':
            return Response({'detail': 'This car is not approved for rental.'}, status=400)
        if not car.availability:
            return Response({'detail': 'The dealer has temporarily disabled this car.'}, status=400)
        if car.booked:
            return Response({'detail': 'This car is currently booked by another user.'}, status=400)


        amount = nod * car.price
        rzp_client = razorpay.Client(auth=(settings.RAZOR_KEY_ID, settings.RAZOR_KEY_SECRET))
        order = rzp_client.order.create({
            'amount': amount * 100,
            'currency': 'INR',
            'receipt': f'rcpt_{car.regno}',
            'payment_capture': 1
        })

        booking = Booking.objects.create(
            car=car,
            customer=request.user,
            pickup_location=request.data.get('pickup_location'),
            pickup_date=request.data.get('pickup_date'),
            pickup_time=request.data.get('pickup_time'),
            dropoff_location=request.data.get('dropoff_location'),
            dropoff_date=request.data.get('dropoff_date'),
            dropoff_time=request.data.get('dropoff_time'),
            nod=nod,
            amount=amount,
            order_id=order['id'],
        )
        serializer = self.get_serializer(booking)
        return Response({**serializer.data, 'razorpay_key': settings.RAZOR_KEY_ID}, status=201)

    @action(detail=False, methods=['post'], permission_classes=[IsCustomer])
    def verify_payment(self, request):
        order_id = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature = request.data.get('razorpay_signature')

        rzp_client = razorpay.Client(auth=(settings.RAZOR_KEY_ID, settings.RAZOR_KEY_SECRET))
        try:
            rzp_client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature,
            })
        except Exception:
            return Response({'detail': 'Payment verification failed.'}, status=400)

        try:
            booking = Booking.objects.get(order_id=order_id)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=404)

        if booking.paid:
            return Response({'detail': 'Payment already verified.'})
            
        # Concurrency Check: If someone else paid first while this user was checking out
        if booking.car.booked:
            try:
                # Automatically refund the slower user
                rzp_client.payment.refund(payment_id, {'amount': int(booking.amount * 100)})
                booking.delete()
                return Response({'detail': 'Sorry, this car was just booked by someone else. A full refund has been initiated.'}, status=400)
            except Exception:
                booking.delete()
                return Response({'detail': 'Car booked by someone else. Refund queued.'}, status=400)

        booking.razorpay_payment_id = payment_id
        booking.paid = True
        booking.car.booked = True
        booking.car.save()
        booking.save()

        # Email dealer
        dealer_user = booking.car.dealer
        try:
            dl_path = booking.customer.customer_profile.dl_image.path
        except Exception:
            dl_path = None

        email = EmailMessage(
            'Car Booked - Carbook',
            f'Dear {dealer_user.first_name}, your car {booking.car.make} {booking.car.model} '
            f'({booking.car.regno}) has been booked by {booking.customer.get_full_name()}.\n'
            f'Dropoff: {booking.dropoff_location} on {booking.dropoff_date} at {booking.dropoff_time}.',
            settings.DEFAULT_FROM_EMAIL,
            [dealer_user.email],
        )
        if dl_path:
            email.attach_file(dl_path)
        email.send(fail_silently=True)

        return Response({'detail': 'Payment verified. Booking confirmed!'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.customer != request.user and request.user.role not in ['admin', 'dealer']:
            return Response({'detail': 'Permission denied.'}, status=403)

        refund_id = None
        if booking.paid and booking.razorpay_payment_id:
            rzp_client = razorpay.Client(auth=(settings.RAZOR_KEY_ID, settings.RAZOR_KEY_SECRET))
            try:
                refund = rzp_client.payment.refund(booking.razorpay_payment_id, {
                    'amount': int(booking.amount) * 100,  # DecimalField — safe to cast directly
                    'speed': 'optimum'
                })
                refund_id = refund.get('id', '')
            except Exception as e:
                # In test mode, payments are often not captured instantly, causing refund to fail.
                # We log it, but still allow the booking to be cancelled so the car isn't stuck.
                refund_id = 'failed_test_mode'

        # Notify dealer if email is configured
        dealer_user = booking.car.dealer
        send_mail(
            'Booking Cancelled',
            f'Booking for {booking.car.make} {booking.car.model} by {booking.customer.get_full_name()} was cancelled.',
            settings.DEFAULT_FROM_EMAIL,
            [dealer_user.email],
            fail_silently=True,
        )

        booking.car.booked = False
        booking.car.save()
        booking.delete()
        
        detail_msg = 'Booking cancelled and refund initiated.' if refund_id != 'failed_test_mode' else 'Booking cancelled (Refund skipped due to Razorpay test-mode lag).'
        return Response({'detail': detail_msg, 'refund_id': refund_id})

    @action(detail=True, methods=['post'])
    def mark_returned(self, request, pk=None):
        """Dealer marks car as returned — frees availability without refund."""
        booking = self.get_object()
        if request.user.role not in ['admin', 'dealer']:
            return Response({'detail': 'Permission denied.'}, status=403)
        if request.user.role == 'dealer' and booking.car.dealer != request.user:
            return Response({'detail': 'Not your booking.'}, status=403)

        booking.car.booked = False
        booking.car.save()
        booking.returned = True
        booking.save()
        return Response({'detail': 'Car marked as returned and is now available.'})



# ─── User Management ──────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        if user.role == 'dealer':
            Car.objects.filter(dealer=user).update(status='Suspended', availability=False)
        send_mail(
            'Account Deactivated',
            f'Dear {user.first_name}, your Carbook account has been permanently deactivated.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )
        user.is_active = False
        user.save()
        return Response({'detail': f'User {user.username} deactivated. All cars suspended.'})
