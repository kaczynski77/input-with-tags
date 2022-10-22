from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
import json


def api_redirect(request):
    return redirect('/')

def api_categories_json(request):
    # with open("/Users/konstantinnistratov/Documents/myDjango/authenticate_email-master/api/files/category.json", 'r') as js_file:
    js_file = '''{"data": ["abbey", "academy", "accountant", "accounting", "acupuncturist"]}'''
    api_json_categories = json.loads(js_file)

    response = JsonResponse(
        api_json_categories
    )
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response["Access-Control-Max-Age"] = "1000"
    response["Access-Control-Allow-Headers"] = "X-Requested-With, Content-Type"
    # return JsonResponse(api_json_categories)
    return response
