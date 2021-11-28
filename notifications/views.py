from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm

from .forms import NewUserForm, TestNotification

from firebase_admin.messaging import Message
from fcm_django.models import FCMDevice


def index_page(request):
    if request.method == "POST":
        form = TestNotification(request.POST)
        if form.is_valid():
            message_obj = Message(
                data={
                    'title': form.cleaned_data.get('title'),
                    'body': form.cleaned_data.get('body'),
                    'icon_url': form.cleaned_data.get('icon_url'),
                    'url': form.cleaned_data.get('url'),
                },
            )
            devices = FCMDevice.objects.filter(user_id=form.cleaned_data.get('user_id'))
            if devices.exists():
                print(devices)
                devices.send_message(message_obj)
                return redirect('index')
        messages.error(
            request, "Unsuccessful. Invalid information.")
    form = TestNotification()
    return render(request, 'notifications/index.html', context={'form': form})


def register_page(request):
    if request.method == "POST":
        form = NewUserForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Registration successful.")
            return redirect("login")
        messages.error(
            request, "Unsuccessful registration. Invalid information.")
    form = NewUserForm()
    return render(request=request, template_name="notifications/register.html", context={"register_form": form})


def login_page(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.info(request, f"You are now logged in as {username}.")
                return redirect("index")
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid username or password.")
    form = AuthenticationForm()
    return render(request=request, template_name="notifications/login.html", context={"login_form": form})

def logout_request(request):
	logout(request)
	messages.info(request, "You have successfully logged out.") 
	return redirect("index")
