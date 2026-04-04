from django.db import models
from users.models import CustomUser
from products.models import Product
from service.models import ProjectBoard
import uuid

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='client_orders')
    seller = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='seller_orders')
    
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    project = models.ForeignKey(ProjectBoard, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_time = models.IntegerField(help_text="Delivery time in days")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requirements = models.TextField(blank=True, null=True)
    
    # Delivery (Work proof)
    delivery_text = models.TextField(blank=True, null=True)
    delivery_file = models.FileField(upload_to='deliveries/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Sifat nazorati uchun
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Order #{str(self.id)[:8]} - {self.status}"
