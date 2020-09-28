import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import ListView

from .models import User, Post, Followers, Following, Comment, PostLikes


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def compose(request):

    # Composing a post via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get content and check for empty post
    data = json.loads(request.body)
    postBody = data.get("body", "")
    if postBody == [""]:
        return JsonResponse({"error": "Empty post"}, status=400)

    post = Post(user=request.user, body=postBody, likes=0)
    post.save()

    return JsonResponse({"message": "Post created successfully."}, status=201)
    

def all_posts(request, num_page):
    
    # Get all current posts
    posts = list(Post.objects.all().order_by("-timestamp"))

    # Implement Paginator
    p = Paginator(posts, 10)
    currentPage = p.page(num_page)

    return JsonResponse([post.serialize() for post in currentPage.object_list], safe=False)
    

def profile_posts(request, username, num_page):

    # Get user posts
    user_id = User.objects.filter(username=username).first()
    userPosts = Post.objects.all().filter(user=user_id).order_by("-timestamp")

    # Implement Paginator
    p = Paginator(userPosts, 10)
    currentPage = p.page(num_page)

    return JsonResponse([post.serialize() for post in currentPage.object_list], safe=False)


@csrf_exempt
def user_profile(request, username):

    try:
        user_id = User.objects.filter(username=username).first()

        # Convert queries to lists
        followers = Followers.objects.all().filter(user=user_id)
        following = Following.objects.all().filter(user=user_id)

    except Followers.DoesNotExist or Following.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    # Visiting user profile
    if request.method == "GET":
        
        follows = list(followers) + list(following)
        return JsonResponse([follow.serialize() for follow in follows], safe=False)

    # Hitting Follow button
    elif request.method == "POST":
        
        # Account for existing Follow object (i.e. followed before, stopped, wants to re-follow)

        data = json.loads(request.body)
        userFollowing_id = User.objects.filter(username=data.get("following", "")).first()
        userFollowing = Followers(user=userFollowing_id, followers=request.user)
        userFollowing.save()

        currentUser = Following(user=request.user, following=userFollowing_id)
        currentUser.save()

        return JsonResponse({"message": "Started following user."}, status=201)
    
    # Hitting Unfollow button
    elif request.method == "PUT":

        data = json.loads(request.body)
        userFollowing_id = User.objects.filter(username=data.get("following", "")).first()

        userFollowing = Followers.objects.get(user=userFollowing_id, followers=request.user)
        userFollowing.delete()

        currentUser = Following.objects.get(user=request.user, following=userFollowing_id)
        currentUser.delete()

        return JsonResponse({"message": "Stopped following user."}, status=201)


@login_required
def following_posts(request, num_page):

    posts = []
    followingPeople = Following.objects.filter(user=request.user)

    # Sort all posts with reverse chronological order
    sortedPosts = Post.objects.all().order_by("-timestamp")
    for followingPost in sortedPosts:
        
        # Append posts from following users
        if str(followingPost.user) in [person.following.username for person in followingPeople]:
            posts.append(followingPost)

    # Implement Paginator
    p = Paginator(posts, 10)
    currentPage = p.page(num_page)

    return JsonResponse([post.serialize() for post in currentPage.object_list], safe=False)


@csrf_exempt
def edit_post(request, post_id):

    if request.method == 'PUT':
        data = json.loads(request.body)
        post = Post.objects.get(id=post_id)
        post.body = data.get("body", "")
        post.save()
        return JsonResponse(post.serialize())


def like_post(request, post_id):
    
    post = Post.objects.get(pk=post_id)
    try:
        
        # If post exists, delete and remove one like
        postLike = PostLikes.objects.get(user=request.user, post=post)
        postLike.delete()

        post.likes -= 1
        post.save()
        return JsonResponse(post.serialize())

    except PostLikes.DoesNotExist or IntegrityError:

        # Otherwise, create and add one like
        postLike = PostLikes(user=request.user, post=post)
        postLike.save()

        post = Post.objects.get(pk=post_id)
        post.likes += 1
        post.save()
        
        return JsonResponse(post.serialize())