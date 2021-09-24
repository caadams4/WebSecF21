// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from"https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfQp2K5wuZ1-WDUA9NzVzC4Z8hnFcgem8",
  authDomain: "fob-alpha.firebaseapp.com",
  databaseURL: "https://fob-alpha-default-rtdb.firebaseio.com",
  projectId: "fob-alpha",
  storageBucket: "fob-alpha.appspot.com",
  messagingSenderId: "180202800618",
  appId: "1:180202800618:web:a0cb94b6daf74032891e93",
  measurementId: "G-QQ3WEGCDRN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let auth = fbauth.getAuth(app);
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let chatRef = rtdb.child(titleRef,"chat/");
let myID = "";

const user = {
  senderID: "",
  message: ""
};

let validateInput = function() {
let err = false;
let errorMsg = "";
 if (document.querySelector("#dbInput").value === "") {
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
  user.message = document.querySelector("#dbInput").value;
  let timeStamp = Date().valueOf();
  let newMessage = {
    "message" : user.message,
    "senderID" : user.senderID,
    "reactions" : "add it later",
    "timeStamp" : timeStamp,
    "edited" : false,
  }
  rtdb.push(chatRef,newMessage);
  document.querySelector("#dbInput").innerText= "";
}

//let clickHandler = function (event) {
// let clickedElement = evt.currentTarget;
//  let idFromDOM = $(clickedElement).attr("data-id"); 
//}

let renderMessages = function (chatObj) { //takes in onValue pulled JSON 
$("#chatBox").empty();
let chatIds = Object.keys(chatObj);     //assigns keys to chatIds
chatIds.map((msgIds)=>{ 
  let messageObj = chatObj[msgIds];     //creates map of chat ids
//    if (myID === messageObj.senderID) {
    $("#chatBox").append(
    `<div class="chat" data-id=${msgIds}>
      ${messageObj.senderID}:  ${messageObj.message} <br> at ${messageObj.timeStamp}
    </div>`
    );
//    }
});
//$(".chat").click(clickHandler)
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

$("#register").on("click", ()=>{
let email = $("#regemail").val();
let p1 = $("#regpass1").val();
let p2 = $("#regpass2").val();
if (p1 != p2){
  alert("Passwords don't match");
  return;
}
fbauth.createUserWithEmailAndPassword(auth, email, p1).then(somedata=>{
  let uid = somedata.user.uid;
  let userRoleRef = rtdb.ref(db, `/users/${uid}/roles/user`);
  rtdb.set(userRoleRef, true);
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  console.log(errorCode);
  console.log(errorMessage);
});
});

$("#login").on("click", ()=>{
let email = $("#logemail").val();
let pwd = $("#logpass").val();
fbauth.signInWithEmailAndPassword(auth, email, pwd).then(
  somedata=>{
    console.log(somedata);
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
  });
});

let rulesRef = rtdb.ref(db, "/rules");

rtdb.onValue(rulesRef, ss=>{
let rules = ss.val();
if (!!rules){
  $("#rules").html(rules);
}
})

fbauth.onAuthStateChanged(auth, user => {
  if (!!user){
    $("#messageStack").show();
    renderUser(user);
    let flagRef = rtdb.ref(db, "/flag");
    $(".login_module").hide();
  } else {
    $("#messageStack").hide();
    $(".login_module").show();
  }
});

let renderUser = function(userObj){
let usrName = userObj.email;
$("#app").html(JSON.stringify(userObj));
$("#whoIsUser").html(
  `<div id="whoIsUser"> 
    Logged in as: ${usrName}<button type="button" id="logout">Logout</button> 
  </div>`
);
$("#logout").on("click", ()=>{
  $("#whoIsUser").html(
  `<div id="whoIsUser"> 
    Not logged in. Please log in or register to enter a chat
  </div>`);
  fbauth.signOut(auth);
})
return newUser(userObj);
}

let newUser = function(userObj){
let msg = document.querySelector("#dbInput").value;
user.msg = msg;
user.senderID = userObj.email;
}

