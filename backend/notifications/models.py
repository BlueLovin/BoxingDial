from django.db import models
from django.contrib.auth.models import User

class Notification(models.Model):
    readonly_fields = ["date", "post_id", "text", "recipient"]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE,
                               related_name='notifications')
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    post_id = models.IntegerField(default=None)