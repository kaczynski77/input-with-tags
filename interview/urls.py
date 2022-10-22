from django.contrib import admin
from django.urls import path, include
from web.views import *

urlpatterns = [
    path('admin/', admin.site.urls, name='admin_page'),
    path('', index),
    path('api/', include('api.urls'))
]
