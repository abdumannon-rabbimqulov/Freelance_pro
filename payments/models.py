from django.db import models
from users.models import CustomUser
import uuid

class PlatformSetting(models.Model):
    commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.pk = 1 # Singleton pattern
        super().save(*args, **kwargs)

    @classmethod
    def get_setting(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"Komissiya: {self.commission_percent}%"

class Transaction(models.Model):
    TYPE_CHOICES = (
        ('order_payment', 'Order Payment'),
        ('commission', 'Platform Commission'),
        ('withdrawal', 'Withdrawal'),
        ('deposit', 'Top Up Balance'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"

class PayoutRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payout_requests')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payout {self.seller.username} - {self.status}"

class Card(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='cards')
    card_number = models.CharField(max_length=16)
    expiry_date = models.CharField(max_length=5) # MM/YY
    cvv = models.CharField(max_length=3)
    card_holder = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - ****{self.card_number[-4:]}"
