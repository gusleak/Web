from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.db.models import Max
from django.core.exceptions import ValidationError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.utils.datastructures import MultiValueDictKeyError

from .models import User, Listing, Bid, Comment, Watchlist


def index(request):
    try:
        currentUser = request.user.id
        person = User.objects.get(id=currentUser)
        return render(request, "auctions/index.html", {
            "listings": Listing.objects.all().filter(closed=False),
            "watchlistCount": Watchlist.objects.filter(person=person).count()
        })
    except User.DoesNotExist:
        return render(request, "auctions/index.html", {
            "listings": Listing.objects.all().filter(closed=False)
        })


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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


@login_required
def create(request):
    currentUser = request.user.id
    person = User.objects.get(id=currentUser)
    if request.method == "POST":
        title = request.POST["title"]
        description = request.POST["description"]
        price = request.POST["price"]
        category = request.POST["category"]

        # Upload image to model, exception if no image is selected
        try:
            image = request.FILES["image"]
        except MultiValueDictKeyError:
            image = request.POST.get('image', False)
        try:
            listing = Listing.objects.create(person=person ,title=title, description=description, price=price, image=image, closed=False, category=category)
            listing.save()
        except ValidationError:
            return render(request, "auctions/index.html", {
            "bad_message": "Invalid value(s)"
        })
        return render(request, "auctions/index.html", {
            "good_message": "Listing created successfully.",
            "listings": Listing.objects.all().filter(closed=False),
            "watchlistCount": Watchlist.objects.filter(person=person).count()
        })
    return render(request, "auctions/create.html", {
        "watchlistCount": Watchlist.objects.filter(person=person).count()
    })


def show_listing(request, listing_id):
    listing = Listing.objects.get(pk=listing_id)
    bidCount = Bid.objects.all().filter(item=listing).count()
    commentCount = Comment.objects.all().filter(refItem=listing).count()
    comments = Comment.objects.all().filter(refItem=listing)

    # Get highest bid if it exists, set to None otherwise
    try:
        highestBid = Bid.objects.all().filter(item=listing).order_by('-amount').first().amount
    except:
        highestBid = None
    try:
        currentUser = request.user.id
        person = User.objects.get(id=currentUser)
        try:
            userBid = Bid.objects.all().filter(person=person, item=listing).order_by('-amount').first().amount
        except:
            userBid = None
        if request.method == 'POST':

            # If a comment is posted update
            if 'placeComment' in request.POST:
                text = request.POST["comment"]
                comment = Comment.objects.create(refItem=listing, name=person, text=text)
                comment.save()
                return render(request, "auctions/index.html", {
                    "neutral_message": "Comment placed.",
                    "watchlistCount": Watchlist.objects.filter(person=person).count(),
                    "listings": Listing.objects.all().filter(closed=False)
                })
                
            # Check if forms was submitted from user that made the listing, then the request is for closing the auction
            if person == listing.person:
                listing.closed = True
                listing.save(update_fields=['closed'])
                return render(request, "auctions/index.html", {
                    "good_message": "Auction closed successfully.",
                    "watchlistCount": Watchlist.objects.filter(person=person).count(),
                    "listings": Listing.objects.all().filter(closed=False)
                })
            
            # Otherwise, it is for making a bid
            bidAmount = request.POST["bid"]
            bid = Bid.objects.create(person=person, item=listing, amount=bidAmount)
            bid.save()
            return render(request, "auctions/index.html", {
                "good_message": "Bid placed successfully.",
                "watchlistCount": Watchlist.objects.filter(person=person).count(),
                "listings": Listing.objects.all().filter(closed=False)
            })
        
        # If no POST request is made simply display the listing, check if listing already in watchlist
        try:
             watchedItem = Watchlist.objects.get(person=person, item=listing)
             return render(request, "auctions/listing.html", {
                 "listing": listing,
                 "bidCount": bidCount,
                 "highestBid": highestBid,
                 "userBid": userBid,
                 "onWatchlist": watchedItem,
                 "watchlistCount": Watchlist.objects.filter(person=person).count(),
                 "commentCount": commentCount,
                 "comments": comments
             })
        except Watchlist.DoesNotExist:
            return render(request, "auctions/listing.html", {
                "listing": listing,
                "bidCount": bidCount,
                "highestBid": highestBid,
                "userBid":userBid,
                "watchlistCount": Watchlist.objects.filter(person=person).count(),
                "commentCount": commentCount,
                "comments": comments
            })
    
    # If user is not logged in
    except User.DoesNotExist:
        return render(request, "auctions/listing.html", {
            "listing": listing,
            "highestBid": highestBid,
            "commentCount": commentCount,
            "comments": comments
        })


@login_required
def show_watchlist(request):
    currentUser = request.user.id
    person = User.objects.get(id=currentUser)
    if request.method == 'POST':

        # Get item from Listing models
        listing = request.POST["item"]
        item = Listing.objects.get(id=listing)

        # Try removing object from watchlist, add to watchlist if it doesn't exist
        try:
            watchedItem = Watchlist.objects.get(person=person, item=item)
            watchlist = Watchlist.objects.filter(person=person, item=item).delete()
            return render(request, "auctions/watchlist.html", {
                "watchlist": Watchlist.objects.all().filter(person=person),
                "good_message": "Removed from Watchlist."
            })
        except Watchlist.DoesNotExist:
            watchlist = Watchlist.objects.create(person=person, item=item)
            watchlist.save()
            return render(request, "auctions/watchlist.html", {
                "watchlist": Watchlist.objects.all().filter(person=person),
                "good_message": "Added to Watchlist."
            })
    return render(request, "auctions/watchlist.html", {
        "watchlist": Watchlist.objects.all().filter(person=person)
    })


def show_categories(request):
    categories = ['Home', 'Electronics', 'Clothing', 'Sports', 'Motors']

    # Category is selected 
    if request.method == 'POST':
        selectedCategory = request.POST["category"]
        categorizedListings = Listing.objects.all().filter(closed=False, category=selectedCategory)
        try:
            currentUser = request.user.id
            person = User.objects.get(id=currentUser)
            return render(request, "auctions/categories.html", {
                "selectedCategory": selectedCategory,
                "categories": categories,
                "listings": categorizedListings,
                "watchlistCount": Watchlist.objects.filter(person=person).count()
        })
        except User.DoesNotExist:
            return render(request, "auctions/categories.html", {
                "selectedCategory": selectedCategory,
                "categories": categories,
                "listings": categorizedListings
            })

    # No category selected
    try:
        currentUser = request.user.id
        person = User.objects.get(id=currentUser)
        return render(request, "auctions/categories.html", {
            "categories": categories,
            "listings": Listing.objects.all().filter(closed=False),
            "watchlistCount": Watchlist.objects.filter(person=person).count()
        })
    except User.DoesNotExist:
        return render(request, "auctions/categories.html", {
            "categories": categories,
            "listings": Listing.objects.all().filter(closed=False)
        })
