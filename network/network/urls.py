from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    # API Routes
    path("posts", views.compose, name="compose"),
    path("follows/<str:username>", views.user_profile, name="profile"),
    path("posts/profile/<str:username>/<int:num_page>", views.profile_posts, name="profile_posts"),
    path("posts/following/<int:num_page>",views.following_posts, name="following_posts"),
    path("posts/all_posts/<int:num_page>", views.all_posts, name="all_posts"),
    path("posts/edit_post/<int:post_id>", views.edit_post, name="edit_post"),
    path("posts/like_post/<int:post_id>", views.like_post, name="like_post")
]
