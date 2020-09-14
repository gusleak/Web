document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#message-alert').style.display = 'none';
  document.querySelector('#message-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send email on form submission
  document.querySelector('#compose-form').onsubmit = function() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
  
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
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
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    document.querySelector('#message-alert').style.display = "block";
    document.querySelector('#message-alert').innerHTML = "Email sent."
    return false;
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#message-alert').style.display = 'none';
  document.querySelector('#message-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    for (i = 0; i < emails.length; i++) {
      const element = document.createElement('div');
      if (mailbox === 'sent') {
        element.innerHTML = `<b class="emails-view-sender">${emails[i].recipients}</b><div class="emails-view-subject">${emails[i].subject}</div><div class="emails-view-timestamp">${emails[i].timestamp}</div>`
      } else {
        element.innerHTML = `<b class="emails-view-sender">${emails[i].sender}</b><div class="emails-view-subject">${emails[i].subject}</div><div class="emails-view-timestamp">${emails[i].timestamp}</div>`
      }
      element.className = "border rounded emails-list";
      element.id = emails[i].id;
      // Mark as read
      element.addEventListener('click', function() {
        fetch(`/emails/${element.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
        element.style.backgroundColor = "lightgray";

        // Show message and hide other views
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#message-alert').style.display = 'none';
        document.querySelector('#message-view').style.display = 'block';

        // Get email message
        fetch(`/emails/${element.id}`)
        .then(response => response.json())
        .then(email => {
          // Print email
          console.log(email)

          // Clear previous
          document.querySelector('#message-view').innerHTML = '';

          // Add current email message details
          const senderDiv = document.createElement('div');
          senderDiv.innerHTML = `<b>From: </b><span>${email.sender}</span>`;
          document.querySelector('#message-view').append(senderDiv);
          const recipientsDiv = document.createElement('div');
          recipientsDiv.innerHTML = `<b>To: </b><span>${email.recipients}</span>`
          document.querySelector('#message-view').append(recipientsDiv);
          const subjectDiv = document.createElement('div');
          subjectDiv.innerHTML = `<b>Subject: </b><span>${email.subject}</span>`
          document.querySelector('#message-view').append(subjectDiv);
          const timestampDiv = document.createElement('div');
          timestampDiv.innerHTML = `<b>Date: </b><span>${email.timestamp}</span>`
          document.querySelector('#message-view').append(timestampDiv);

          const archiveButton = document.createElement('button');
          archiveButton.className = "btn btn-sm btn-secondary";
          archiveButton.id = 'archive';
          if (mailbox === 'archive') {
            archiveButton.innerHTML = "Unarchive";
          } else {
            archiveButton.innerHTML = "Archive";
          }
          
          // Archive and unarchive according to current mailbox
          archiveButton.addEventListener('click', function() {
            if (mailbox === 'archive') {
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: false
                })
              })
              archiveButton.innerHTML = "Archive";
            } else {
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: true
                })
              })
              archiveButton.innerHTML = "Unarchive";
            }
          });
          if (mailbox != 'sent') {
            document.querySelector('#message-view').append(archiveButton);
          }

          // Reply functionality
          const replyButton = document.createElement('button');
          replyButton.className = "btn btn-sm btn-primary";
          replyButton.id = 'reply';
          replyButton.innerHTML = 'Reply';
          replyButton.addEventListener('click', function() {
            compose_email();
            document.querySelector('#compose-recipients').value = email.sender;
            document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
            document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote:` + `\n\'${email.body}\'\n\n`;
           
          })

          document.querySelector('#message-view').append(replyButton);

          const hr = document.createElement('hr');
          document.querySelector('#message-view').append(hr);
          const bodyDiv = document.createElement('div');

          // Preserve whitespace and line breaks
          bodyDiv.innerHTML = email.body.replace(/\r?\n/g, '<br />');
          document.querySelector('#message-view').append(bodyDiv);
        })
        .catch(error => {
          console.log('Error:', error);
        });

      });

      // Distinguish the read emails with different color
      if (emails[i].read === true) {
        element.style.backgroundColor = "lightgray";
      }
      document.querySelector('#emails-view').append(element);
    }
    
  })
  .catch(error => {
    console.log('Error:', error);
  });


}