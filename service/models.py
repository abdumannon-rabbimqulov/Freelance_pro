from django.db import models
from django.utils.text import slugify
from users.models import CustomUser
from products.models import Category

class ProjectBoard(models.Model):

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True, blank=True, null=True)

    seller = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='products'
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products'
    )

    description = models.TextField()
    full_description = models.TextField()



    price_standard = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_standard = models.IntegerField(null=True, blank=True)
    revisions_standard = models.IntegerField(null=True, blank=True)

    main_image = models.ImageField(upload_to='products/main/', null=True, blank=True)
    image_vector = models.JSONField(null=True, blank=True)

    views_count = models.IntegerField(default=0)
    orders_count = models.IntegerField(default=0)


    is_active = models.BooleanField(default=True)
    is_published = models.BooleanField(default=False)

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

            while ProjectBoard.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])


class ReviewBoard(models.Model):
    product = models.ForeignKey(ProjectBoard, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.product.name} - {self.rating}"