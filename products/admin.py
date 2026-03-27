from django.contrib import admin
from .models import Category,Product,ProductImage,Messages,Chat
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(ProductImage)
admin.site.register(Messages)
admin.site.register(Chat)