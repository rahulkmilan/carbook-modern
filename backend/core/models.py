from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('dealer', 'Dealer'),
        ('customer', 'Customer')
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=15, blank=True)

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    dl_image = models.ImageField(upload_to='dl_images/', blank=True, null=True)

class DealerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dealer_profile')
    ad_image = models.ImageField(upload_to='ad_images/', blank=True, null=True)

class Car(models.Model):
    dealer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cars')
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    regno = models.CharField(max_length=20, unique=True)
    price = models.IntegerField()
    location = models.CharField(max_length=100)
    seats = models.IntegerField() 
    FUEL_CHOICES = [('Petrol', 'Petrol'), ('Diesel', 'Diesel')]
    fuel_type = models.CharField(max_length=10, choices=FUEL_CHOICES)
    rc_image = models.ImageField(upload_to='rc_books/', blank=True, null=True)
    photos = models.ImageField(upload_to='car_photos/', blank=True, null=True)
    status = models.CharField(max_length=20, default='Pending') # Pending, Accepted, Rejected
    availability = models.BooleanField(default=True)
    booked = models.BooleanField(default=False)

class Booking(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    pickup_location = models.CharField(max_length=100, null=True, blank=True)
    pickup_date = models.DateField(null=True, blank=True)
    pickup_time = models.TimeField(null=True, blank=True)
    dropoff_location = models.CharField(max_length=100)
    dropoff_date = models.DateField()
    dropoff_time = models.TimeField()
    nod = models.IntegerField() # number of days
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_id = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    paid = models.BooleanField(default=False)
    returned = models.BooleanField(default=False)

class Review(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('car', 'customer')

