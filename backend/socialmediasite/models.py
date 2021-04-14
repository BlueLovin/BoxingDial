from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    fight = models.CharField(max_length=120)
    content = models.TextField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts', null=True)

    def _str_(self):
        return self.fight


class PostComment(models.Model):
    post = models.ForeignKey(Post,on_delete=models.CASCADE, related_name='comments')
    content = models.TextField() 
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments', null=True)


    def __str__(self):
        return self.content
