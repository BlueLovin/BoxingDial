from django.contrib import admin
from .models import Post


class PostAdmin(admin.ModelAdmin):
    list_display = ("fight", "content")

admin.site.register(Post, PostAdmin)
