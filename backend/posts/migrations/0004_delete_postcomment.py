# Generated by Django 4.0.2 on 2022-04-05 22:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0003_rename_user_mentions_postentities_mentioned_users'),
    ]

    operations = [
        migrations.DeleteModel(
            name='PostComment',
        ),
    ]
