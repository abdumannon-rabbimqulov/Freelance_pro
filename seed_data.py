from products.models import Category, Product
from users.models import CustomUser
from django.utils.text import slugify
import random

def run():
    print("Seeding Categories...")
    cats = [
        "Website Design", "Django Backend", "React Frontend", 
        "Logo Design", "SEO Optimization", "Video Editing", 
        "Digital Marketing", "Mobile Apps", "Data Science", "Copywriting"
    ]
    created_cats = []
    for c in cats:
        cat, created = Category.objects.get_or_create(
            name=c,
            defaults={'slug': slugify(c), 'description': f'{c} professional xizmatlari'}
        )
        created_cats.append(cat)
    print(f"{len(created_cats)} ta Kategoriya bazada tayyor.")

    print("Seeding Products for Seller...")
    try:
        seller = CustomUser.objects.get(email='seller@freelance.uz')
    except CustomUser.DoesNotExist:
        print("Seller topilmadi, iltimos oldin admin@freelance.uz test akkauntlarini yarating.")
        return

    # Delete existing products to avoid spam if run multiple times
    Product.objects.filter(seller=seller).delete()

    products_data = [
        ("I will design an amazing React website", 150.00, 5, 2),
        ("I will build a custom Django backend API", 250.00, 7, 3),
        ("I will create a stunning logo design for you", 85.00, 3, 5),
        ("I will optimize your website for SEO ranking", 120.00, 4, 1),
        ("I will edit your YouTube videos professionally", 90.00, 2, 2),
        ("I will manage your Digital Marketing campaigns", 300.00, 14, 0),
        ("I will develop an iOS MVP mobile app", 800.00, 30, 4),
        ("I will do Python Data Analysis and Visualization", 180.00, 6, 2),
        ("I will write high-converting sales copy", 75.00, 3, 3),
        ("I will deploy your app using Docker & AWS", 200.00, 4, 1)
    ]

    for idx, (title, price, days, revs) in enumerate(products_data):
        cat = created_cats[idx] # pick matching category roughly
        Product.objects.create(
            title=title,
            seller=seller,
            category=cat,
            description=f"Bu yerda siz {title} bo'yicha eng zo'r sifati olasiz.",
            full_description=f"Assalomu alaykum! Men o'z sohamning mutaxassisiman. {title} va boshqa turdagi yordamlar kerak bo'lsa murojaat qiling.",
            price_standard=price,
            delivery_time_standard=days,
            revisions_standard=revs,
            is_active=True,
            orders_count=random.randint(0, 100),
            views_count=random.randint(10, 500)
            # eslatma: main_image va image_vector vaqtincha bo'sh turadi
        )
    print("10 ta Product yaratildi!")

run()
