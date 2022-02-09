let counter = 1;
let last_selection = null;
function myFunction() {
    var element = document.getElementById("landing-intro");
    if(counter == 1){
    	element.classList.toggle("page");
    }
    counter ++;
}

/*light mode script*/

const light_mode = document.querySelector(".body");

lightmode_btn.addEventListener("click" , () =>{
	light_mode.classList.toggle("light_on");
});

/* block friend button toggler */

function blockfriend() {
		console.log("Inside blockfriend()");
		let element=document.getElementsByClassName("block-friend");
		let name=element.id;
		socket.emit('checkBlock',roomName,name,0);
}

function checkBlock(e){
	console.log("Inside checkBlock")
	let user=e.getElementsByTagName('h6');
	console.log(user[0].innerText);
	socket.emit('checkBlock',roomName,user[0].innerText,1);
}

/* tablet frienliness related code */

function friend_profile_display(){
	light_mode.classList.toggle("display_profile");
}

/*mobile friendliness related code */

function chatbox_display(){
	light_mode.classList.toggle("chat_active");
}

/*profile page script */

function toggle_visibility(id) {
  var e = document.getElementById(id);
  if(e.style.display == 'block')
    e.style.display = 'none';
  else
    e.style.display = 'block';
}

var a = 0 ;
var b = 0 ;
var c = 0 ;
var btn_check = document.querySelector(".check");
var enable_btn = document.querySelector(".submit-btn");
var passwordTextBox = document.getElementById("form_password");
var retype_password = document.getElementById("form_password_re");


function checkPasswordStrength(input , a) {
      var password = passwordTextBox.value;
      var specialCharacters = "!£$%^&*_@#~?<>/';:{}[]=+-\|";
      var passwordScore = 0;

      // Contains special characters
      for (var i = 0; i < password.length; i++) 
      {
          if (specialCharacters.indexOf(password.charAt(i)) > -1) 
          {
              passwordScore += 20;
              break;
          }
      }

      // Contains numbers
      if (/\d/.test(password))
          passwordScore += 20;

      // Contains lower case letter
      if (/[a-z]/.test(password))
          passwordScore += 20;

      // Contains upper case letter
      if (/[A-Z]/.test(password))
          passwordScore += 20;

      if (password.length >= 8)
          passwordScore += 20;


      if (passwordScore >= 100) 
      {
          window['a'] = 1;
      }
      else 
      {
          window['a'] = 0 ;
      }
  };

function check_retype_password(input , b) {
  var retype_password = form_password_re.value;
  var password = passwordTextBox.value;
  if ( password !== retype_password )
  {
      window['b'] = 0 ;
  }
  else 
  {
      window['b'] = 1 ;
  }
}

btn_check.addEventListener("keyup",function() {
  if(a + b  == 2 ){
    	enable_btn.classList.toggle("active");
        c=1;
  }
  else if (c == 1 && b!= 1){
    	enable_btn.classList.toggle("active");
      	c=0;
  }
  else{
		c=0;
  }
})

/*user profile page toggle*/


function profile_switch_btn(){
  var Profile_page1 = document.getElementById("profile_page_1");
  Profile_page1.classList.toggle("switch_profile");
}



let add_friend = document.querySelector(".move-right");
let add_friend_ul = document.querySelector(".add-friend-ul");
let change_icon = document.querySelector(".friend-add-img");
let change_icon_2 = document.querySelector(".close");

add_friend.addEventListener("click",function(){
    add_friend_ul.classList.toggle("active");
    change_icon_2.classList.toggle("close-active");
    change_icon.classList.toggle("friend-add-active");
})

var accept_friend = document.querySelector(".friend-request-btn");
var friend_req_ul = document.querySelector(".friend-req-ul");
var icon_change = document.querySelector(".friend-req-img");
var icon_change2 = document.querySelector(".close-friend-btn");

accept_friend.addEventListener("click",function(){
  friend_req_ul.classList.toggle("request-ul-on");
  icon_change.classList.toggle("img-off");
  icon_change2.classList.toggle("close-is-on");
})

/* devnagri script keyboard */

let keyboard_icon = document.querySelector(".key");
let keyboard_eng = document.querySelector(".text-area");
let keyboard_hin = document.querySelector(".devnagri-keyboard");

keyboard_icon.addEventListener("click",function(){
  keyboard_eng.classList.toggle("switch");
  keyboard_hin.classList.toggle("hin-switch");
})


function input(e) {

  let txt = document.getElementById(myid);
  txt.value = txt.value + e.value;

}

function del() {

  let txt = document.getElementById(myid);
  txt.value = txt.value.substr(0, txt.value.length - 1);

}

/*
!IMPORTANT
Problems : 
Reloading refreshes all the data and array.
Need to find a new way to either stop any reload or 
Receive data from the server on refresh.
*/

const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const userlist = document.getElementById('user-list')
const fileTransfer = document.getElementById('Transfer')
const friend_element=document.getElementById('friendjs')
let flag = 0,friend = {},array = [],re = 0;
var messages,text,connected_user;
//Onsubmit the message is emitted to the server and displayed in this block.
//Until the user have not selected a user to send message, the message would not be
//shown, and a alert would be initiated in order to alert the user to select a user.
if (messageForm != null) {
	appendMessage('You joined')
	socket.emit('new-user', roomName)
	messageForm.addEventListener('submit', e => {
		e.preventDefault()
		if(text !== undefined && messageInput.value.length>0){
			const message = messageInput.value
			appendMessage(`You: ${message}`,0,0,"self"+text)
			socket.emit('send-chat-message', roomName, message,text)
			messageInput.value = ''
		}
		else
			alert("Empty Message!");   
		messageContainer.scrollTop = messageContainer.scrollHeight;
	})
}

let id_element;
socket.on('status',(object)=>{
	console.log(object);
	let traverse = 0;
	id_element = friend_element.getElementsByTagName('h6');
	while(traverse<id_element.length){
		if(object.roomname === id_element[traverse].innerText)
	    {
	    	console.log(traverse);
	        break;
	    }
	    ++traverse;
	}
	if(object.status ===1) 
		friend_element.getElementsByClassName('online-offline')[traverse].style.backgroundColor = "green";
	else 
		friend_element.getElementsByClassName('online-offline')[traverse].style.backgroundColor = "red";
	if(object.func === 1)
		socket.emit('selfdata',{name:roomName,sendto:id_element[traverse].innerText});
})

//file transfer block.
let fname;
let block2 = document.getElementById('send-container');
let block1 = document.getElementById('Transfer');
let block3 = document.getElementById('keyboard');
let block4 = document.getElementById('hide');
let block5 = document.getElementById('send');
let block6 = document.getElementById('toddler');
console.log("Hello"+block6);
function filetransfer(){
	if (block1.style.display === "none") {
		block1.style.display = "block";
		block2.style.display = "none";
		block3.style.display = "none";
		block4.style.display = "none";
		block5.style.display = "none";
		block6.style.marginLeft = "94.4%";
	}
	else {
		block1.style.display = "none";
		block2.style.display = "block";
		block3.style.display = "block";
		block4.style.display = "block";
		block5.style.display = "block";
		block6.style.marginLeft = "0%";
 	}
}


if (fileTransfer != null) {
	fileTransfer.addEventListener('submit', e => {
	 if(text !== undefined){
	 console.log("I am in submit module "+roomName)
	 let fname = document.getElementById('file').files[0].name;
	 socket.emit('name',{room:roomName,send:text});
		 showfile({filename:fname,user:"self"+text},0,0);
	   }
	   else
		 alert("Select a user to send file");
	}) 
 }

//This block is waiting for the click from the ejs side 
//It receives the element that has been clicked and it sends the Text of that 
//element to the server.

function clicked(e){
	console.log("Inside clicked");
	console.log(e);
	document.getElementById('block_back_button').style.display="block";
	document.getElementById('block_back_button').style.pointerEvents="all";
	connected_user = e.getElementsByTagName('h6');
	user_name = e.getElementsByTagName('h4');
	console.log(user_name)
	let friend_container = document.getElementById('friend_name');
	console.log(connected_user[0].innerText+"    "+user_name[0].innerText);
	friend_container.innerText = user_name[0].innerText;
	document.getElementById("friend_name_mobile").innerText = user_name[0].innerText;
	console.log("Printing profile pic source");
	// splitted = document.getElementById('UserProfilePictureClick').src.split("/")
	// console.log(splitted[3]+"/"+splitted[4]);
	// document.getElementsByClassName('profile-img').src = splitted[3]+"/"+splitted[4]
	//set block button id
	let block=document.getElementsByClassName("block-friend");
	block.id=connected_user[0].innerText;
	console.log(document.getElementsByClassName("block-friend"));
	   // re = 0;
	   socket.emit('name',connected_user[0].innerText);
	   socket.emit('statusOfFriend',connected_user[0].innerText);
 //Exception handling 
 //When the user selects the same user more then once.
			
	   if(text !== connected_user[0].innerText)
	   {
		 deleting(); 
		 text = connected_user[0].innerText;
 //Printing the user's messages        
	for(let x = 0;x<array.length;x++)
		 {
		  if(array[x].user === connected_user[0].innerText||array[x].user === "self"+connected_user[0].innerText) 
		  {  
		   if(array[x].file === undefined)  
		   appendMessage(array[x].data,array[x].status,1,array[x].user);
		   else
			 showfile({filename:array[x].data,user:array[x].user,name:array[x].name},array[x].status,1);
		   }
		   console.log("MESSAGE ARRAY")
		   console.log(array)
		   console.log(array[x].user+"  "+connected_user[0].innerText)
		 }
	  
	   socket.emit('chat-user',{text,roomName});
	   if(last_selection!=null)
	   last_selection.style.backgroundColor = "transparent";
	   e.style.backgroundColor = "rgba(0,0,0,0.6)";
	   last_selection = e;
	 }
 }

 function deleting(){
	while(document.getElementById('del') !== null)
	   {
			document.getElementById('del').remove();
	   }
 }

//Block to notify user of the file send.
//Initiated by the server side.

socket.on('download',(tx) => {
	console.log("Inside download.....printing tx")
	console.log(tx);
	if(tx.user === text)
	 showfile(tx,1,0);
	else
	{
	  id_element = document.getElementById(tx.user);
	  console.log("Chat-Message>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
	  console.log(id_element);
	  id_element.style.backgroundColor="#0059ff3b";
	}
  });

socket.on('reload',(obj)=>{
    array.splice(0,array.length)
    deleting();
	array = [...obj]
})

//Printing the file name, and listening for click.

function showfile(tx,n,reload){
	console.log(tx)
	console.log("Information about file")
	console.log(tx.filename+"   "+tx.user);
	let maincontainer = document.createElement('div'); 
	let file_container = document.createElement("div");
	let button = document.createElement("button");
	let buttontext = document.createTextNode(tx.filename);
	console.log(n);
	let username;
	 if(n == 1)
	{
		file_container.className = "chat-message-two"; 
		name = tx.name;
	}
	else
	{
		file_container.className = "chat-message-one";
		name = 'You';
	}
	maincontainer.className = 'chat';
	username = document.createTextNode(name+ " : ");
	file_container.append(username);
	maincontainer.id = "del";
	button.appendChild(buttontext);
	file_container.appendChild(button);
	maincontainer.append(file_container);
	messageContainer.append(maincontainer);
	file_container.addEventListener("click",()=>{  
	socket.emit('clickeddata',button.textContent);
	window.open('/download');
	//window.stop(); 
	});
	if(reload !== 1){
	array.push({data:tx.filename,name:tx.name,user:tx.user,status:n,file:1});
	console.log("File sector")
	console.log(array)
	}
	messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  

socket.on('delete',(del)=>{
    while(document.getElementById('list') == del)
    {
      document.getElementById('list').remove(); 
    }
})
socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
	let traverse = 0;
	if(text === data.room)
	  appendMessage(`${data.name}: ${data.message}`,1,0,data.room)
	else
	  {
		id_element = document.getElementById(data.room);
		console.log("Chat-Message>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
		console.log(id_element);;
		id_element.style.backgroundColor="#0059ff3b";
		}	
	   array.push({data:data.name+": "+data.message,status:1,user:data.room}); 
  }) 

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

//socket friend list

socket.on('verifyBlock',(user,friend)=>{
	let verify=confirm("Do you want to Block this Friend!!");
	if(verify)
	{
		socket.emit('blockFriend',user,friend);
		document.getElementById("block_friend_text").style.visibility="visible"
		document.getElementById("block_friend_color").style.fill="rgba(72, 255, 0, 0.658)";
		document.getElementById("block_friend_color1").style.fill="rgba(72, 255, 0, 0.658)";
		document.getElementById("block_friend_color").style.visibility="visible";
		document.getElementById("blockFriendButton").style.display="block";
		document.getElementById("block_friend_color1").style.visibility="visible";
		document.getElementById("block_friend_functionality").style.visibility="hidden";
		document.getElementById("block_friend_functionality").style.pointerEvents="none";
	}
})

socket.on('verifyUnBlock',(user,friend)=>{
	let verify=confirm("Do you want to UnBlock this Friend!!");
	if(verify)
	{
		socket.emit('unblockFriend',user,friend);
		document.getElementById("block_friend_text").style.visibility="hidden";
		document.getElementById("block_friend_color").style.fill="#FF6C6C";
		document.getElementById("block_friend_color1").style.fill="#FF6C6C";
		document.getElementById("block_friend_color").style.visibility="visible";
		document.getElementById("block_friend_color1").style.visibility="visible";
		document.getElementById("blockFriendButton").style.display="block";
		document.getElementById("block_friend_functionality").style.visibility="visible";
		document.getElementById("block_friend_functionality").style.pointerEvents="all";
	}
})

socket.on('hideBlocked',(friend,user)=>{
	document.getElementById("block_friend_text").style.visibility="visible";
	//document.getElementById("block_friend_color").style.visibility="hidden";
	//document.getElementById("block_friend_color1").style.visibility="hidden";
	document.getElementById("blockFriendButton").style.display="none";
	document.getElementById("block_friend_functionality").style.visibility="hidden";
	document.getElementById("block_friend_functionality").style.pointerEvents="none";
})

socket.on('userBlocked',(friend,user)=>{
	console.log("Inside userBlocked>>>>>>>>>>>>>>>>>.");
	if(user===0){
		document.getElementById("block_friend_text").style.visibility="visible"
		document.getElementById("block_friend_color").style.fill="rgba(72, 255, 0, 0.658)";
		document.getElementById("block_friend_color1").style.fill="rgba(72, 255, 0, 0.658)";
		document.getElementById("block_friend_color").style.visibility="visible";
		document.getElementById("blockFriendButton").style.display="block";
		document.getElementById("block_friend_color1").style.visibility="visible";
		document.getElementById("block_friend_functionality").style.visibility="hidden";
		document.getElementById("block_friend_functionality").style.pointerEvents="none";
	}
})

socket.on('userNotBlocked',(friend,user)=>{
	if(user===0){
		document.getElementById("block_friend_text").style.visibility="hidden";
		document.getElementById("block_friend_color").style.fill="#FF6C6C";
		document.getElementById("block_friend_color1").style.fill="#FF6C6C";
		document.getElementById("blockFriendButton").style.display="block";
		document.getElementById("block_friend_color").style.visibility="visible";
		document.getElementById("block_friend_color1").style.visibility="visible";
		document.getElementById("block_friend_functionality").style.visibility="visible";
		document.getElementById("block_friend_functionality").style.pointerEvents="all";
	}
})

socket.on('request',(sender,senderName)=>{ 
	console.log("Inside Request");
	let friendreqs=document.getElementById("friend-request");
	let div1=document.createElement("div");
	let div2=document.createElement("div");
	let div3=document.createElement("div");
	let para=document.createElement("p");
	let h4=document.createElement("h4");
	let h5=document.createElement("h5");
	let button1=document.createElement("button");
	let button2=document.createElement("button")


	div1.className="remove";
	div1.id=sender;
	div3.className="friend-req-btn"
	h4.id="FriendName";
	h5.id="FriendMail";
	console.log(senderName)
	h4.innerText=senderName;
	h5.innerText=sender;
	button1.className="btn accept";
	button2.className="btn decline";
	button1.innerText="Accept";
	button2.innerText="Decline";
	button1.addEventListener("click",()=>{
		AcceptRequest(senderName,sender,UserName);
	})
	button2.addEventListener("click",()=>{
		DeclineRequest(senderName,sender);
  })
	
	para.append(h4);
	para.append(h5);
	div2.append(para);
	div3.append(button1);
	div3.append(button2);
	div1.append(div2);
	div1.append(div3);
	console.log(div1);
	friendreqs.append(div1);
});

socket.on('addFriend',(sender,senderName,status)=>{
  console.log("Inside AddFriend");
  console.log(sender);
  console.log(senderName);
  let friendjs=document.getElementById("friendjs");

  let div1=document.createElement("div");
  let div2=document.createElement("div");
  let div3=document.createElement("div"); 
  let div4=document.createElement("div");
  let div5=document.createElement("div");
  let div6=document.createElement("div");
  let img1=document.createElement("img");
  let h4=document.createElement("h4");
  let h6=document.createElement("h6");

  div1.className="friendli";
  div1.id=sender;
  div1.addEventListener('click',()=>{
	clicked(div1);
	myFunction();
	document.getElementById('nikal').style.opacity='1';
  })
  div2.className="sec1";
  div3.className="user-profile-pic";
  div4.className="sec2";
  div5.className="sec3";
  div6.className="online-offline";
  div6.id="color-status";

  h4.innerText=senderName;
  h6.id="mailID";
  h6.innerText=sender;
  img1.src="./Images/ChatBox/Male Avatar.svg";

  div3.append(img1);
  div2.append(div3);
  div1.append(div2);

  div4.append(h4);
  div4.append(h6);
  div1.append(div4);

  div5.append(div6);
  div1.append(div5);

  friendjs.append(div1);
  console.log(div1);

    if(status===1) 
		div6.style.backgroundColor = "green";
	else 
		div6.style.backgroundColor = "red";

})

socket.on('updateStatus',(friendStatus)=>{
  console.log("Inside updateStatus");
  console.log(friendStatus);
    let friend=document.getElementById("friend-status");
    console.log(friend);
	friend.innerText=friendStatus;
	document.getElementById("friend_status_mobile").innerText=friendStatus;
})

socket.on('deleteRequest',(email)=>{
	let removeclass=document.getElementsByClassName("remove");
	console.log(removeclass.length);
	for(let i=0;i<removeclass.length;i++)
	{
	  let emailid=document.getElementsByClassName("remove")[i].id;
	  if(emailid===email)
		  document.getElementById(emailid).remove();
	}
  })

socket.on('AlreadyFriend',()=>{
  alert("Already Request Sent/Already Friend/FriendRequest Declined");
});

socket.on('EmailDoesNotExists',()=>{
  alert("Email Does Not Exists In Database");
})

socket.on('sentSuccessfully',receiver=>{
  alert("Request Successfully Sent To "+receiver);
})

function appendMessage(message,n,re,roomName)
 {   
  const maincontainer = document.createElement('div') 
  const messageElement = document.createElement('div')
  const timestamp = document.getElementById('div')
  let time = new Date();
  console.log(time.getMinutes());
  if(n == 0){
    messageElement.className = "chat-message-one";
  }
  else
   {
      messageElement.className = "chat-message-two";  
    } 
    //timestamp.innerHTML = time;
 if(re === 1)
  console.log("Loading saved messages");
  messageElement.innerText = message
 // timestamp.innerText = time;
  maincontainer.className = "chat";
  maincontainer.id = "del";
  maincontainer.append(messageElement)
  messageContainer.append(maincontainer)
  if(re === 0){
    array.push({data:message,status:n,user:roomName});
     console.log(friend,array);
   }
   messageContainer.scrollTop = messageContainer.scrollHeight;
}

//send Friend Request
function checkemail()
{
  const receiver=document.getElementById('email')
  console.log(receiver.value)
  if(receiver.value==='')
    alert("No EmailID/Wrong EmailID");
  else
    socket.emit('sendrequest',roomName,receiver.value);
  receiver.value='';
}

function AcceptRequest(name,email,roomUserName)
{
  console.log(email);
  socket.emit('acceptRequest',name,email);
  socket.emit('addToFriendList',roomName,roomUserName,email,name);
  alert("Accepted Friend Request");
}

function DeclineRequest(name,email)
{
	alert("Declined Friend Request");
	socket.emit('declineRequest',email);
}

function changeStatus(){
  let statusValue = document.getElementById("status").value;
  console.log(statusValue);
  if(statusValue==='')
    alert("Status cannot be blank!!");
  else{
    document.getElementById('statusPrint').innerText=statusValue;
    socket.emit('changeStatus',roomName,statusValue);
  }
}

function changeProfilePic(newPic){
	console.log("Inside changeProilePic")
	console.log(newPic);
	picName = newPic.split("/");
	console.log(picName);
	console.log("Printing file name");
	console.log(picName[4]);
	profilePicButton = document.getElementById('user-profile-pic-img-src');
	profilePicButton.src = newPic
	changePic = document.getElementById('newProfilePicture');
	changePic.src = newPic;
	socket.emit('changeProfile',picName[4],roomName);
}

function changePass(){
  let passValue = document.getElementById("form_password").value;
  console.log(passValue);
  if(passValue==='')
    alert("status cannot be blank!!");
  else{
    socket.emit('changePass',roomName,passValue);
    alert("Password Changed Successfully");
  }
}