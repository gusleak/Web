from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")
    timestamp = models.DateTimeField(auto_now_add=True)
    body = models.CharField(max_length=280)
    likes = models.IntegerField()

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes
        }


class Followers(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_followers")
    followers = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "followers": self.followers.username
        }

class Following(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_following")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "following": self.following.username
        }

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="commenter")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="commentOnPost")
    timestamp = models.DateTimeField(auto_now_add=True)
    body = models.CharField(max_length=280)
    likes = models.IntegerField()

    def serialize(self):
        return {
            "id": self.id,
            "post": self.post,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "body": self.body,
            "likes": self.likes
        }

class PostLikes(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liker")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likedPost")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "post": self.post
        }
