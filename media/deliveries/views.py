# sharhni tahrirlash(ozinikini)
# sharhni o‘chirish(ozinikini)


import random
from django.utils import timezone

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate,login,logout
from product.models import Products, Category
from .models import Users,Emailcode
from django.views import View
from django.core.mail import send_mail
from django.conf import settings


def send_otp(user):
    code=str(random.randint(100000,999999))
    Emailcode.objects.update_or_create(users=user,defaults={'code':code,'created_at':timezone.now()})
    try:
        send_mail(
            'Tasdiqlash kodi',
            f"Sizning ro'yxatdan o'tish kodingiz: {code}",
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"❌ Email yuborishda xatolik: {e}")
        return False

class RegisterView(View):
    def get(self,request):
        return render(request,'register.html')
    def post(self,request):
        u=request.POST.get('username')
        e=request.POST.get('email')
        p=request.POST.get('password')
        cp=request.POST.get('password2')
        if Users.objects.filter(username=u).exists():
            return render(request,'register.html', {'error': "bu username band"})
        if p!=cp:
            return render(request,'register.html',{'error':'parol mos emas'})
        user=Users.objects.create_user(
            username=u,
            email=e,
            password=p,
            is_active=False,
        )
        if send_otp(user):
            request.session['temp_user_id'] = user.id
            return redirect('verify_otp')
        else:
            user.delete()
            return render(request, 'register.html', {
                'error': "Email yuborish imkonsiz. Manzilni to'g'ri kiritganingizni tekshiring!"
            })
class VerifyEmailView(View):
    def get(self, request):
        return render(request, 'verify_otp.html')

    def post(self, request):
        code = request.POST.get('code')
        user_id = request.session.get('temp_user_id')

        if not user_id:
            return redirect('register')

        try:
            email_obj = Emailcode.objects.get(users_id=user_id, code=code)
            if email_obj.is_valid():
                user = email_obj.users
                user.is_active = True
                user.save()
                email_obj.delete()
                return redirect('login')
            else:
                return render(request, 'verify_otp.html', {'error': 'Kod vaqti o‘tgan!'})
        except Emailcode.DoesNotExist:
            return render(request, 'verify_otp.html', {'error': 'Noto‘g‘ri kod!'})
class LoginView(View):
    def get(self,request):
        return render(request,'login.html')

    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            return render(request, 'login.html', {'error': 'Username yoki parol xato!'})
class LogoutView(View):
    def get(self,request):
        logout(request)
        return redirect('login')

class ResendOTPView(View):
    def get(self,request):
        user_id=request.session.get('temp_user_id')
        if not user_id:
            return redirect('register')

        try:
            user=Users.objects.get(id=user_id)
            if send_otp(user):
                return redirect('verify_otp')
            else:
                user.delete()
                return render(request, 'verify_otp.html', {'error': 'Email yuborishda xato!'})
        except Users.DoesNotExist:
            return redirect('register')


class IndexView(View):
    def get(self,request):
        products=Products.objects.all().order_by('-id')
        categories=Category.objects.all()


        category_id=request.GET.get('category')

        if category_id:
            products=products.filter(category_id=category_id)

        search_query=request.GET.get('q')
        if search_query:
            products=products.filter(title__icontains=search_query)

        context={
            'products':products,
            'categories':categories
        }
        return render(request,'home.html',context)
class UserUdateView(View):
    def get(self,request,pk):
        user = Users.objects.get(id=pk)
        return render(request,'userupdate.html',{'user':user})
    def post(self,request,pk):
        user = Users.objects.get(id=pk)
        phone=request.POST.get('phone')
        password=request.POST.get('password')
        confirm_password=request.POST.get('confirm_password')
        address=request.POST.get('address')
        email=request.POST.get('email')
        if email and Users.objects.filter(email=email).exclude(id=user.id).exists():
            return render(request,'profil.html',{'erorr':'Bu email mavjud'})
        if password!=confirm_password:
            return render(request,'profil.html',{"erorr":"parol mos kelmadi"})
        user.phone=phone
        user.address=address
        user.email=email
        if password:
            user.set_password(password)
        user.save()

        return redirect('login')




