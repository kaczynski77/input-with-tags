from django.urls import path, include
from .views import *

urlpatterns = [
    path('', api_redirect),
    path('categories_json/', api_categories_json),
]
