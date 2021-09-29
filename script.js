// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from"https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

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
let userRef = rtdb.child(titleRef,"users/");

let myID = "";

//TODO Come up with a UI Design
  //Left Sliding pane -> Admin console and server display
  //Middle pane -> Message window that defaults display to bottom of the messages (scrolling)

//TODO Enable hosting single page app

//TODO Add hot reloading

//TODO Set up Admin toggle
  //admin rules to toggle

//


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
    "RBAC" : "role coming soon"
  }
  rtdb.push(chatRef,newMessage);
  document.querySelector("#dbInput").innerText= "";
}

//  let clickHandler = function (event) {
//  let clickedElement = evt.currentTarget;
//  let idFromDOM = $(clickedElement).attr("data-id"); 
//}

let renderMessages = function (chatObj) { //takes in onValue pulled JSON 
$("#chatBox").empty();
let chatIds = Object.keys(chatObj);   
chatIds.map((messageId)=>{ 
  let messageObj = chatObj[messageId];
  if (messageObj.senderID === user.senderID) {
          $("#chatBox").append(
    `<div class="myChat" data-id=${messageId}>
      ${messageObj.message}
    </div>
    <div class="msgFromMe">
      From: ${messageObj.senderID} on ${messageObj.timeStamp}
    </div>`
    );
  } else {
    $("#chatBox").append(
    `<div>
      <div class="chat" data-id=${messageId}>
              ${messageObj.message}
      </div>
      <div class="msgFromNotMe">
         From: ${messageObj.senderID} on ${messageObj.timeStamp}
      </div>
     </div>`
    );
  }
});
$(".chat").click(clickHandlerMessage)
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
  let userNameRef = rtdb.ref(db, `/users/${uid}/name`);
  rtdb.set(userRoleRef, true);
  rtdb.set(userNameRef, somedata.user.email);
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
user.senderID = email;
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
console.log(JSON.stringify(userObj));
}


//functions for admin console on page



let renderUsers = function (rbacObject) { //takes in onValue pulled JSON 
$("#rbacConsole").empty();
let userIds = Object.keys(rbacObject);
userIds.map((users)=>{ 
    let userObj = rbacObject[users];
    let admin = ""
    if (userObj.roles.admin) {
    admin = ", admin";
    }
    $("#rbacConsole").append(
    `<div class="users" user-id=${users}>
    ${userObj.name} : Group(s) : user${admin}
    </div>`
    )
});
  $(".users").click(clickHandlerGroups)
}

//let userIds = Object.keys(rbacObject);
//  userIds.map((users)=>{ 
//      let userObj = rbacObject[users];
//      let admin = ""
//      if (userObj.roles.admin) {
//      admin = ", admin";
//      }

let addRemove = function(adminChange) {
      let roleRef = rtdb.child(userRef, `${adminChange}/roles`);
      rtdb.get(roleRef).then(ss=>{
        if (ss.val().admin === false) {        
         // rtdb.update(roleRef, {"admin": true});
          return;
        } else {
        //  rtdb.update(roleRef, {"admin": false});
          return;
        }
      })
    }    
      

rtdb.onValue(userRef, ss=>{
renderUsers(ss.val());
});

let clickHandlerGroups = function(evt){
let clickedElement = evt.currentTarget;
let userIdFromDOM = $(clickedElement).attr("user-id");
$(clickedElement).append(`
    <button admin-change=${userIdFromDOM} data-done=${userIdFromDOM}>Add/Remove Admin</button>
`);
$(`[data-done=${userIdFromDOM}]`).on("click", (evt)=>{
  addRemove(userIdFromDOM);
  $(`[data-done=${userIdFromDOM}]`).remove();
});
}

let sendEdit = function(msgid, msgup, userid){
console.log(msgid, msgup, userid);
//let chatsRef = "fake";

let msgRef = rtdb.child(chatRef, msgid);
rtdb.update(msgRef, {"edited": true, "message": msgup});
}

let clickHandlerMessage = function(evt){
let clickedElement = evt.currentTarget;
let idFromDOM = $(clickedElement).attr("data-id");
$(clickedElement).after(`
  <input type="text" 
    data-edit=${idFromDOM} 
    class="msgedit" 
    placeholder="Edit Your message"/>
  <button data-done=${idFromDOM}>Send Edit</button>`);
$(`[data-done=${idFromDOM}]`).on("click", (evt)=>{
  let editedMsg = $(`[data-edit=${idFromDOM}]`).val();
  sendEdit(idFromDOM, editedMsg, user.senderID);
  $(`[data-edit=${idFromDOM}]`).remove();
  $(`[data-done=${idFromDOM}]`).remove();
});
}



