from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Post, PostComment, Fight
from django.contrib.auth.models import User

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser')
    search_fields = ('username', )

class PostAdmin(admin.ModelAdmin):
    list_display = ('fight', 'content')

class FightAdmin(admin.ModelAdmin):
    list_display = ('title', 'description')
    search_fields = ('title', 'description')

class PostCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'content', 'post')
    search_fields = ('post', 'content')

    def approve_comments(self, request, queryset):
        queryset.update(active=True)

admin.site.unregister(User)
admin.site.register(Post, PostAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Fight, FightAdmin)
admin.site.register(PostComment, PostCommentAdmin)
