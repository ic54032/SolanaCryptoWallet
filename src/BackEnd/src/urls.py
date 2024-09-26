from django.urls import re_path, include, path

from users import views

urlpatterns = [
    re_path('signup', views.signup),
    re_path('login', views.login),
    re_path('get-user', views.getUserByToken),
    re_path('check-public-key', views.check_public_key),
    re_path('recover', views.recover),
]
