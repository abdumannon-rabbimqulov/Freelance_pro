from rest_framework import serializers
from .models import (CodeVerify,
            CustomUser,ADMIN,
            CODE_VERIFY,DONE
            )
from rest_framework.exceptions import ValidationError
from shared.views import send_email
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from shared.views import check_email_or_username
from django.contrib.auth import authenticate
from rest_framework import status
from django.db.models import Q



class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'photo', 'auth_role', 'is_staff', 'balance', 'completed_orders_count', 'cancelled_orders_count')


class SingUpSerializers(serializers.ModelSerializer):
    id=serializers.UUIDField(read_only=True)
    auth_role=serializers.CharField(read_only=True)
    auth_status=serializers.CharField(read_only=True)
    email=serializers.CharField(write_only=True)

    class Meta:
        model=CustomUser
        fields=('id','auth_status','auth_role','email')


    def validate(self, attrs):
        auth_role=attrs.get('auth_role')
        email=attrs.get('email')
        if auth_role==ADMIN:
            raise ValidationError({"message":"siz admin to'g'idan to'g'ri admin huquqiga ega bo'lmasiz"})
        elif CustomUser.objects.filter(email=email).exists():
            raise ValidationError({'message':'email mavjud'})
        return attrs

    def create(self, validated_data):
        user = CustomUser.objects.create(**validated_data)
        if user:
            code=send_email(user)
        else:
            raise ValidationError({
            'message':'yuborishda xato email yoki telefon raqaimni teshiring'
            })
        return user

    def to_representation(self, instance):
        data=super().to_representation(instance)
        data['message']='Kodingiz yuborildi'
        data['refresh']=instance.token()['refresh']
        data['access'] =instance.token()['access']
        return data

class UserChangeInfoSerializers(serializers.Serializer):
    first_name=serializers.CharField(required=True)
    last_name=serializers.CharField(required=True)
    username=serializers.CharField(required=True)
    password=serializers.CharField(required=True)
    conf_password=serializers.CharField(required=True)


    def validate(self,attrs):
        password=attrs.get('password')
        conf_password=attrs.get('conf_password')

        if  password!=conf_password:
            raise ValidationError({'message':'parollar mos emas'})
        elif len(password)<7:
            raise ValidationError({'message':'parol 8 ta belgidan kam bolmasligi kerak'})
        return attrs


    def validate_username(self,username):
        user = self.context.get('request').user
        user_query = CustomUser.objects.filter(username=username).exclude(id=user.id)

        if user_query.exists():
            raise ValidationError({'message': 'Bu username band'})
        if len(username) < 6:
            raise ValidationError({'message': 'Username kamida 6 belgidan iborat bolishi kerek'})
        elif not username.isalnum():
            raise ValidationError({'message': 'username da ortiqcha belgi bolmasligi kerak '})
        elif username[0].isdigit():
            raise ValidationError({'message': 'username raqam bilan boshlanmasin '})
        return username

    def validate_first_name(self,first_name):

         if len(first_name)<3:
             raise ValidationError({'message':"first_name kamida 4 ta belgi bo'lishi kerak"})
         elif first_name.isdigit():
             raise ValidationError({'message':'first_name ortiqcha belig bolmasligi kerak'})
         elif not first_name.isalnum():
             raise ValidationError({'message': 'first_name da ortiqcha belgi bolmasligi kerak '})
         return first_name


    def update(self, instance, validated_data):
        validated_data.pop('conf_password')
        instance.username=validated_data.get('username')
        instance.first_name=validated_data.get('first_name')
        instance.last_name=validated_data.get('last_name')
        password=validated_data.get('password')
        instance.set_password(password)
        if instance.auth_status!=CODE_VERIFY:
            raise ValidationError({'message':'siz hali tasdiqlanmagansiz'})

        instance.auth_status=DONE
        instance.save()
        return instance


class UserPhotoSerializers(serializers.Serializer):
    photo=serializers.ImageField()

    def update(self, instance, validated_data):
        photo=validated_data.get('photo',None)
        if photo:
            instance.photo=photo
        else:
            raise ValidationError({'message':'Siz tasdiqlanmagansiz'})
        instance.save()
        return instance


class LoginSerializers(TokenObtainSerializer):
    password=serializers.CharField(required=True,write_only=True)

    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.fields['user_input']=serializers.CharField(required=True,write_only=True)
        self.fields['username'] = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        user=self.check_user_type(attrs)

        data ={
            "refresh":user.token()['refresh'],
            "access": user.token()['access'],
            "user": {
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "auth_role": user.auth_role,
                "balance": user.balance,
                "completed_orders_count": user.completed_orders_count,
                "cancelled_orders_count": user.cancelled_orders_count
            }
        }

        return data
    def check_user_type(self,data):
        password=data.get('password')
        user_input=data.get('user_input')
        user_input_type=check_email_or_username(user_input)
        if user_input_type=='username':
            user=CustomUser.objects.filter(username=user_input).first()
            self.get_object(user)
            username=user.username
        elif user_input_type=='email':
            user=CustomUser.objects.filter(email=user_input).first()
            self.get_object(user)
            username=user.username

        else:
            raise ValidationError(detail='Malumot topilmadi')

        authentication_kwargs={
            "password":password,
            self.username_field:username
        }

        user=authenticate(**authentication_kwargs)

        if not user:
            raise ValidationError('login yoki parol xato')

        return user


    def get_object(self,user):
        if not user:
            raise ValidationError({'message':'Xato malumot kiridingiz'})
        return True


class ForgotPasswordSerializers(serializers.Serializer):
    user_input=serializers.CharField(required=True,write_only=True)

    def validate(self, attrs):
        user_data=attrs.get('user_input',None)
        if not user_data:
            raise ValidationError({'message':'email,username yoki username raqam kiriting'})
        user=CustomUser.objects.filter(
            Q(username=user_data) | Q(email=user_data)).first()
        if not user:
            raise ValidationError(detail="xato malumot kiritdingiz yoki ro'yxatdan o'tmagansiz")
        user_type=check_email_or_username(user_data)


        if user_type=='email':
            code=send_email(user)
        elif user_type=='username':
            if user.email:
                code = send_email(user)
            else:
                raise ValidationError(detail="siz to'liq ro'yxatdan o'tmagansiz ")

        response={
            'status':status.HTTP_201_CREATED,
            'message':'Kodingiz yuborildi',
            'refresh':user.token()['refresh'],
            'access':user.token()['access']
        }
        return response


class ResetPasswordSerializers(serializers.Serializer):
    password=serializers.CharField(required=True,write_only=True)
    conf_password=serializers.CharField(required=True,write_only=True)

    def validate(self, attrs):
        password=attrs.get('password')
        conf_password=attrs.get('conf_password')
        if  password!=conf_password:
            raise ValidationError({'message':'parollar mos emas'})
        elif len(password)<7:
            raise ValidationError({'message':'parol 8 ta belgidan kam bolmasligi kerak'})
        return attrs

    def update(self, instance, validated_data):
        validated_data.pop('conf_password')
        password=validated_data.get('password')
        instance.set_password(password)
        instance.save()
        return instance
