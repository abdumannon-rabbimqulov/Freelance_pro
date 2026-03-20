from rest_framework import serializers
from .models import (CodeVerify,
            CustomUser,ADMIN,
            CODE_VERIFY,DONE
            )
from rest_framework.exceptions import ValidationError
from .views import send_email

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
        if auth_role==ADMIN:
            raise ValidationError({"message":"siz admin to'g'idan to'g'ri admin huquqiga ega bo'lmasiz"})
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
        user_query = CustomUser.objects.filter(username=username)

        if user_query.exists():
            raise ValidationError({'message': 'Bu username band'})
        if len(username) < 6:
            raise ValidationError({'message': 'Username kamida 7 belgidan iborat bolishi kerek'})
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

