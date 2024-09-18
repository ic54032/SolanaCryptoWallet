from django.db import models


class User(models.Model):
    public_key = models.CharField(max_length=255, unique=True)
    private_key = models.TextField()
    username = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
