from rest_framework.permissions import BasePermission, SAFE_METHODS
from users.models import DONE

class IsProfileComplete(BasePermission):
    """
    Foydalanuvchi akkauntini tasdiqlagan va profil detallarini kiritgan 
    (.auth_status == 'done') bo'lishi kerakлигини tekshiruvchi Permissions classi.
    """
    message = "Profilni to'liq to'ldirishingiz majburiy. Iltimos shaxsiy sahifangizdan username va parolingizni kiriting."
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.auth_status == DONE)


class IsProfileCompleteOrReadOnly(BasePermission):
    """
    Kiritish (GET) uchun hammaga, o'zgartirish (POST, PUT, DELETE) uchun faqat to'liq profilga ruxsat.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.auth_status == DONE)
