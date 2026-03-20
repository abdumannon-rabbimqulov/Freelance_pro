from rest_framework import serializers
from .models import CodeVerify,CustomUser,ADMIN
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