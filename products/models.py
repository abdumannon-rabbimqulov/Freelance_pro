

from django.db import models
from users.models import CustomUser
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories',
        verbose_name="Ota kategoriya"
    )
    icon = models.ImageField(upload_to='category_icons/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_all_products(self):
        categories = self.get_descendants(include_self=True)
        return Product.objects.filter(category__in=categories)

    def get_descendants(self, include_self=False):
        descendants = []
        if include_self:
            descendants.append(self)

        for child in self.subcategories.all():
            descendants.append(child)
            descendants.extend(child.get_descendants())

        return descendants


class Product(models.Model):
    title = models.CharField(max_length=300, verbose_name="Sarlavha")
    slug = models.SlugField(max_length=300, unique=True, blank=True,null=True)
    seller = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name="Sotuvchi"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products',
        verbose_name="Kategoriya"
    )

    description = models.TextField(verbose_name="Qisqa tavsif")
    full_description = models.TextField(verbose_name="To'liq tavsif")


    price_standard = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    delivery_time_standard = models.IntegerField(
        null=True,
        blank=True,
    )

    revisions_standard = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Standard reviziyalar soni"
    )

    main_image = models.ImageField(
        upload_to='products/main/',
        verbose_name="Asosiy rasm",
        null=True,blank=True
    )

    views_count = models.IntegerField(default=0, verbose_name="Ko'rilganlar")
    orders_count = models.IntegerField(default=0, verbose_name="Buyurtmalar")
    is_active=models.BooleanField(default=False)



    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)


    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1

            while self.__class__.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug
        super().save(*args, **kwargs)

    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='products/gallery/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.title} "


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.product.title} - {self.rating}"



class Chat(models.Model):
    participants=models.ManyToManyField(CustomUser,related_name='chats')
    created_at = models.DateTimeField(auto_now_add=True)

    def get_recipient(self, current_user):
        return self.participants.exclude(id=current_user.id).first()
    def last_message(self):
        return self.messages.all().last()



class Messages(models.Model):
    user=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='sent_message')
    product=models.ForeignKey(Product,on_delete=models.CASCADE,null=True,blank=True,related_name='shared_posts')
    chat=models.ForeignKey(Chat,on_delete=models.CASCADE,related_name='messages')
    created_at=models.DateTimeField(auto_now_add=True)
    image=models.ImageField(upload_to='message_images/',null=True,blank=True)
    text = models.TextField(null=True,blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering=['created_at']

    def __str__(self):
        return f"{self.user.username}: {self.text[:20]}"