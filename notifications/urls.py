from django.urls import path

from .views import index_page, register_page, login_page, logout_request

urlpatterns = [
    path('', index_page, name='index'),
    path('register/', register_page, name="register"),
    path("login/", login_page, name="login"),
    path("logout/", logout_request, name= "logout"),
]
