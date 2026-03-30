from django.db import models
from rest_framework_simplejwt.tokens import RefreshToken
from shared.models import BasModel
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from datetime import datetime,timedelta
from django.core.cache import cache
import uuid
import random

ADMIN,SELLER,CUSTOMER=('admin','seller','customer')
NEW,CODE_VERIFY,DONE=('new','code_verify','done')
class CustomUser(AbstractUser,BasModel):
    USER_ROLE=(
        (ADMIN,ADMIN),
        (SELLER,SELLER),
        (CUSTOMER,CUSTOMER),
    )
    USER_STATUS=(
    (NEW,NEW),
    (CODE_VERIFY,CODE_VERIFY),
    (DONE,DONE)
    )
    auth_role=models.CharField(choices=USER_ROLE,default=CUSTOMER,max_length=20)
    auth_status=models.CharField(choices=USER_STATUS,default=NEW,max_length=20)
    email=models.EmailField(unique=True)
    phone=models.CharField(unique=True,max_length=13,blank=True,null=True)
    photo=models.ImageField(upload_to='user_photo/',
            blank=True,null=True,
            validators=[FileExtensionValidator(allowed_extensions=['png','jpg','heic'])]
                            )
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.username} Role {self.auth_role}"

    @property
    def is_online(self):
        return cache.get(f"last-seen-{self.id}") is not None

    @property
    def last_seen(self):
        return cache.get(f"last-seen-{self.id}")

    @property
    def completed_orders_count(self):
        from orders.models import Order
        return Order.objects.filter(seller=self, status='completed').count()

    @property
    def cancelled_orders_count(self):
        from orders.models import Order
        return Order.objects.filter(seller=self, status='cancelled').count()


    def check_username(self):
        if not self.username:
            temp_username=f"username{uuid.uuid4().__str__().split('-')[-1]}"
            while CustomUser.objects.filter(username=temp_username).exists():
                temp_username+=str(random.randint(0,9))

            self.username=temp_username
    def check_pass(self):
        if not self.password:
            temp_password=f"pass{uuid.uuid4().__str__().split('-')[-1]}"

            self.set_password(temp_password)

    def check_email(self):
        if self.email:
            email_normalize=self.email.lower()
            self.email=email_normalize



    def save(self,*args,**kwargs):
        self.check_email()
        self.check_username()
        self.check_pass()
        super().save(*args,**kwargs)





    def token(self):
        refresh_token=RefreshToken.for_user(self)
        data={
            'refresh':str(refresh_token),
            'access':str(refresh_token.access_token)
        }
        return data


class CodeVerify(models.Model):
    user=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='verify_codes')
    code=models.CharField(max_length=6)
    expiration_time=models.DateTimeField()
    is_active=models.BooleanField(default=True)

    def save(self,*args,**kwargs):
        self.expiration_time=datetime.now()+ timedelta(minutes=2)
        super().save(*args,**kwargs)

    def __str__(self):
        return f"{self.user.username} kodi {self.code}"


