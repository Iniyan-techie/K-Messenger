// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Username
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Enter your name:");
  localStorage.setItem("username", username);
}

// Elements
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");

// Send Message
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  db.ref("messages").push({
    text,
    username,
    timestamp: Date.now()
  });

  input.value = "";
});

// Receive Messages (REALTIME 🔥)
db.ref("messages").on("value", (snapshot) => {
  messages.innerHTML = "";

  snapshot.forEach((child) => {
    const msg = child.val();

    const div = document.createElement("div");
    div.classList.add("message");

    div.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
    messages.appendChild(div);
  });

  messages.scrollTop = messages.scrollHeight;
});
