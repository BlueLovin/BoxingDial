from django.contrib import admin
from fights.models import Fight


class FightAdmin(admin.ModelAdmin):
    list_display = ('title', 'description')
    search_fields = ('title', 'description')

    
admin.site.register(Fight, FightAdmin)