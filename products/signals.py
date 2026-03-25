from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product
from .services import generate_image_vector

@receiver(post_save, sender=Product)
def update_product_vector(sender, instance, created, **kwargs):
    if instance.main_image and not instance.image_vector:
        vector = generate_image_vector(instance.main_image)
        Product.objects.filter(id=instance.id).update(image_vector=vector)
