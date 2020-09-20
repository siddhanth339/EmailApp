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

  document.querySelector("#status").innerHTML = '';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        if (result.message === undefined) {
          document.querySelector("#status").innerHTML = result.error;
          document.querySelector("#status").style.color = "red";
        } 
        else {
          document.querySelector("#status").innerHTML = result.message;
          document.querySelector("#status").style.color = "green";
          load_mailbox("sent");
        }
    })
    return false;  
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      for (let email in emails)
      {
        const divtag = document.createElement("div");
        divtag.className = "listOfemails";
        const span1 = document.createElement("span");
        span1.style.marginLeft = "10px";
        span1.style.fontWeight = "bold";
        span1.style.color = "black";

        const span2 = document.createElement("span");
        span2.style.marginLeft = "10px";
        span2.style.color = "black";

        const span3 = document.createElement("span");
        span3.style.float = "right";
        span3.style.marginRight = "10px";
        span3.style.color = "#aca4a4";

        if (mailbox === "sent")
        {
          span1.innerHTML = emails[email].recipients;
        }
        else
        {
          span1.innerHTML = emails[email].sender;
        }
        span2.innerHTML = emails[email].subject;
        span3.innerHTML = emails[email].timestamp;

        divtag.appendChild(span1);
        divtag.appendChild(span2);
        divtag.appendChild(span3);

        if (emails[email].read)
        {
          divtag.style.backgroundColor = "#9b989870";
        }
        document.querySelector("#emails-view").appendChild(divtag);

        divtag.addEventListener("click", () => {
          show_mail(emails[email].id, mailbox);
        });
      }

  });
}

function show_mail(id, mailbox) 
{
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
    document.querySelector("#emails-view").innerHTML = 
    `<div class="particular-email">
      <b>Sender:</b> ${email.sender}<br>
      <b>Recipients:</b> ${email.recipients}<br>
      <b>Subject:</b> ${email.subject}<br>
      <b>Time:</b> ${email.timestamp}<br>
      <hr>
      ${email.body}
      <hr>
    </div>`
    if (mailbox !== 'sent')
    {
      set_read(email.id);
      let butn = document.createElement("button");
      butn.className = "btn btn-primary";
      butn.id = "archiveButton";
      if (email.archived)
      {
        butn.innerHTML = "Unarchive";
      }
      else
      {
        butn.innerHTML = "Archive";
      }
      document.querySelector("#emails-view").appendChild(butn);
      butn.addEventListener("click", () => {
        toggle_archive(email.id, email.archived);
      });
    }
  });
  
}

function set_read(id)
{
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
}
function toggle_archive(id, curr_archived)
{
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !curr_archived
    })
  })
  .then(function() {
    load_mailbox('inbox');
  });
}