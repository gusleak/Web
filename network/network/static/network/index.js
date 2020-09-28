document.addEventListener('DOMContentLoaded', function() {

    // Load the views from the first page
    let num_page = 1;

    // Toggle between views
    document.querySelector('#select-all-posts').addEventListener('click', () => view_posts(num_page));

    // Add listeners to the below only if user is signed in
    if (document.querySelector('#select-following') != undefined ) {
        document.querySelector('#select-following').addEventListener('click', () => view_following(num_page));
    }
    if (document.querySelector('#select-user-profile') != undefined) {
        let user = document.querySelector('#current-user').innerHTML;
        document.querySelector('#select-user-profile').addEventListener('click', () => view_profile(user, num_page));
    }

    // View posts by default
    view_posts(num_page);
})

function view_posts(num_page) {

    const postsPerPage = 10;

    // Hide other displays
    document.getElementsByClassName('post-likes').value = '';
    document.querySelector('#following').style.display = 'none';
    document.querySelector('#user-profile').style.display = 'none';
    document.querySelector('#all-posts').style.display = 'block';
    document.querySelector('#posts-box').innerHTML = '';
    document.querySelector('#pagi-list').innerHTML = '';

    // Clear out post field
    if (document.querySelector('#new-post-body') != undefined) {
        document.querySelector('#new-post-body').value = '';
        document.querySelector('#message-alert').style.display = '';

        // Create post on form submission
        document.querySelector('#compose-form').onsubmit = function() {
            const body = document.querySelector('#new-post-body').value;

            fetch('/posts', {
                method: 'POST',
                body: JSON.stringify({
                    body: body
                })
            })
            .then(response => response.json())
            .then(result => {
                // Print result
                console.log('Success:', result);
            })
            .catch(error => {
                console.log('Error:', error);
            });
            document.querySelector('#new-post-body').value = '';
            document.querySelector('#message-alert').style.display = 'block';
            return false;
        }
    }

    fetch(`/posts/all_posts/${num_page}`)
    .then(response => response.json())
    .then(posts => {

        // If no posts
        if (posts.length === 0) {
            document.querySelector('#posts-box').style.display = 'none';
            const element = document.createElement('p');
            element.innerHTML = "No posts"
            element.className = "no-posts"
            document.querySelector('#all-posts').append(element);
            return true;
        }
        
        // If less than 10 posts per page
        if (posts.length < postsPerPage) {
            for (i = 0; i < posts.length; i++) {
                const element = document.createElement('div');
                element.id = `post-${posts[i].id}`
                const usernameSpan = document.createElement('span')
                usernameSpan.innerHTML = posts[i].user;
                usernameSpan.className = "post-user p-2"

                // Access profile when clicking on username
                let profile_name = posts[i].user;
                usernameSpan.addEventListener('click', () => view_profile(profile_name, 1));

                // Edit functionality
                if (document.querySelector('#select-user-profile') != undefined) {
                    let user = document.querySelector('#current-user').innerHTML;
                    if (user === posts[i].user) {
                        edit = edit_link(element.id, posts[i], num_page);
                    } else {
                        edit = undefined;
                    }
                } else {
                    edit = undefined;
                }

                element.innerHTML = `<div class="post-body">${posts[i].body}</div><div class="post-timestamp">${posts[i].timestamp}</div><div class="post-likes"><img id="likes-${posts[i].id}" src="/static/network/thumbsup.png" width="20" height="20"><span id="likes-${posts[i].id}-count" class="post-like-count">${posts[i].likes}</span></div>`
                element.className = "border rounded p-2 mb-5"
                if (edit != undefined) {
                    element.append(edit);
                }
                document.querySelector('#posts-box').append(usernameSpan, element)
                let tagID = `likes-${posts[i].id}`
                add_likes(tagID, posts[i]);
            }
            
            // Add previous button if not on the first page
            if (num_page > 1) {
                document.querySelector('#pagi-nav').style.display = 'block'
                const previous = document.createElement('li');
                previous.id = "previous"
                previous.className = "page-item"
                previous.innerHTML = '<a id="previous-text" class="page-link" href="#">Previous</a>'
                previous.addEventListener('click', function () {
                    num_page--;
                    view_posts(num_page);
                })
                document.querySelector('#pagi-list').append(previous);
            }
        } else {
            // Else if 10 posts on the page
            for (i = 0; i < postsPerPage; i++) {
                const element = document.createElement('div');
                element.id = `post-${posts[i].id}`
                const usernameSpan = document.createElement('span')
                usernameSpan.innerHTML = posts[i].user;
                usernameSpan.className = "post-user p-2"

                // Access profile when clicking on username
                let profile_name = posts[i].user;
                usernameSpan.addEventListener('click', () => view_profile(profile_name, 1));

                // Edit functionality
                if (document.querySelector('#select-user-profile') != undefined) {
                    let user = document.querySelector('#current-user').innerHTML;
                    if (user === posts[i].user) {
                        edit = edit_link(element.id, posts[i], num_page);
                    } else {
                        edit = undefined;
                    }
                } else {
                    edit = undefined;
                }

                element.innerHTML = `<div class="post-body">${posts[i].body}</div><div class="post-timestamp">${posts[i].timestamp}</div><div class="post-likes"><img id="likes-${posts[i].id}" src="/static/network/thumbsup.png" width="20" height="20"><span id="likes-${posts[i].id}-count" class="post-like-count">${posts[i].likes}</span></div>`
                element.className = "border rounded p-2 mb-5"
               
                if (edit != undefined) {
                    element.append(edit);
                }
                document.querySelector('#posts-box').append(usernameSpan, element)
                let tagID = `likes-${posts[i].id}`
                add_likes(tagID, posts[i]);
            }
            
            // Add previous button if not on the first page
            document.querySelector('#pagi-nav').style.display = 'block'
            if (num_page > 1) {
                const previous = document.createElement('li');
                previous.id = "previous"
                previous.className = "page-item"
                previous.innerHTML = '<a id="previous-text" class="page-link" href="#">Previous</a>'
                previous.addEventListener('click', function () {
                    num_page--;
                    view_posts(num_page);
                })
                document.querySelector('#pagi-list').append(previous);
            }

            // Add next button
            const next = document.createElement('li');
            next.id = "next"
            next.className = "page-item"
            next.innerHTML = '<a id="next-text" class="page-link" href="#">Next</a>'

            next.addEventListener('click', function () {
                num_page++;
                view_posts(num_page);
            })
            document.querySelector('#pagi-list').append(next);
        }
    })
    // Case that there are no posts in the new page and previous page has max number of posts
    .catch(error => {
        console.log('Error:', error);
        const element = document.createElement('p');
        element.innerHTML = "No other posts"
        element.className = "no-posts"
        document.querySelector('#posts-box').append(element);

        if (num_page > 1) {
            document.querySelector('#pagi-nav').style.display = 'block'
            const previous = document.createElement('li');
            previous.id = "previous"
            previous.className = "page-item"
            previous.innerHTML = '<a id="previous-text" class="page-link" href="#">Previous</a>'
            previous.addEventListener('click', function () {
                num_page--;
                view_posts(num_page);
            })
            document.querySelector('#pagi-list').append(previous);
        }
    });
}


function view_profile(profileName, num_page) {

    // Clear previous section
    if (document.querySelector('#user-profile') != undefined) { 
        document.querySelector('#user-profile').innerHTML = '';
     }
    
    document.getElementsByClassName('post-likes').value = '';
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#following').style.display = 'none';
    document.querySelector('#user-profile').style.display = 'block';

    fetch(`/follows/${profileName}`)
    .then(response => response.json())
    .then(follows => {

        // Count following, followed, and currentUser's follow status if signed in
        let followersCount = 0;
        let followingCount = 0;
        let following = false;
        for (i = 0; i < follows.length; i++) {
            console.log(follows[i])
            if (follows[i].following != undefined) { followingCount++; }
            if (follows[i].followers != undefined) { followersCount++; }
            if (document.querySelector('#select-user-profile') != undefined) {
                let loggedUser = document.querySelector('#current-user').innerHTML;
                if (follows[i].followers === loggedUser) { 
                    following = true;
                    break; 
                }
            }
        }

        // Upper section of user profile
        const name = document.createElement('h1');
        name.innerHTML = profileName;
        name.className = "mb-5"
        document.querySelector('#user-profile').append(name);

        const followCounts = document.createElement('div');
        followCounts.innerHTML = `<span><b>Followers:</b> ${followersCount}</span><span class="ml-5"><b>Following:</b> ${followingCount}</span>`
        document.querySelector('#user-profile').append(followCounts);

        // If user is signed in, add buttons for Follow or Unfollow depending on follow status
        if (document.querySelector('#select-user-profile') != undefined) {
            let loggedUser = document.querySelector('#current-user').innerHTML;
            if (loggedUser != profileName) {
                
                const followButton = document.createElement('span');
                const unfollowButton = document.createElement('span');
                followButton.innerHTML = '<button type="button" id="follow-button" method="post" class="mt-2 btn btn-outline-primary btn-sm" data-toggle="button" onclick="this.disabled=true">Follow</button>'
                unfollowButton.innerHTML = '<button type="button" id="unfollow-button" method="put" class="mt-2 btn btn-outline-secondary btn-sm" data-toggle="button">Unfollow</button>'

                
                if (following === false) {

                    // Add follow functionality
                    followButton.addEventListener('click', function() {
                        fetch(`/follows/${profileName}`, {
                            method: 'POST',
                            body: JSON.stringify({
                                following: profileName
                            })
                        })
                        view_posts(num_page);
                    })
                    document.querySelector('#user-profile').append(followButton);
                } else {

                    // Add unfollow functionality
                    unfollowButton.addEventListener('click', function () {
                        fetch(`/follows/${profileName}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                following: profileName
                            })
                        })
                        view_posts(num_page);
                    })
                    document.querySelector('#user-profile').append(unfollowButton);
                }           
            }
        }
        const line = document.createElement('hr');
        document.querySelector('#user-profile').append(line);

        // User posts
        const postsPerPage = 10;

        fetch(`posts/profile/${profileName}/${num_page}`)
            .then(response => response.json())
            .then(posts => {

                // If less than 10 posts per page
                if (posts.length < postsPerPage) {
                    for (i = 0; i < posts.length; i++) {
                        const element = document.createElement('div');
                        element.id = `profile-post-${posts[i].id}`
                        element.innerHTML = `<div class="post-body">${posts[i].body}</div><div class="post-timestamp">${posts[i].timestamp}</div><div class="post-likes"><img id="profile-likes-${posts[i].id}" src="/static/network/thumbsup.png" width="20" height="20"><span id="profile-likes-${posts[i].id}-count" class="post-like-count">${posts[i].likes}</span></div>`
                        element.className = "border rounded p-2 mb-5"

                        // Edit functionality
                        if (document.querySelector('#select-user-profile') != undefined) {
                            let user = document.querySelector('#current-user').innerHTML;
                            if (user === posts[i].user) {
                                edit = edit_link(element.id, posts[i], num_page);
                            } else {
                                edit = undefined;
                            }
                        } else {
                            edit = undefined;
                        }
                        if (edit != undefined) {
                            element.append(edit);
                        }
                        document.querySelector('#user-profile').append(element);
                        let tagID = `profile-likes-${posts[i].id}`
                        add_likes(tagID, posts[i]);
                    }

                    // Add previous button if not on the first page
                    if (num_page > 1) {

                        const previous = document.createElement('li');
                        previous.id = "previous"
                        previous.className = "page-item"
                        previous.innerHTML = '<a id="previous-text" class="page-link" href="#">Previous</a>'
                        previous.addEventListener('click', function () {
                            num_page--;
                            view_profile(profileName, num_page);
                        })   

                        // Create nav element for Next, Previous buttons
                        const profilePagiNav = document.createElement('nav');
                        const profilePagiList = document.createElement('ul');
                        profilePagiList.className = 'pagination justify-content-center mt-2'
                        profilePagiList.id = 'profile-pagi-list'
                        profilePagiList.append(previous);
                        profilePagiNav.append(profilePagiList);
                        document.querySelector('#user-profile').append(profilePagiList);
                    }
                } else {
                    // Else if 10 posts on the page
                    for (i = 0; i < postsPerPage; i++) {
                        const element = document.createElement('div');
                        element.id = `profile-post-${posts[i].id}`
                        element.innerHTML = `<div class="post-body">${posts[i].body}</div><div class="post-timestamp">${posts[i].timestamp}</div><div class="post-likes"><img id="profile-likes-${posts[i].id}" src="/static/network/thumbsup.png" width="20" height="20"><span id="profile-likes-${posts[i].id}-count" class="post-like-count">${posts[i].likes}</span></div>`
                        element.className = "border rounded p-2 mb-5"
                        // Edit functionality
                        if (document.querySelector('#select-user-profile') != undefined) {
                            let user = document.querySelector('#current-user').innerHTML;
                            if (user === posts[i].user) {
                                edit = edit_link(element.id, posts[i], num_page);
                            } else {
                                edit = undefined;
                            }
                        } else {
                            edit = undefined;
                        }
                        if (edit != undefined) {
                            element.append(edit);
                        }
                        document.querySelector('#user-profile').append(element);
                        let tagID = `profile-likes-${posts[i].id}`
                        add_likes(tagID, posts[i]);
                    }

                    // Create nav element for Next, Previous buttons
                    const profilePagiNav = document.createElement('nav');
                    const profilePagiList = document.createElement('ul');
                    profilePagiList.className = 'pagination justify-content-center mt-2'
                    profilePagiList.id = 'profile-pagi-list'

                    // Add previous button if not on the first page

                    if (num_page > 1) {
                        const previous = document.createElement('li');
                        previous.id = "previous"
                        previous.className = "page-item"
                        previous.innerHTML = '<a id="previous-text" class="page-link" href="#">Previous</a>'
                        previous.addEventListener('click', function () {
                            num_page--;
                            view_profile(profileName, num_page);
                        })
                        profilePagiList.append(previous);
                    }

                    // Add next button
                    const next = document.createElement('li');
                    next.id = "next"
                    next.className = "page-item"
                    next.innerHTML = '<a id="next-text" class="page-link" href="#">Next</a>'

                    next.addEventListener('click', function () {
                        num_page++;
                        view_profile(profileName, num_page);
                    })
                    profilePagiList.append(next);
                    profilePagiNav.append(profilePagiList);
                    document.querySelector('#user-profile').append(profilePagiList);
                }
            })
            // Case that there are no posts in the new page and previous page has max number of posts
            .catch(error => {
                console.log('Error:', error);
                const element = document.createElement('p');
                element.innerHTML = "No other posts"
                element.className = "no-posts"
                document.querySelector('#user-profile').append(element);

                // Create nav element for Next, Previous buttons
                const profilePagiNav = document.createElement('nav');
                const profilePagiList = document.createElement('ul');
                profilePagiList.className = 'pagination justify-content-center mt-2'
                profilePagiList.id = 'profile-pagi-list'

                // Add previous button if not on the first page
                if (num_page > 1) {
                    const previous = document.createElement('li');
                    previous.id = "previous"
                    previous.className = "page-item"
                    previous.innerHTML = '<a id="previous-text" class="page-link" href="#">Previous</a>'
                    previous.addEventListener('click', function () {
                        num_page--;
                        view_profile(profileName, num_page);
                    })
                    profilePagiList.append(previous);
                    profilePagiNav.append(profilePagiList);
                    document.querySelector('#user-profile').append(profilePagiList);
                }
            });
    });
}


function view_following(num_page) {

    document.getElementsByClassName('post-likes').value = '';
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#user-profile').style.display = 'none';
    document.querySelector('#following').style.display = 'block';

    document.querySelector('#following-posts-box').innerHTML = '';
    document.querySelector('#following-pagi-list').innerHTML = '';

    const postsPerPage = 10;

    fetch(`/posts/following/${num_page}`)
        .then(response => response.json())
        .then(posts => {
            
            // If no following posts
            if (posts.length === 0) { 
                document.querySelector('#following-posts-box').style.display = 'none';
                const element = document.createElement('p');
                element.innerHTML = "No following posts"
                element.className = "no-posts"
                document.querySelector('#following').append(element);
                return true;
            }

            // If less than 10 posts per page
            if (posts.length < postsPerPage) {
                for (i = 0; i < posts.length; i++) {
                    const element = document.createElement('div');
                    const usernameSpan = document.createElement('span')
                    usernameSpan.innerHTML = posts[i].user;
                    usernameSpan.className = "post-user p-2"

                    // Access profile when clicking on username
                    let profile_name = posts[i].user;
                    usernameSpan.addEventListener('click', () => view_profile(profile_name, 1));

                    element.innerHTML = `<div class="post-body">${posts[i].body}</div><div class="post-timestamp">${posts[i].timestamp}</div><div class="post-likes"><img id="following-likes-${posts[i].id}" src="/static/network/thumbsup.png" width="20" height="20"><span id="following-likes-${posts[i].id}-count" class="post-like-count">${posts[i].likes}</span></div>`
                    element.className = "border rounded p-2 mb-5"
                    document.querySelector('#following-posts-box').append(usernameSpan, element);
                    let tagID = `following-likes-${posts[i].id}`
                    add_likes(tagID, posts[i]);
                }

                // Add previous button if not on the first page
                if (num_page > 1) {
                    document.querySelector('#following-pagi-nav').style.display = 'block'
                    const previous = document.createElement('li');
                    previous.id = "previous"
                    previous.className = "page-item"
                    previous.innerHTML = '<a id="previous-text" class="page-link" href="#">Previous</a>'
                    previous.addEventListener('click', function () {
                        num_page--;
                        view_following(num_page);
                    })
                    document.querySelector('#following-pagi-list').append(previous);
                }
            } else {
                // Else if 10 posts on the page
                for (i = 0; i < postsPerPage; i++) {
                    const element = document.createElement('div');
                    const usernameSpan = document.createElement('span')
                    usernameSpan.innerHTML = posts[i].user;
                    usernameSpan.className = "post-user p-2"

                    // Access profile when clicking on username
                    let profile_name = posts[i].user;
                    usernameSpan.addEventListener('click', () => view_profile(profile_name, 1));

                    element.innerHTML = `<div class="post-body">${posts[i].body}</div><div class="post-timestamp">${posts[i].timestamp}</div><div class="post-likes"><img id="following-likes-${posts[i].id}" src="/static/network/thumbsup.png" width="20" height="20"><span id="following-likes-${posts[i].id}-count" class="post-like-count">${posts[i].likes}</span></div>`
                    element.className = "border rounded p-2 mb-5"
                    document.querySelector('#following-posts-box').append(usernameSpan, element);
                    let tagID = `following-likes-${posts[i].id}`
                    add_likes(tagID, posts[i]);
                }

                // Add previous button if not on the first page
                document.querySelector('#following-pagi-nav').style.display = 'block'
                if (num_page > 1) {
                    const previous = document.createElement('li');
                    previous.id = "previous"
                    previous.className = "page-item"
                    previous.innerHTML = '<a id="previous-text" class="page-link" href="#">Previous</a>'
                    previous.addEventListener('click', function () {
                        num_page--;
                        view_following(num_page);
                    })
                    document.querySelector('#following-pagi-list').append(previous);
                }

                // Add next button
                const next = document.createElement('li');
                next.id = "next"
                next.className = "page-item"
                next.innerHTML = '<a id="next-text" class="page-link" href="#">Next</a>'

                next.addEventListener('click', function () {
                    num_page++;
                    view_following(num_page);
                })
                document.querySelector('#following-pagi-list').append(next);
            }
        })
        // Case that there are no posts in the new page and previous page has max number of posts
        .catch(error => {
            console.log('Error:', error);
            const element = document.createElement('p');
            element.innerHTML = "No other posts"
            element.className = "no-posts"
            document.querySelector('#following-posts-box').append(element);

            if (num_page > 1) {
                document.querySelector('#following-pagi-nav').style.display = 'block'
                const previous = document.createElement('li');
                previous.id = "previous"
                previous.className = "page-item"
                previous.innerHTML = '<a id="previous-text" class="page-link" href="#">Previous</a>'
                previous.addEventListener('click', function () {
                    num_page--;
                    view_following(num_page);
                })
                document.querySelector('#following-pagi-list').append(previous);
            }
        });
}

function edit_link(element, post, num_page) {
    const edit = document.createElement('span');
    edit.innerHTML = '<a href="#/">Edit</a>'
    edit.className = "edit-link"
    edit.addEventListener('click', function() {
        // Create textarea and have existing post as default value
        const existingPost = document.createElement('textarea');
        existingPost.value = post.body;
        existingPost.className = "form-control"
        document.querySelector(`#${element}`).innerHTML = ''
        
        // Add buttons for save and cancel changes
        const save = document.createElement('button');
        save.innerHTML = 'Save'
        save.className = "btn btn-primary btn-sm mt-1"
        const cancel = document.createElement('button');
        cancel.innerHTML = 'Cancel'
        cancel.className = "btn btn-secondary btn-sm mt-1 ml-1"
        document.querySelector(`#${element}`).append(existingPost, save, cancel);

        // On cancel, leave post intact
        cancel.addEventListener('click', function() {
            document.querySelector(`#${element}`).innerHTML = `<div class="post-body">${post.body}</div><div class="post-timestamp">${post.timestamp}</div><div class="post-likes"><img id="likes-${post.id}" src="/static/network/thumbsup.png" width="20" height="20"><span id="likes-${post.id}-count" class="post-like-count">${post.likes}</span></div>`
            let edit = edit_link(element, post, num_page);
            document.querySelector(`#${element}`).append(edit);
            let tagID = `likes-${post.id}`
            add_likes(tagID, post);
        })

        // On save, load edited post
        save.addEventListener('click', function() {
            fetch(`/posts/edit_post/${post.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    body: existingPost.value
                })
            })
            .then(response => response.json())
            .then(post => {
                document.querySelector(`#${element}`).innerHTML = `<div class="post-body">${post.body}</div><div class="post-timestamp">${post.timestamp}</div><div class="post-likes"><img id="likes-${post.id}" src="/static/network/thumbsup.png" width="20" height="20"><span id="likes-${post.id}-count" class="post-like-count">${post.likes}</span></div>`
                let edit = edit_link(element, post, num_page);
                document.querySelector(`#${element}`).append(edit);
                let tagID = `likes-${post.id}`
                add_likes(tagID, post);
            })
        })
    })
    return edit;
}

function add_likes(tagID, post) {

    if (document.querySelector('#select-user-profile') != undefined) {
        document.querySelector(`#${tagID}`).addEventListener('click', function() {
            fetch(`/posts/like_post/${post.id}`)
            .then(response => response.json())
            .then(post => {
                console.log('Hey');
                document.querySelector(`#${tagID}-count`).innerHTML = post.likes;
            })
        })
    } else {
        document.querySelector(`#${tagID}`).addEventListener('click', function () {
            alert('You must be logged in to like posts.');
        })
    }
}