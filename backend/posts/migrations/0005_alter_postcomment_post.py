# Generated by Django 3.2.7 on 2021-10-17 21:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0004_alter_postcomment_post'),
    ]

    operations = [
        migrations.AlterField(
            model_name='postcomment',
            name='post',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='posts.post'),
        ),
    ]
