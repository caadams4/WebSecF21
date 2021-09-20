// Import the functions you need from the SDKs you need
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
let chatRef = rtdb.child(titleRef,"chat/");
let myID = "";

let validateInput = function() {
let err = false;
let errorMsg = "";
if (document.querySelector("#dbAlias").value === "") {
  errorMsg += "Please enter an alias! ";
  err = true;
} if (document.querySelector("#dbInput").value === "") {
  errorMsg += "Please enter a message! ";
  err = true;
} 
if (err === true) {
  alert(errorMsg);
  err = false;
  return false;
} else {
  return true;
}
}

let pushChat = function() {
  let message = document.querySelector("#dbInput").value;
  let myID = document.querySelector("#dbAlias").value;
  let timeStamp = Date().valueOf();
  let newMessage = {
    "message" : message,
    "senderID" : myID,
    "reactions" : "add it later",
    "timeStamp" : timeStamp,
    "edited" : false,
  }
  rtdb.push(chatRef,newMessage);
  document.querySelector("#dbInput").innerText= "";
}

let clickHandler = function (event) {
let clickedElement = evt.currentTarget;
let idFromDOM = $(clickedElement).attr("data-id");


}

let renderMessages = function (chatObj) { //takes in onValue pulled JSON 
$("#chatBox").empty();
let chatIds = Object.keys(chatObj);     //assigns keys to chatIds
chatIds.map((msgIds)=>{ 
  let messageObj = chatObj[msgIds];     //creates map of chat ids
//    if (myID === messageObj.senderID) {
    $("#chatBox").append(
    `<div class="chat" data-id=${msgIds}>
      ${messageObj.senderID}: ${messageObj.message} <br> at ${messageObj.timeStamp}
    </div>`
    );
//    }
});
$(".chat").click(clickHandler)
}


rtdb.onValue(chatRef, ss=>{
renderMessages(ss.val());
})

document.querySelector("#dbInput").addEventListener('keyup',function(e) {
if (e.key === 'Enter') {
  if (validateInput() === true) {
    pushChat();
    document.querySelector("#dbInput").value = ""
  }
}
});

document.querySelector("#inputBtn").addEventListener('click',function(e) {
if (validateInput() === true) {
  pushChat();
  document.querySelector("#dbInput").value = ""
}
});

