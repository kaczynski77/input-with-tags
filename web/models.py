from django.db import models
from django.urls import reverse

class Task(models.Model):
    request = models.TextField(verbose_name='request_query')
    location01 = models.CharField(max_length=200, verbose_name='first_location')

    def delete_url(self):
        return reverse('delete-model', kwargs={'pk': self.id})
