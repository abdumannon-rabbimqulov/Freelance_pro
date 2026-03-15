from django.db import models

from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from datetime import datetime,timedelta
from django.core.cache import cache

ADMIN,SELLER,Custom=('admin','seller','custom')
NEW,CODE_VERIFY,DONE=('new','code_verify','done')
class CustomUser(AbstractUser):
    USER_ROLE=(
        (ADMIN,ADMIN),
        (SELLER,SELLER),
        (Custom,Custom),
    )
    USER_STATUS=(
    (NEW,NEW),
    (CODE_VERIFY,CODE_VERIFY),
    (DONE,DONE)
    )
    auth_role=models.CharField(choices=USER_ROLE,max_length=20)
    auth_status=models.CharField(choices=USER_STATUS,default=NEW,max_length=20)
    email=models.EmailField(unique=True)
    phone=models.CharField(unique=True,max_length=13,blank=True,null=True)
    photo=models.ImageField(upload_to='user_photo/',
            blank=True,null=True,
            validators=[FileExtensionValidator(allowed_extensions=['png','jpg','heic'])]
                            )
    created_at=models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.username

    @property
    def is_online(self):
        return cache.get(f"last-seen-{self.id}") is not None

    @property
    def last_seen(self):
        return cache.get(f"last-seen-{self.id}")



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


