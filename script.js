
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from"https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAorNUL61m4aX1f_zR_d8Xdsbj2TfVATZs",
    authDomain: "websec-auth-3225b.firebaseapp.com",
    databaseURL: "https://websec-auth-3225b-default-rtdb.firebaseio.com",
    projectId: "websec-auth-3225b",
    storageBucket: "websec-auth-3225b.appspot.com",
    messagingSenderId: "263553145282",
    appId: "1:263553145282:web:e5791cb7ab6896c1aede5b",
    measurementId: "G-LZ6HRBZQSR"
  };
let currentServer = "";
let currentChannel = "";
let uid = "";
let username = "";
let email = "";
let existingServers = [];
let existingChannels = [];
let existingUsers = [];

const app = initializeApp(firebaseConfig);
let auth = fbauth.getAuth(app);
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let chatRef = rtdb.child(titleRef,"chatServers/");
let userRef = rtdb.child(titleRef,"users/");



fbauth.onAuthStateChanged(auth, user => {
      if (!!user){ 
        uid = user.uid;
        console.log(uid)
        let pageUser = {
          email: user.email,
          uid: user.uid,
          userName: "",
          currentServer: "",
          currentChannel: "",
        }
        let myUserRef = rtdb.ref(db,`/users/${pageUser.uid}`)
        rtdb.get(myUserRef).then(ss=>{
          pageUser.server = ss.val().server;
          pageUser.channel = ss.val().channel;
          pageUser.userName = ss.val().name;
          username = pageUser.name;
          currentChannel = pageUser.channel;
          currentServer = pageUser.server;
          renderServers();
          renderMessages(uid);
          renderUsers();
          renderAdminTools();
        });
        $("#login_register_module").css({"display":"none"}); 
        $("#chat_module").css({"display":"contents"}); 
      } else {
        $("#chat_module").css({"display":"none"});
        $("#whoIsUser").html("Logged in as : ")
        $("#login_register_module").css({"display":"contents"});
      }  
});

//TODO Get array of user names
  rtdb.onValue(userRef, ss=>{
  let userList  = ss.val();
  $("#flatEarthers").empty();
  let userIds = Object.keys(userList);
  userIds.map((users)=>{
    let userObj = userList[users];
    existingUsers = existingUsers.concat(userObj.name);
    console.log(existingUsers)
  });
});


//TODO Get array of channels

//TODO Get array of servers



$("#loginBtn").on("click", ()=>{
  email = $("#logemail").val();
  let pwd = $("#logpass").val();  
//  let useractiveRef = rtdb.ref(db, `/users/${email}/lastActive`);
//  rtdb.set(useractiveRef, getTime());
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
$("#registerBtn").on("click", ()=>{
  email = $("#regemail").val();
  username = $("#regdisplay").val();
  let p1 = $("#regpass1").val();
  let p2 = $("#regpass2").val();
  if (p1 != p2){
    alert("Passwords don't match");
    return;
  }
  fbauth.createUserWithEmailAndPassword(auth, email, p1).then(somedata=>{
    uid = somedata.user.uid
    currentServer = "server1";
    currentChannel = "general";
    let newUser = {
      roles: {
        "user": true,
        "admin": false
        },
      name: username,
      email: email,
      lastActive: new Date().getTime(),
      server: currentServer,
      channel: currentChannel
      }
    let newUserRef = rtdb.ref(db,`/users/${uid}/`)
    rtdb.set(newUserRef,newUser);
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
  });
  currentServer = "server1";
  currentChannel = "general";
  renderServers(currentServer);
  renderChannels(currentChannel);
  renderUsersInServer(currentServer);
  renderMessages(uid);
  renderUsers();
  $("#login_register_module").css({"display":"none"});
  $("#chat_module").css({"display":"contents"});
});
$("#logout").on("click", ()=>{
  fbauth.signOut(auth);
  $("#loggedInAs").empty();
  $("#loggedInAs").append(`
      <div id="whoIsUser">
        Logged in as :  
      </div>`)
});

let renderUsers = function () { //takes in onValue pulled JSON 
  rtdb.onValue(userRef, ss=>{
  let userList  = ss.val();
  $("#flatEarthers").empty();
  let userIds = Object.keys(userList);
  userIds.map((users)=>{
    let userObj = userList[users];
    if (userObj.roles.admin === true) {
    $("#flatEarthers").append(
      `<div class="users" data-id=${users}>
        ${userObj.name} - Admin <div button-id=${users}}></div>
      </div>`
    )
  }});
  userIds.map((users)=>{ 
    let userObj = userList[users];
    if (userObj.roles.admin !== true) {
    $("#flatEarthers").append(
      `<div class="users" data-id=${users}>
        ${userObj.name}
      </div>`
    )
  }});
  $(".users").click(clickHandlerUser);
  });
}
let clickHandlerUser = function (evt) {
let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  let userInQuestion = idFromDOM;
  let myUserRef = rtdb.child(titleRef,`users/${uid}/roles/admin`);
  rtdb.get(myUserRef).then(ss=>{
    if (ss.val() === true) {
    let clickedUserRef = rtdb.child(titleRef,`users/${idFromDOM}`);
    rtdb.get(clickedUserRef).then(ss=>{
      if(ss.val().roles.admin === true) {
        $("#userControl").empty();
        $("#userControl").append(
        `<div class="users" >
          ${ss.val().name}<button data-id=${ss} type="button" id="killadmin">Remove Admin?</button>
        </div>`
      )
        $(".users").click(clickHandlerUser);
      } else {
        $("#userControl").empty();
        $("#userControl").append(
        `<div class="users" data-id=${ss}>
          ${ss.val().name} - Admin <button  data-id=${ss} type="button" id="makeadmin">Add Admin?</button>
        </div>`
      )
      $(".users").click(clickHandlerUser);
    }})
  }})
}

let renderAdminTools = function () {
  let myUserRef = rtdb.child(titleRef,`users/${uid}`);
  rtdb.get(myUserRef).then(ss=>{
    if (ss.val().roles.admin === true) {
    $("#adminToolServer").empty();
    $("#adminToolServer").append(
      `<div class="adminTool"}>
        <input type="text" id="newServer" placeholder="Server Name"/>
        <button type="button" id="newServBtn">Create Server</button>
      </div>`
    )
    $("#adminToolChannel").empty();
    $("#adminToolChannel").append(  
      `<div class="adminTool"}>
        <input type="text" id="newChannel" placeholder="Channel Name"/>
        <button type="button" id="newChanBtn">Create Channel</button>
      </div>
      `
    );  
    $("#adminToolUser").empty();
    $("#adminToolUser").append(  
      `<div class="adminTool">
        <select id="addUserDropdown">
          <option> ---Add User--- </option>  
        </select>
        <button type="button" id="addUserBtn">Add to Server</button>
      </div>
      `
    );  
      rtdb.onValue(userRef, ss=>{
      let userList  = ss.val();
      let userIds = Object.keys(userList);
        $("#addUserDropdown").empty();
        $("#addUserDropdown").append(`<option> ---Add User--- </option`);
      userIds.map((users)=>{
        let userObj = userList[users];
        $("#addUserDropdown").append(
        `<option id=${userObj.name} data-id=${users}>${userObj.name}</option>` 
        )
      })
    $("#newServBtn").click(clickHandlerNewServ);
    $("#newChanBtn").click(clickHandlerNewChan);
    $("#addUserBtn").click(clickHandlerAddUser);
    })
    }
  })

}


let newServ = function(serverName) {
    let myUserRef = rtdb.child(titleRef,`users/${uid}`);

  if (servExists !== false) {
    rtdb.get(myUserRef).then(ss=>{
    let newServer = {
      "servName" : serverName,
      "channels" : {
        "general" : {
          "chanName" : "general",
          "messageID" : {
            "edited" : false,
            "message" : "beep - boop : Welcome to the new server!",
            "senderID" : "R2-D2",
            "timeStamp" : new Date().getTime()
          }
        },
      },
      "members" : {
        uid : {  //uid
          "username" : ss.val().name,
          uid : uid
          }
        }
      }
    rtdb.push(chatRef,newServer);
    renderServers();
  });
  }
  }  
let clickHandlerNewServ = function () {
  let serverName = $("#newServer").val();
  newServ(serverName);
        
}
$("#newServBtn").on("click", ()=>{
  let useractiveRef = rtdb.ref(db, `/users/${email}/lastActive`);
  rtdb.set(useractiveRef, getTime());
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


$("#killadmin").on("click", ()=>{
  let idFromDOM = $("#killadmin").attr("data-id");
  let clickedUserRef = rtdb.child(titleRef,`users/${idFromDOM}/roles/admin`);
  rtdb.set(clickedUserRef, false);
  $("#userControl").empty();
  
}); // TODO NOT REGISTERING CLICK
$("#makeadmin").on("click", ()=>{
  let idFromDOM = $("#makeadmin").attr("data-id");
  let clickedUserRef = rtdb.child(titleRef,`users/${idFromDOM}/roles/admin`);
  rtdb.set(clickedUserRef, true);
  $("#userControl").empty();  
}); // TODO NOT REGISTERING CLICK

let clickHandlerServer = function(evt){
  let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  currentServer = idFromDOM;
  let serverRef = rtdb.child(titleRef,`chatServers/${currentServer}/members/`);
  let channelRef = rtdb.child(titleRef,`chatServers/${currentServer}/channels/`);
  let messageRef = rtdb.child(titleRef,`chatServers/${currentServer}/${currentChannel}/`);
  let userServerRef = rtdb.child(userRef,`${uid}/server`);
  let userChannelRef = rtdb.child(userRef,`${uid}/channel`);
  rtdb.set(userServerRef, idFromDOM);
  rtdb.set(userChannelRef, "general");
  currentChannel = "general";
  renderServers();
  renderMessages(uid);
} // switch cahnnels on click based on uid
let renderServers = function () {
    $("#servers").empty();
    let userServerRef = rtdb.child(userRef,`${uid}/server`);
    rtdb.get(userServerRef).then(serv=>{
    rtdb.get(chatRef).then(ss=>{
      let serverObj = ss.val() 
      let serverIds = Object.keys(serverObj);
      serverIds.map((servs)=>{
        let passingServ;
        if (JSON.stringify(serv) !== JSON.stringify(servs)) {
          $("#servers").append(
            `<div class="servers" data-id=${servs}>
              ${serverObj[servs].servName}
            </div>`)
        } else {
          $("#servers").append(
          `<div class="servers" data-id=${servs} style="color:rgb(0,255,0)">
            ${serverObj[servs].servName}
          </div>`)
        }
      })
      $(".servers").click(clickHandlerServer);
      renderChannels(serv.val());
      renderUsersInServer(serv.val())
    }) 
  })
}

let clickHandlerNewChan = function () {
  let channelName = $("#newChannel").val();
  let myUserRef = rtdb.child(titleRef,`users/${uid}`);
  rtdb.get(myUserRef).then(ss=>{

    let servUser = ss.val().server; //get the user's server id Key to ref inside of that server
    
    console.log(servUser)
    
          let newChannel = {
            "chanName" : channelName,
            "messageID" : {
            "edited" : false,
            "message" : "beep - boop : Welcome to the new channel!",
            "senderID" : "R2-D2",
            "timeStamp" : new Date().getTime()
            }
          }
          
    let channelRef = rtdb.child(titleRef,`chatServers/${servUser}/channels/`);
    rtdb.push(channelRef,newChannel);   
    
    });
      
}
let clickHandlerChannel = function(evt){
  let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  currentChannel = idFromDOM;
  let userChannelRef = rtdb.child(userRef,`/${uid}/channel`);
  rtdb.set(userChannelRef, idFromDOM);
  renderChannels(currentServer);
  renderMessages(uid);
} // switch cahnnels on click based on uid
let renderChannels = function (serv) {
  
      let userChannelRef = rtdb.child(userRef,`${uid}/channel`);
      rtdb.get(userChannelRef).then(chan=>{   // getting user channel. will render green, then render messages based on server and channel
        
        let renderChannelRef = rtdb.child(titleRef,`chatServers/${serv}/channels`); 
        rtdb.onValue(renderChannelRef, ss=>{  // getting db channels of passed in server
        
          let channelObj = ss.val();
          $("#channels").empty();   
          let channelIds = Object.keys(channelObj);
          channelIds.map((chans)=>{ 
            
            if (chan.val() === chans) {
              $("#channels").append(
              `<div class="channels" data-id=${chans} style="color:rgb(0,255,0)">
                ${channelObj[chans].chanName}
              </div>`
            )} else {
            $("#channels").append(
              `<div class="channels" data-id=${chans}>
                ${channelObj[chans].chanName}
              </div>`
            )}
          })
        $(".channels").click(clickHandlerChannel);
      })
    })
  }

let renderUsersInServer = function (servs) {
      $("#serverUsers").empty();   
      let serverRef = rtdb.ref(db,`/chatServers/${servs}/members/`);
      rtdb.onValue(serverRef,ss=>{
        let userList = ss.val();
        let userIds = Object.keys(userList);
        userIds.map((users)=>{ 
        let userObj = userList[users];
          $("#serverUsers").append(
          `<div class="serverUsers" id="${userObj.uid}" data-id=${userObj.uid}>
            ${userObj.username}
          </div>`
          )
        }); 
        $(`.serverUsers`).click(clickHandlerServerUserRemove);
      });   
}
let clickHandlerServerUserRemove = function (evt) {
  
  let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  let username = $(clickedElement).html();
  $("#userControl").empty();
  $("#userControl").append(          
    `<div class="serverUsers" >
      ${username} <button data-id="${idFromDOM}" type="button" id="rmUserBtn">Kick from server</button>
    </div>`)
  $(`#rmUserBtn`).click(clickUserRemove);
} // onclick, create button in control panel to remove user from server
let clickUserRemove = function (evt) {
  $("#serverUsers").empty();
  let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  let memberRef = rtdb.child(titleRef,`chatServers/${currentServer}/members/`);
    rtdb.get(memberRef).then(members=>{
      members = members.val();
      let memberIDs = Object.keys(members);
      memberIDs.map((mem)=>{
      let memObjUID = members[mem]; 
        if (memObjUID.uid === idFromDOM) {
          let rmRef = rtdb.ref(db,`/chatServers/${currentServer}/members/${mem}`);
          rtdb.remove(rmRef);
        }
      })         
  })
  $("#serverUsers").empty();
  $("#userControl").empty();
}
let clickHandlerAddUser = function () {
  let messageRef = rtdb.child(titleRef,`chatServers/${currentServer}/members/`);
  let newUser = $("#addUserDropdown").val();
  let newUserID = $(`#${newUser}`).attr("data-id");
  let myUserRef = rtdb.child(userRef,`${uid}/`);
  let user = {
      uid : newUserID,
      username : newUser
  }
  $("#serverUsers").empty();
  let memberRef = rtdb.ref(db,`/chatServers/${currentServer}/members/`);
  rtdb.push(memberRef,user);
}






let renderMessages = function (myUID) {
  let messageRef = rtdb.child(titleRef,`chatServers/${currentServer}/channels/${currentChannel}/`);
  rtdb.onValue(messageRef,ss=>{
    let servChanMsgObj = ss.val();
    $(".msgList").empty();   
    let messageIds = Object.keys(servChanMsgObj);
    messageIds.map((msg)=>{
    let msg1 = servChanMsgObj[msg];
    if (myUID === msg1.senderID) {
    $(".msgList").append(
      `<div class="messagesFromMe" data-id=${msg}>
        Transmission from: ${msg1.senderName}<br>
        ${msg1.message}
      </div>`);
    } else {
    $(".msgList").append(
      `<div class="messagesNotFromMe" data-id=${msg}>
        Transmission from: ${msg1.senderName}<br>
        ${msg1.message}
      </div>`);
    }
  });
  
  });
}
let pushChat = function () {
  
  let messageRef = rtdb.child(titleRef,`chatServers/${currentServer}/channels/${currentChannel}`);
  let message = $("#incomingMsg").val();
  $("#incomingMsg").empty();
  let x = new Date().getTime()
  let myUserRef = rtdb.ref(db,`/users/${uid}`)
  rtdb.get(myUserRef).then(ss=>{
    username = ss.val().name;
    
    let newMessage = {
      "message" : message,
      "senderName" : username,
      "senderID" : uid,
      "timeStamp" : x,
      "edited" : false 
      
    }
    console.log(newMessage);
    console.log(uid)
    rtdb.push(messageRef, newMessage)
  });
}
$("#btnIncomingMsg").click(()=>{
  pushChat();  
})





