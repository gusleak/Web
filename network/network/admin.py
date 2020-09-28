from django.contrib import admin
from .models import User, Post, Followers, Following, Comment, PostLikes

# Register your models here.

admin.site.register(User)
admin.site.register(Post)
admin.site.register(Followers)
admin.site.register(Following)
admin.site.register(Comment)
admin.site.register(PostLikes)
