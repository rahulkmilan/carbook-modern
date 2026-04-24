from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Car, Booking, CustomerProfile, DealerProfile, Review


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=['customer', 'dealer'])
    phone = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'role', 'phone']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
            role=validated_data['role'],
            phone=validated_data.get('phone', ''),
        )
        if user.role == 'customer':
            CustomerProfile.objects.create(user=user)
        elif user.role == 'dealer':
            DealerProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = CustomerProfile
        fields = '__all__'


class DealerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = DealerProfile
        fields = '__all__'


from django.db.models import Avg

class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'created_at', 'customer_name']

class CarSerializer(serializers.ModelSerializer):
    dealer = UserSerializer(read_only=True)
    photos_url = serializers.SerializerMethodField()
    rc_image_url = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Car
        fields = '__all__'

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else None

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_photos_url(self, obj):
        request = self.context.get('request')
        if obj.photos and request:
            return request.build_absolute_uri(obj.photos.url)
        return None

    def get_rc_image_url(self, obj):
        request = self.context.get('request')
        if obj.rc_image and request:
            return request.build_absolute_uri(obj.rc_image.url)
        return None


class BookingSerializer(serializers.ModelSerializer):
    car = CarSerializer(read_only=True)
    customer = UserSerializer(read_only=True)
    car_id = serializers.PrimaryKeyRelatedField(
        queryset=Car.objects.all(), source='car', write_only=True
    )
    has_reviewed = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'

    def get_has_reviewed(self, obj):
        # Check if this customer already left a review for this car
        return Review.objects.filter(car=obj.car, customer=obj.customer).exists()
