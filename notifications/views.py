from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required

from .forms import TestNotification

from firebase_admin.messaging import Message
from fcm_django.models import FCMDevice


@login_required
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
