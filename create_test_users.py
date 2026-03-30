import os
import django
from django.db import IntegrityError

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "conf.settings")
django.setup()

from users.models import CustomUser, ADMIN, SELLER, CUSTOMER, DONE

users_data = [
    {
        "username": "admin_user",
        "email": "admin@freelance.uz",
        "password": "Admin123!",
        "auth_role": ADMIN,
        "first_name": "Admin",
        "last_name": "Adminov"
    },
    {
        "username": "seller_user",
        "email": "seller@freelance.uz",
        "password": "Seller123!",
        "auth_role": SELLER,
        "first_name": "Asadbek",
        "last_name": "Mannonov"
    },
    {
        "username": "client_user",
        "email": "client@freelance.uz",
        "password": "Client123!",
        "auth_role": CUSTOMER,
        "first_name": "Mijoz",
        "last_name": "Mijozov"
    }
]

print("-" * 50)
print("TEST FOYDALANUVCHILARI (API va Sayt uchun):")
print("-" * 50)

for u_data in users_data:
    try:
        user, created = CustomUser.objects.get_or_create(
            email=u_data['email'],
            defaults={
                'username': u_data['username'],
                'auth_role': u_data['auth_role'],
                'auth_status': DONE,
                'first_name': u_data['first_name'],
                'last_name': u_data['last_name'],
            }
        )
        if created or not user.check_password(u_data['password']):
            user.set_password(u_data['password'])
            user.auth_status = DONE
            user.save()
            print(f"Yaratildi/Yangilandi: Role: {u_data['auth_role'].upper()}")
            print(f"Login (Email/Username): {u_data['email']} yoki {u_data['username']}")
            print(f"Parol: {u_data['password']}\n")
        else:
            print(f"Mavjud: Role: {u_data['auth_role'].upper()}")
            print(f"Login: {u_data['email']} yoki {u_data['username']}")
            print(f"Parol: {u_data['password']}\n")
            
    except IntegrityError as e:
        print(f"Xatolik yuz berdi {u_data['email']} yaratishda: {e}\n")

print("-" * 50)
print("Bularni Tizimga kirish (Login) API orqali ishlatsangiz bo'ladi!")

