from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Car, Booking, CustomerProfile, DealerProfile, Review


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get("password")

        # 1. Check if the user even exists
        if not User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"detail": f"User '{username}' not found. Please check your username."})

        # 2. Check if the password is correct
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError({"detail": "Incorrect password. Please try again."})
            
        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account is inactive."})

        return super().validate(attrs)

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
        
        request = self.context.get('request')
        if user.role == 'customer':
            dl_image = request.FILES.get('dl_image') if request else None
            CustomerProfile.objects.create(user=user, dl_image=dl_image)
        elif user.role == 'dealer':
            ad_image = request.FILES.get('ad_image') if request else None
            DealerProfile.objects.create(user=user, ad_image=ad_image)
        return user


class UserSerializer(serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'document_url']

    def get_document_url(self, obj):
        request = self.context.get('request')
        url = None
        if obj.role == 'customer' and hasattr(obj, 'customer_profile') and obj.customer_profile.dl_image:
            url = obj.customer_profile.dl_image.url
        elif obj.role == 'dealer' and hasattr(obj, 'dealer_profile') and obj.dealer_profile.ad_image:
            url = obj.dealer_profile.ad_image.url
            
        if url:
            if url.startswith('http') or not request:
                return url
            return request.build_absolute_uri(url)
        return None


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
        if obj.photos:
            url = obj.photos.url
            if url.startswith('http') or not request:
                return url
            return request.build_absolute_uri(url)
        return None

    def get_rc_image_url(self, obj):
        request = self.context.get('request')
        if obj.rc_image:
            url = obj.rc_image.url
            if url.startswith('http') or not request:
                return url
            return request.build_absolute_uri(url)
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
