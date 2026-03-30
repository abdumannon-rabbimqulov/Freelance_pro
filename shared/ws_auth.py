import os
import django
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
import jwt
from django.conf import settings
from users.models import CustomUser

@database_sync_to_async
def get_user(token):
    try:
        decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_data.get('user_id')
        user = CustomUser.objects.get(id=user_id)
        return user
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, CustomUser.DoesNotExist, Exception):
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    """
    WebSocket ulanishlarida URL manzil orqali keladigan `?token=<jwt-token>` qismini tekshiradi.
    Agar to'g'ri bo'lsa uni `scope['user']` qilib tasdiqlaydi.
    """
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode('utf-8')
        token = None
        
        # ?token=xxxxxx qidirish
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break

        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
