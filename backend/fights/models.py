from django.db import models

class Fight(models.Model):
    title = models.TextField()
    description = models.TextField()
    image_URL = models.TextField()
    result = models.TextField()
    date = models.TextField()

    def __str__(self):
        return self.title
