from django.db import models
from django.contrib.auth.models import User

class Subscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.CharField(max_length=50)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.user.username} - {self.plan}"
