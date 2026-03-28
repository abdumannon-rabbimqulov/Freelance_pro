from django.shortcuts import render
import re
from rest_framework.exceptions import ValidationError
import random
from users.models import CodeVerify
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime

email_regex = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

username_regex = re.compile(
    r"^(?=.{4,32}$)(?![_.-])(?!.*[_.]{2})[a-zA-Z0-9._-]+(?<![_.])$"
)

def check_email_or_username(user_input):
    if re.fullmatch(email_regex, user_input):
        return 'email'
    elif re.fullmatch(username_regex,user_input):
        return 'username'
    else:
        raise ValidationError({
            "status": False,
            "message": "Email yoki username raqami noto'g'ri kiritildi."
        })

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

def home_view(request):
    return render(request, 'index.html')