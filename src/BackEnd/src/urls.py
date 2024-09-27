from django.urls import re_path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from users import views

urlpatterns = [
    re_path('signup', views.signup),
    re_path('login', views.login),
    re_path('logout', views.logout),
    re_path('get-user', views.get_user),
    re_path('check-public-key', views.check_public_key),
    re_path('recover', views.recover),
]

urlpatterns += staticfiles_urlpatterns()