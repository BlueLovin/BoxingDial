from django.contrib import admin
from .models import Post, PostComment

class PostAdmin(admin.ModelAdmin):
    list_display = ('fight', 'content')

class PostCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'content', 'post')
    search_fields = ('post', 'content')

    def approve_comments(self, request, queryset):
        queryset.update(active=True)

admin.site.register(Post, PostAdmin)
admin.site.register(PostComment, PostCommentAdmin)
