import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// 🔥 Firebase Config (Replace with your own from Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyCiKkrvKDSdKM1DEXggVpyNVMurNtpl-Cc",
  authDomain: "k-messenger-baa7a.firebaseapp.com",
  databaseURL: "https://k-messenger-baa7a-default-rtdb.asia-southeast1.firebasedatabase.app", 
  projectId: "k-messenger-baa7a",
  storageBucket: "k-messenger-baa7a.firebasestorage.app",
  messagingSenderId: "983646824389",
  appId: "1:983646824389:web:eebc90e61b3f019c74cdac",
  measurementId: "G-R393X0Y0EM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 👤 Username
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Enter your name:");
  localStorage.setItem("username", username);
}

// 📩 Elements
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");

// 📤 Send Message
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  await db.collection("messages").add({
    text,
    username,
    timestamp: Date.now()
  });

  input.value = "";
});

// 📥 Receive Messages (REAL-TIME)
db.collection("messages")
  .orderBy("timestamp")
  .onSnapshot((snapshot) => {
    messages.innerHTML = "";

    snapshot.forEach((doc) => {
      const msg = doc.data();

      const div = document.createElement("div");
      div.classList.add("message");

      div.innerHTML = `
        <strong>${msg.username}:</strong> ${msg.text}
      `;

      messages.appendChild(div);
    });

    messages.scrollTop = messages.scrollHeight;
  });
