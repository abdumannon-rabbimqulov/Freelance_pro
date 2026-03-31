import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conf.settings')
django.setup()

from django.test import Client
from users.models import CustomUser
from products.models import Product

client = Client()
user = CustomUser.objects.first() # Get a user to act as client
client.force_login(user)

product = Product.objects.first()
if product:
    response = client.post('/orders/', {'product': product.id, 'requirements': 'test'}, content_type='application/json')
    print("STATUS CODE:", response.status_code)
    print("RESPONSE JSON:", response.json())
else:
    print("NO PRODUCT FOUND")
