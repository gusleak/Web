from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Listing(models.Model):
    person = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lister")
    title = models.CharField(max_length=20)
    description = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    image = models.ImageField(upload_to='images/', null=True, blank=True)
    date = models.DateTimeField(auto_now=True)
    closed = models.BooleanField()
    category = models.CharField(max_length=15)

    def __str__(self):
        return f"\n{self.title} - {self.description}\nInitial price: {self.price}€\n{self.image}"

class Bid(models.Model):
    item = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bidItem")
    person = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bidder")
    amount = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"\n{self.person} placed a bid of {self.amount}€ on the following item: \n{self.item}."

class Comment(models.Model):
    refItem = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="commentItem")
    name = models.ForeignKey(User, on_delete=models.CASCADE, related_name="commenter")
    text = models.CharField(max_length=300)
    dateComment = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"\n{self.name} placed a comment on {self.dateComment} for the following item:\n{self.refItem}\n'{self.text}'"

class Watchlist(models.Model):
    person = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watcher")
    item = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="watchItem")
