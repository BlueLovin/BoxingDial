from django.db import models

class Post(models.Model):
    fight = models.CharField(max_length=120)
    content = models.TextField()

    def _str_(self):
        return self.fight


class PostComment(models.Model):
    post = models.ForeignKey(Post,on_delete=models.CASCADE,related_name='comments')
    content = models.TextField() 

    def __str__(self):
        return self.content
