from django.shortcuts import render, redirect
from django.http import HttpResponse
from web.models import Task
from .forms import Interview_form


def index(request):
    return render(request, 'web/index.html')


def index(request):
    if request.method == 'POST':
        form = Interview_form(request.POST)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.save()
            return redirect('/')
    else:
        form = Interview_form()
        #form = Interview_form(initial={'service_program': '123'})
    return render(request, 'web/index.html', {'form': form})
