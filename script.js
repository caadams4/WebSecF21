
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
let serverUsers = [];
let editing;

const app = initializeApp(firebaseConfig);
let auth = fbauth.getAuth(app);
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let chatRef = rtdb.child(titleRef,"chatServers/");
let userRef = rtdb.child(titleRef,"users/");



rtdb.onValue(userRef,ss=>{
    $("#flatEarthers").empty();
    existingUsers = [];
    let userList = ss.val();
    let userIds = Object.keys(userList);
    userIds.map((users)=>{ 
      let userObj = userList[users];
      let userDB = {
        username: userObj.name,
        uid: users,
        admin: userObj.roles.admin
      }
      existingUsers = existingUsers.concat(userDB);
    });
    renderUsers();
  });


fbauth.onAuthStateChanged(auth, user => {
      if (!!user){ 
        let myusername;
        uid = user.uid;
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
          username = ss.val().name;
          myusername = ss.val().name;
          currentChannel = pageUser.channel;
          currentServer = pageUser.server;
          pageUpdate(currentServer,username);
          renderChannels();
          renderWhoAmI();
          renderMessages(uid);

        });
        $("#login_register_module").css({"display":"none"}); 
        $("#chat_module").css({"display":"contents"}); 

      } else {
        $("#chat_module").css({"display":"none"});
        $("#whoIsUser").html("Logged in as : ")
        $("#login_register_module").css({"display":"contents"});
      }  
});

let pageUpdate = function (currentServer,myusername) {
  let serverRef = rtdb.ref(db,`/chatServers/${currentServer}/members/`);
  let channelRef = rtdb.ref(db,`/chatServers/${currentServer}/channels/`);

    $("#whoAmI").empty();
    $("#whoAmI").append(
      `<div>
        Logged in as : ${myusername}
      </div>`
     )

  
  //list users in server
  rtdb.onValue(serverRef,ss=>{
    serverUsers = [];
    let userList = ss.val();
    let userIds = Object.keys(userList);
    userIds.map((users)=>{ 
      let userObj = userList[users];
      let serverUser = {
        username: userObj.username,
        uid: userObj.uid,
      }
      serverUsers = serverUsers.concat(serverUser);
    });
    renderUsersInServer("");
  });
  
  //TODO Get array of channels
  rtdb.onValue(channelRef, ss=>{
    existingChannels = [];
    let channelList  = ss.val();
    let channelIds = Object.keys(channelList);
    channelIds.map((chans)=>{
      let chanObj = channelList[chans];
      let addChan = {
        chanName: chanObj.chanName,
        chanID: chans
      }
      existingChannels = existingChannels.concat(addChan);
    });
      renderChannels(currentServer);
  });
  
  rtdb.onValue(chatRef, ss=>{
    existingServers = [];
    let serverList  = ss.val();
    let serverIds = Object.keys(serverList);
    serverIds.map((servs)=>{
      let serverObj = serverList[servs];
      
      let addServer = {
        servName: serverObj.servName,
        servID: servs
      }
      existingServers = existingServers.concat(addServer);
    });
     renderServers();
  });

  renderAdminTools();

}


$("#logout").on("click", ()=>{

  fbauth.signOut(auth);

})


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
  let userAlreadyExists;
  existingUsers.forEach(user=>{
    if (username === user.username) {
      userAlreadyExists = true;
    }
  })
  if (userAlreadyExists === true) {
    alert("User already exists");
    return;
  } else {
  
  
  let p1 = $("#regpass1").val();
  let p2 = $("#regpass2").val();
  if (p1 != p2){
    alert("Passwords don't match");
    return;
  }
  
  fbauth.createUserWithEmailAndPassword(auth, email, p1).then(somedata=>{
    uid = somedata.user.uid
    currentServer = "General Chat";
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
    let messageRef = rtdb.child(titleRef,`chatServers/-MmKuzfOiBRFV6EHOiWW/members/`);
    rtdb.push(messageRef,{"uid": uid,"username":username})
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
}});


let renderUsers = function () { //takes in onValue pulled JSON
  let isAdmin = false;
      existingUsers.forEach(user=>{
        if (user.admin === true) {
          $("#flatEarthers").append(
            `<div class="users" data-id=${user.uid}>
              ${user.username} - Admin <div button-id=${user.uid}}></div>
            </div>`
        )}
        $(".users").click(clickHandlerUser);
        })
        existingUsers.forEach(user=>{                  
          if (user.admin !== true) {
            $("#flatEarthers").append(
            `<div class="users" data-id=${user.uid}>
              ${user.username}<div button-id=${user.uid}}></div>
            </div>`
          )}
          $(".users").click(clickHandlerUser);
        })
    }


let clickHandlerUser = function (evt) {
  
  let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  let clickedUserRef = rtdb.child(titleRef,`users/${idFromDOM}`);
  let userInQuestion = idFromDOM;
  let myUserRef = rtdb.child(titleRef,`users/${uid}/roles/admin`);
  rtdb.get(myUserRef).then(admin=>{
    if (admin.val() === true) {

  rtdb.get(clickedUserRef).then(ss=>{ 
          $("#userControl").empty();
            if(ss.val().roles.admin === true) {
              $("#userControl").append(
              `<div class="users" >
                ${ss.val().name}<button class="adminPriv" data-id="${ss.key}" type="button" id="killadmin">Remove Admin?</button>
              </div>`
            )} else {
              $("#userControl").append(
              `<div class="users">
                ${ss.val().name} - Admin <button class="adminPriv" data-id=${ss.key} type="button" id="makeadmin">Add Admin?</button>
              </div>`
            )}
          $(".adminPriv").click(clickHandlerAdminPriv);
    })
   }
 })
}
let clickHandlerAdminPriv = function (evt) {
  let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  let action = $(clickedElement).html();
  let userInQuestion = idFromDOM;
  let clickedUserRef = rtdb.child(userRef,`/${idFromDOM}/roles/admin`);
  let userChannelRef = rtdb.child(userRef,`/${uid}/channel`);
  rtdb.set(userChannelRef, idFromDOM);
  let myUserRef = rtdb.child(titleRef,`users/${uid}/roles/admin`);
  if (action === "Add Admin?") {
      rtdb.set(clickedUserRef, true);
      $("#userControl").empty(); 
    } else {
      rtdb.set(clickedUserRef, false);
      $("#userControl").empty();
    }
  pageUpdate();
}



let renderAdminTools = function () {
  let myUserRef = rtdb.child(titleRef,`users/${uid}/roles/admin`);
  rtdb.get(myUserRef).then(ss=>{
    if (ss.val() === true) {
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

    })
    }
    $("#newServBtn").click(clickHandlerNewServ);
    $("#newChanBtn").click(clickHandlerNewChan);
    $("#addUserBtn").click(clickHandlerAddUser);
  })

}


let newServ = function(serverName) {
  let myUserRef = rtdb.child(titleRef,`users/${uid}`);
  let servExists;
  existingServers.forEach(server=>{
    if (serverName === server.servName) {
      servExists = true;
    }
  })
  if (servExists === true) {
    alert("Server already exists");
    return;
  } else {
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


let clickHandlerServer = function(evt){
  let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  currentServer = idFromDOM;
  let userServerRef = rtdb.child(userRef,`${uid}/server`);
  let userChannelRef = rtdb.child(userRef,`${uid}/channel`);
  let serverRef = rtdb.ref(db,`/chatServers/${currentServer}/members/`);
  currentChannel = "general";
  let memberOf = false;
    rtdb.get(serverRef).then(ss=>{
    serverUsers = [];
    let userList = ss.val();
    let userIds = Object.keys(userList);
    userIds.map((users)=>{ 
      let userObj = userList[users];
      let serverUser = {
        username: userObj.username,
        uid: userObj.uid,
      }
      serverUsers = serverUsers.concat(serverUser);
    });
    let userRoleRef = rtdb.child(userRef,`${uid}/roles/admin`);
    serverUsers.forEach(user=>{
      rtdb.get(userRoleRef).then(ss=>{
        if (user.uid === uid || ss.val() === true) {
          memberOf = true;
          rtdb.set(userServerRef, idFromDOM);
          rtdb.set(userChannelRef, "general");
          pageUpdate(currentServer);
          renderMessages(uid);
          renderUsersInServer("");
      }   
      })
    })
  });  
} // switch cahnnels on click based on uid
let renderServers = function () {
    let passingServ;
    let userServerRef = rtdb.child(userRef,`${uid}/server`);
    rtdb.get(userServerRef).then(serv=>{
        $("#servers").empty();
        existingServers.forEach(server=>{
          if (server.servID === serv.val()) {
          $("#servers").append(
            `<div class="servers" data-id=${server.servID} style="color:rgb(0,255,0)">
              ${server.servName}
            </div>`)
            passingServ = server.servName;
          } else {
            $("#servers").append(
            `<div class="servers" data-id=${server.servID}>
              ${server.servName}
            </div>`)
          }
          
        })
      $(".servers").click(clickHandlerServer);
      renderChannels();

  })
}


let newChan = function () {
  let channelName = $("#newChannel").val();
  let myUserRef = rtdb.child(titleRef,`users/${uid}`);
  let chanExists;
  
  existingChannels.forEach(channel=>{
    console.log(channelName)
    console.log(channel.chanName)
    if (channelName === channel.chanName) {
      chanExists = true;
    }
  })
   if (chanExists === true) {
    alert("Channel already exists");
    return;
  } else {
    rtdb.get(myUserRef).then(ss=>{
    let servUser = ss.val().server; //get the user's server id Key to ref inside of that server
      let newChannel = {
            "chanName" : channelName,
            
      }
    let channelRef = rtdb.child(titleRef,`chatServers/${servUser}/channels/`);
    rtdb.push(channelRef,newChannel);   
    renderChannels();
    });
  }
}
let clickHandlerNewChan = function () {
  let channelName = $("#newChannel").val();
  newChan(channelName);    
}

let clickHandlerChannel = function(evt){
  let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  currentChannel = idFromDOM;
  let userChannelRef = rtdb.child(userRef,`/${uid}/channel`);
  rtdb.set(userChannelRef, idFromDOM);
  renderChannels();
  renderMessages(uid);
} // switch cahnnels on click based on uid

let renderChannels = function (currentServer) {
    let userChannelRef = rtdb.child(userRef,`${uid}/channel`);
    rtdb.get(userChannelRef).then(chan=>{
        $("#channels").empty();
        existingChannels.forEach(channel=>{
          if (channel.chanID === chan.val()) {
              $("#channels").append(
              `<div class="channels" data-id=${channel.chanID} style="color:rgb(0,255,0)">
                ${channel.chanName}
              </div>`
            )} else {
            $("#channels").append(
              `<div class="channels" data-id=${channel.chanID}>
                ${channel.chanName}
              </div>`
            )}
          })
        $(".channels").click(clickHandlerChannel);
        })
  }


let renderUsersInServer = function (doNotRender) {
      $("#serverUsers").empty();   
      serverUsers.forEach(user=>{
        if(user.uid !== doNotRender) {
        $("#serverUsers").append(
          `<div class="serverUsers" id="${user.uid}" data-id=${user.uid}>
            ${user.username}
          </div>`
          )
          $(`.serverUsers`).click(clickHandlerServerUserRemove);
        }
    })
      
}   
let clickHandlerServerUserRemove = function (evt) {
  let clickedElement = evt.currentTarget;
  let idFromDOM = $(clickedElement).attr("data-id");
  let username = $(clickedElement).html();
  let myUserRef = rtdb.child(titleRef,`users/${uid}`);
  rtdb.get(myUserRef).then(ss=>{
    if (ss.val().roles.admin === true) {
        $("#userControl").empty();
        $("#userControl").append(          
        `<div class="serverUsers" >
          ${username} <button data-id="${idFromDOM}" type="button" id="rmUserBtn">Kick from server</button>
        </div>`)
        $(`#rmUserBtn`).click(clickUserRemove);
    } 
  });
} // onclick, create button in control panel to remove user from server
let clickUserRemove = function (evt) {
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
  $("#userControl").empty();
  renderUsersInServer(idFromDOM);
}
let clickHandlerAddUser = function () {
  let messageRef = rtdb.child(titleRef,`chatServers/${currentServer}/members/`);
  let newUser = $("#addUserDropdown").val();
  let userAlreadyInServer;
  
  serverUsers.forEach(user=>{
    if (newUser === user.username) {
      userAlreadyInServer = true;
    }
  })
  if (userAlreadyInServer === true) {
    alert("User is already a member");
    return;
  } else {
  let newUserID = $(`#${newUser}`).attr("data-id");
  let myUserRef = rtdb.child(userRef,`${uid}/`);
  let user = {
      uid : newUserID,
      username : newUser
  }
  $("#serverUsers").empty();
  let memberRef = rtdb.ref(db,`/chatServers/${currentServer}/members/`);
  rtdb.push(memberRef,user);
  renderUsersInServer();
  }
}

let renderMessages = function (myUID) {
  let messageRef = rtdb.child(titleRef,`chatServers/${currentServer}/channels/${currentChannel}/messages`);
  rtdb.onValue(messageRef,ss=>{
    let servChanMsgObj = ss.val();
    $(".msgList").empty();   
    let messageIds = Object.keys(servChanMsgObj);
    messageIds.map((msg)=>{
    let msg1 = servChanMsgObj[msg];
    if (myUID === msg1.senderID) {
      if (msg1.edited === true) {
        $(".msgList").append(
          `<div class="messagesFromMe" data-id=${msg}>
            -Edited-Transmission from: ${msg1.senderName} at ${msg1.timeStamp}:<br>
            ${msg1.message}
          </div>`);
          $(`.messagesFromMe`).click(clickHandlerEditMsg);
      } else {
        $(".msgList").append(
          `<div class="messagesFromMe" data-id=${msg}>
          Transmission from: ${msg1.senderName} at ${msg1.timeStamp}:<br>
          ${msg1.message}
        </div>`);
        $(`.messagesFromMe`).click(clickHandlerEditMsg);
    }} else {
      if (msg1.edited === true) {
        $(".msgList").append(
          `<div class="messagesNotFromMe" data-id=${msg}>
            Edited-Transmission from: ${msg1.senderName} at ${msg1.timeStamp}:<br>
            ${msg1.message}
          </div>`);
          $(`.messagesFromMe`).click(clickHandlerEditMsg);
    } else {
        $(".msgList").append(
          `<div class="messagesNotFromMe" data-id=${msg}>
            Edited-Transmission from: ${msg1.senderName} at ${msg1.timeStamp}:<br>
            ${msg1.message}
          </div>`);
          $(`.messagesFromMe`).click(clickHandlerEditMsg);
    }}
      
  });
  });
}
let pushChat = function () {
  let messageRef = rtdb.child(titleRef,`chatServers/${currentServer}/channels/${currentChannel}/messages`);
  let message = $("#incomingMsg").val();
  $("#incomingMsg").empty();
  let x = Date().valueOf();
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

let clickHandlerEditMsg = function (evt) {
  if (editing !== true) {
    let clickedElement = evt.currentTarget;
    let idFromDOM = $(clickedElement).attr("data-id");
    $(clickedElement).append(`
    <input type="text" 
      data-edit=${idFromDOM} 
      class="msgedit" 
      placeholder="Edit message"/>
    <button data-done=${idFromDOM}>Send Edit</button>`);
    editing = true;
    $(`[data-done=${idFromDOM}]`).on("click", (evt)=>{
    let editedMsg = $(`[data-edit=${idFromDOM}]`).val();
    sendEdit(idFromDOM, editedMsg, Date().valueOf()); 
    $(`[data-edit=${idFromDOM}]`).remove();
    }
  )};
}
  
let sendEdit = function(msgid, msgup, time) {
    let messageRef = rtdb.child(titleRef,`chatServers/${currentServer}/channels/${currentChannel}/messages/${msgid}`);
    rtdb.update(messageRef, {"edited": true, "message": msgup, "timeStamp": time});
}  
