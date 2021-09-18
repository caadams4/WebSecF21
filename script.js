import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from"https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfQp2K5wuZ1-WDUA9NzVzC4Z8hnFcgem8",
  authDomain: "fob-alpha.firebaseapp.com",
  databaseURL: "https://fob-alpha-default-rtdb.firebaseio.com",
  projectId: "fob-alpha",
  storageBucket: "fob-alpha.appspot.com",
  messagingSenderId: "180202800618",
  appId: "1:180202800618:web:f5c8b13450717e6f891e93",
  measurementId: "G-KVM4FVRTY8"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let chatRef = rtdb.child(titleRef,"chat");
let userRef = rtdb.child(titleRef,"user");

document.querySelector("#dbInput").addEventListener('keyup',function(e) {
    if (e.key === 'Enter') {
      renderChat();
}});
document.querySelector("#inputBtn").addEventListener('click',function(e) {
        renderChat();
});
  

let renderChat = function() {
pushChat();
}

let pushChat = function() {
  let message = document.querySelector("#dbInput").value;
  let newMessage = {"message": message}
  rtdb.push(chatRef,newMessage);
  displayChat();
}

let displayChat = function() {
document.querySelector("#chatBox").innerText= "";
rtdb.onValue(chatRef, ss=>{
  let data = ss.val();
    //{"-Mjt7_Cqam6Qk5MNZc8t":{"message":"Message 1"}}
  
ss.forEach(function(item){
  console.log("made it")
  let chat = JSON.stringify(item.val().message);
  console.log(chat);
  $("#chatBox").append('<ul>' + chat +'</ul>');
  })
})
}
