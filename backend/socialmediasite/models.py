from django.db import models
from django.contrib.auth.models import User


class PostComment(models.Model):
    post = models.ForeignKey(
        'Post', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='comments', null=True)

    username = models.TextField()

    def __str__(self):
        return self.content


class Fight(models.Model):
    title = models.TextField()
    description = models.TextField()
    image_URL = models.TextField()
    result = models.TextField()
    date = models.TextField()

    def __str__(self):
        return self.title


class Post(models.Model):
    fight = models.ForeignKey(
        Fight, on_delete=models.CASCADE, related_name='posts', blank=True, default='')
    content = models.TextField()
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='posts', null=True)
    username = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    @property
    def truncated_content(self):
        if(len(self.content) > 25):
            return self.content[:25] + "..."

        return self.content

    def __str__(self):
        return self.content
