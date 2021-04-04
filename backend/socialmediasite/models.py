from django.db import models

class Post(models.Model):
    fight = models.CharField(max_length=120)
    content = models.TextField()

    def _str_(self):
        return self.fight
