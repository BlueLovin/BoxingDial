# Generated by Django 3.2 on 2021-08-10 16:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('socialmediasite', '0022_auto_20210810_1619'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='postcomment',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
