from django import forms
from django.shortcuts import render

from markdown2 import Markdown

from . import util

import random

class NewPageForm(forms.Form):
    title = forms.CharField(label="Title", max_length=100, widget=forms.TextInput(
        attrs={'class': 'form-control', 'style':'width:80%;', 'placeholder':'Enter title'}))
    content = forms.CharField(label="Page Content", widget=forms.Textarea(
        attrs={'class': 'form-control', 'style':'width:80%'}))

class ExistingPageForm(forms.Form):
    content = forms.CharField(label="Page Content", widget=forms.Textarea(
        attrs={'class': 'form-control', 'style': 'width:80%'}))

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, title):
    md = Markdown()
    if util.get_entry(title) != None:
        return render(request, "encyclopedia/entry.html", {
            "entry": md.convert(util.get_entry(title)),
            "title": title
        })
    else:
        return render(request, "encyclopedia/apology.html", {
            "text": "The page you are looking for doesn't exist."
        })

def search(request):
    relevantResults = []
    query = request.GET.get('q')
    currentEntries = util.list_entries()
    for data in currentEntries:
        if query.lower() == data.lower():
            return entry(request, query)
        elif query.lower() in data.lower():
            relevantResults.append(data)
    return render(request, "encyclopedia/search.html", {
        "entries": relevantResults
    })

def create(request):
    if request.method == "POST":
        form = NewPageForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data["title"]
            content = form.cleaned_data["content"]
            currentEntries = util.list_entries()
            for data in currentEntries:
                if title.lower() == data.lower():
                    return render(request, "encyclopedia/apology.html", {
                        "text": "A page with the same title already exists."
                    })
            util.save_entry(title, content)
            return entry(request, title)
        else:
            return render(request, "encyclopedia/create.html", {
                "form": form
            })
    return render(request, "encyclopedia/create.html", {
        "form": NewPageForm()
    })

def edit(request, title):
    existingEntry = util.get_entry(title)
    if request.method == "POST":
        form = ExistingPageForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data["content"]
            util.save_entry(title, content)
            return entry(request, title)
        else:
            return render(request, "encyclopedia/edit.html", {
                "form": form,
                "title": title
            })
    return render(request, "encyclopedia/edit.html", {
        "form": ExistingPageForm(initial={'content': existingEntry}),
        "title": title
    })

def get_random(request):
    currentEntries = util.list_entries()
    randomEntry = random.choice(currentEntries)
    return entry(request, randomEntry)
