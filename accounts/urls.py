from django.urls import path

from . import views

urlpatterns = [
    path('register/', views.register_page, name="register"),
    path("login/", views.login_page, name="login"),
    path("logout/", views.logout_request, name= "logout"),
]
