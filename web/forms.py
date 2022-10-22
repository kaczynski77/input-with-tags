from django import forms
from django.forms import ModelForm
from web.models import Task
from django.db import models




class Interview_form(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['request', 'location01']
        widgets = {
            'request': forms.TextInput(attrs={'class': 'style_task_form'}),
            'location01': forms.Textarea(attrs={'value': 123}),
        }
