from .models import CodeVerify,NEW,CODE_VERIFY,DONE
from datetime import datetime
from rest_framework.exceptions import ValidationError
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView,UpdateAPIView
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken


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

class UserChangePhotoView(UpdateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = UserPhotoSerializers
    queryset = CustomUser

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data,partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response = {
            "status": status.HTTP_201_CREATED,
            "message": "Siz muvaffaqiyatli ro'yxatdan o'tdiz!"
        },
        return Response(response)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializers


class LogoutView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self,request):
        refresh=self.request.data.get('refresh')
        try:
            refresh_token=RefreshToken(refresh)
            refresh_token.blacklist()
        except Exception as e:
            raise ValidationError(detail=f" xatolik {e}")
        else:
            response={
                'status':status.HTTP_200_OK,
                'message':"Siz logout qildiz"
            }
        return Response(response)


class RefreshTokenView(APIView):
    def post(self,request):
        refresh=self.request.data.get('refresh')
        try:
            refresh_token=RefreshToken(refresh)
        except Exception as e:
            raise ValidationError(detail=f"xato yoki vaqti tugadi {e}")
        else:
            response={
                'status':status.HTTP_200_OK,
                'message':'sizni tokeniz yangilandi',
                'access':str(refresh_token.access_token)
            }
        return Response(response)


class ForgotPasswordView(APIView):
    permission_classes = (AllowAny, )
    def post(self,request):
        serializer=ForgotPasswordSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        response_data = serializer.validated_data
        response = {
            'status': status.HTTP_200_OK,
            "message": response_data.get('message'),
            "access": response_data.get('access'),
            "refresh": response_data.get('refresh'),
        }
        return Response(response)


class ResetPasswordCodeView(APIView):
    permission_classes = (IsAuthenticated, )
    def post(self,request):
        code=self.request.data.get('code')
        user=self.request.user
        user_code = CodeVerify.objects.filter(code=code, user=user,
                                              expiration_time__gte=datetime.now(), is_active=True
                                              )
        if not user_code.exists():
            raise ValidationError({
                'status': status.HTTP_400_BAD_REQUEST,
                'message': "Kodingiz xato yoki eskirgan"
            })
        else:
            user_code.update(is_active=False)


        response = {
            'status': status.HTTP_200_OK,
            'message': 'Kodingiz tasdiqlandi',
        }
        return Response(response)



class ResetPasswordView(APIView):
    permission_classes = (IsAuthenticated, )
    def post(self,request):
        user=request.user
        serializer=ResetPasswordSerializers(data=request.data,instance=user)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response={
            'status':status.HTTP_200_OK,
            'message':"Siz muffaqiyatli parolizni tikladiz",
        }
        return Response(response)
    6546546435
