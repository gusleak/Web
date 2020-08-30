from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>/", views.entry, name="entry"),
    path("search/", views.search, name="search"),
    path("new/", views.create, name="new"),
    path("wiki/<str:title>/edit/", views.edit, name="edit"),
    path("random/", views.get_random, name="random")
]
