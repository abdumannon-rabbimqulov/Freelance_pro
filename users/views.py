from .models import CodeVerify,NEW,CODE_VERIFY,DONE
from datetime import datetime
from rest_framework.exceptions import ValidationError
import random
from django.core.mail import send_mail
from django.conf import settings
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView,UpdateAPIView
from rest_framework.permissions import AllowAny,IsAuthenticated

def send_email(user):
    active_codes=CodeVerify.objects.filter(user=user,expiration_time__gte=datetime.now())
    if active_codes.exists():
        raise ValidationError({'message':'sizda active code bor'})
    code =random.randint(1000,9999)
    CodeVerify.objects.create(
        code=code,
        user=user,
    )

    try:
        send_mail(
            "Tasdiqlash kodi",
            f" Sizning tasdiqlash kodingiz {code}",
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently = False,
        )
        return True
    except Exception as e:
        raise ValidationError({'message':f" Email yuborishda xatolik: {e}"})


class SingUpView(CreateAPIView):
    permission_classes = (AllowAny, )
    serializer_class = SingUpSerializers
    queryset = CustomUser


class CodeVerifyView(APIView):
    permission_classes = (IsAuthenticated, )
    def post(self,request):
        user=request.user
        code=self.request.data.get('code')
        user_code=CodeVerify.objects.filter(code=code,user=user,
                                expiration_time__gte=datetime.now(),is_active=True
                                        )
        if not user_code.exists():
            raise ValidationError({
                'status':status.HTTP_400_BAD_REQUEST,
                'message':"Kodingiz xato yoki eskirgan"
            })
        else:
            user_code.update(is_active=False)

        if user.auth_status==NEW:
            user.auth_status=CODE_VERIFY
            user.save()

        response={
            'status':status.HTTP_200_OK,
            'message':'Kodingiz tasdiqlandi',
            'refresh':user.token()['refresh'],
            'access':user.token()['access']
        }
        return Response(response)


class GetNewCode(APIView):
    permission_classes = (IsAuthenticated, )
    def post(self,request):
        user=request.user
        if user:
            code = send_email(user)
        response={
            'status':status.HTTP_201_CREATED,
            'message':'Kodingiz yuborildi 2 minut vaqtizdan keyin ishlamaydi'
        }
        return Response(response)

class UserChangeInfoView(UpdateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = UserChangeInfoSerializers
    queryset = CustomUser

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer=self.get_serializer(self.get_object(),data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response={
                "status": status.HTTP_201_CREATED,
                "message": "Siz muvaffaqiyatli ro'yxatdan o'tdiz!"
            },
        return Response(response)
