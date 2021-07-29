# Generated by Django 3.2 on 2021-07-07 00:04

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0002_auto_20210706_2254'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userfollowing',
            name='following_user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='followers', to=settings.AUTH_USER_MODEL, unique=True),
        ),
        migrations.AlterField(
            model_name='userfollowing',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='following', to=settings.AUTH_USER_MODEL, unique=True),
        ),
    ]