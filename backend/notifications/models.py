from django.db import models
from django.contrib.auth.models import User

class Notification(models.Model):
    readonly_fields = ["date", "post_id", "text", "recipient", "sender"]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE,
                               related_name='notifications')

    sender = models.CharField(max_length=50)

    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    post_id = models.IntegerField(default=None)