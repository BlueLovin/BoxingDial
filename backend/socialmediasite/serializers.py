from rest_framework import serializers
from .models import Post

class PostSerialzer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('id', 'fight', 'content')
