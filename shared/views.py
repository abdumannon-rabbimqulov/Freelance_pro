from django.shortcuts import render
import re
from rest_framework.exceptions import ValidationError

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