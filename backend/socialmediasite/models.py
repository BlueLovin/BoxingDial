from django.db import models
from django.contrib.auth.models import User


class Post(models.Model):
    fight = models.ForeignKey('Fight', on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='posts', null=True)
    username = models.TextField()

    def _str_(self):
        return self.fight


class PostComment(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='comments', null=True)

    username = models.TextField()

    def __str__(self):
        return self.content

class Fight(models.Model):
    title = models.TextField()
    description = models.TextField()
    image_URL = models.TextField()
    date = models.TextField()
    #posts = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='posts', blank=True, null=True)

    def _str_(self):
        return self.title
