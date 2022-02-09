console.log("Before all dependencies get included!!");
require('dotenv').config();
const nodemailer = require('nodemailer');
const fileUpload = require('express-fileupload');
let uploadPath = "E:\\PingProject\\Upload\\";
let name,sampleFilename, s,n;
var flag = 0;
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const mysql = require('mysql2/promise');
const io = require('socket.io')(server)
const bcrypt = require("bcrypt");
const { resolve } = require('path');
const { S_IFBLK } = require('constants');
const { runInNewContext } = require('vm');
const saltRounds = 10;
const util = require('util');
const readDir = util.promisify(fs.readdir);
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'ping.chat.007@gmail.com',
        pass:'ThreadRippers007'
    }
});

const conn = mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    port:process.env.DB_PORT,
    database:process.env.DB_DATABASE,
    multipleStatements:false,
    connectionLimit:10,
    queueLimit:0,
    waitForConnections:true
});

app.set('views','./views');
app.set('view engine','ejs');
app.use(express.json());
app.use(express.static("E:\\PingProject\\public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    key:'sessionName',
    secret:'whatdoido',
    resave:false,
    saveUninitialized:false,
}));

console.log("About to begin routing!");

app.route('/')
    .get(async(req,res)=>{
        console.log("Inside get request of root!!");
        req.session.visitedHomePage = true;
        console.log("Updated the value of visitedHomePage to true!");
        console.log(req.session.visitedHomePage);
        console.log(req.session.id);
        console.log("Rendering main page now!");
        req.session.SignInMessage="";
        res.render('Home');
        console.log("Main page rendered!!");
    });

app.route('/sign')
    .get((req,res)=>{
        console.log("Inside get request of Sign In!!!");
        console.log(req.session.visitedHomePage);
        console.log("About to check if home page has been visited or not");
        if(req.session.visitedHomePage){
            console.log("Home page has been visited....hence rendering SignIn!");
            console.log(req.session.id);
            res.render('SignInUp',{credentials:req.session.SignInMessage});
        }
        else{
            console.log("Home page has not been visited");
            console.log('Need to visit home page first before signing in!!');
            console.log("Redirecting to home page!");
            res.redirect('/');
            console.log("Redirected to home page");
        }
    })

app.route('/forgotPass')
    .get(async(req,res)=>{
        console.log("Inside get request of forgot pass");
        res.render('resetPassEmail');
    })
    .post(async(req,res)=>{
        console.log("Inside post request of forgot password");
        console.log(req.body.emailID);
        req.session.resetEmailId = req.body.emailID;
        const Exists = await emailExists(req.session.resetEmailId);
        if(Exists!==0){
            console.log("Email does exist in the database");
            req.session.resetOTP = Math.floor(100000 + Math.random() * 900000);
            console.log("OTP: "+req.session.resetOTP);
            sendOTPMail(req.session.resetEmailId,'Verification Mail','OTP: '+req.session.resetOTP);
            res.redirect('ChangeForgottenPassword');
        }
        else{
            console.log("Email does not exists in the database");
        }
    })

app.route('/ChangeForgottenPassword')
    .get(async(req,res)=>{
        console.log("Inside get request of change forgotten password");
        res.render('resetpass');
    })
    .post(async(req,res)=>{
        console.log("Inside change forgotten password");
        console.log(req.body.code);
        console.log(req.session.resetOTP);
        if(req.body.code == req.session.resetOTP){
            console.log("Valid OTP");
            // const newPassword = await bcrypt.hash(req.body.password_re,saltRounds);
            const changingPass = await changePass(req.session.resetEmailId,req.body.password_re);
            res.redirect('sign');
        }
        else{
            console.log("Invalid OTP");
        }
    })

app.route('/signIn')
    .post(async (req,res)=>{
        console.log("Inside post request of Sign In!!!");
        //console.log(req);
        console.log('Sign In submitted');
        console.log(req.body.form_email_0);
        console.log(req.body.Pass_word);
        console.log("Assigning values to session variables from the page");
        req.session.mailID = req.body.form_email_0;
        req.session.password = req.body.Pass_word;
        console.log("Values have been assigned to session variables");
        console.log("Calling the logIn function to log in the user");
        const result = await checkSpamCount(req.session.mailID);
        if(result < 5){
            const logInval = await logIn(req.session.mailID,req.session.password);
            if(logInval == 1){
                console.log("Valid login credentials");
                console.log("Rendering chat box");
                check(req.session.mailID);
                res.redirect('/e');
                console.log("Rendered chat box");
            }
            else if(logInval == 2){
                console.log("Valid login credentials.....but already logged in somewhere else");
                console.log("Redirecting back to signin page");
                req.session.SignInMessage="Already logged in somewhere else";
                res.redirect('sign');
                console.log("Redirected to Signin page");
            }
            else{
                console.log("Invalid login credentials");
                console.log("Redirecting to SignIn page");
                req.session.SignInMessage="Invalid credentials!";
                res.redirect('sign');
                console.log("Redirected to SignIn page");
            }
        }
        else{
            console.log("User has been reported spam multiple times");
            req.session.SignInMessage="Spam account!!";
            res.redirect('sign');
        }
    });

app.route('/SignUp')
    .post(async (req,res)=>{
        console.log("Inside post request of SignUp");
        console.log("Assigning user mail id value to session variable");
        console.log(req);
        req.session.mailID = req.body.form_email;
        console.log("check if email ID already exists or not");
        console.log(req.session.mailID);
        const existingEmail = await emailExists(req.session.mailID);
        console.log("Return value in post request "+existingEmail);
        console.log("Inside calling body of EmailExists function");
        console.log("Conditioning the result from the callback function");
        if(existingEmail==0){
            console.log("Email does not already exist in the database");
            console.log("Validating visitedSignUp value");
            req.session.visitedSignUp=true;
            console.log("Generating OTP and saving it to the session variable");
            req.session.OTP = Math.floor(100000 + Math.random() * 900000);
            console.log('OTP = '+req.session.OTP);
            console.log("Assigning values to session variables");
            req.session.full_name=req.body.form_email_1;
            req.session.userPass=req.body.form_password_re;
            console.log('Full name ='+req.session.full_name);
            console.log('Mail Id = '+req.session.mailID);
            console.log('Password = '+req.session.userPass);
            console.log("All values have been assigned and now sending the OTP via Email");
            sendOTPMail(req.session.mailID,'Verification Mail','OTP: '+req.session.OTP);
            console.log("OTP mail sent successfully");
            console.log("Now rendering the otp page");
            res.redirect('otp');
            console.log("OTP page rendered successfully");
        }
        else{
            console.log("False condition of emailExists");
            console.log("Email does exist and hence redirecting to signUp page");
            res.redirect('SignUp');
            console.log("Redirected to signUp page");
        }
    });

app.route('/otp')
    .get((req,res)=>{
        console.log("Inside get request of otp");
        console.log(req.session.visitedSignUp);
        console.log("checking whether signUp page has been visited or not");
        if(req.session.visitedSignUp){
            console.log("Sign up page has been visited and hence rendering otp pag");
            res.render('otp',{mailID:req.session.mailID});
            console.log('enter otp page rendered!!');
        }
        else{
            console.log("Sign up page has not been visited");
            console.log('where am i supposed to send the otp to??!!!\nYou haven\'t even visited the sign up page yet!!');
            console.log("Redirecting to SignUp page");
            res.redirect('SignUp');
            console.log("Redirected to Signup page");
        }
    })
    .post(async (req,res)=>{
        console.log("Inside post request of OTP");
        console.log('Session OTP '+req.session.OTP);
        console.log("Verifying OTP");
        if(req.body.otpVal == req.session.OTP){
            console.log("Valid OTP.....SignUp the user");
            const hashing = await bcrypt.hash(req.session.userPass, saltRounds);
            console.log(hashing);
            const signUP = await signUp(req.session.full_name,req.session.mailID,hashing);
            console.log("Inside body of calling function of signUp");
            console.log("Checking value of result");
            if(signUP){
                console.log("SignUp successful");
                console.log("Automatically Logging in user to save hassle");
                console.log("Calling logIn function from signUp calling function");
                const loggingIn = await logIn(req.session.mailID,hashing);
                console.log("Inside calling function of LogIn from inside of calling function of SignUp");            
                console.log("Log in inside signUp "+loggingIn);
                console.log("Checking return value of logIn inside signUp");
                if(loggingIn){
                    console.log("Login inside signup verified...");
                    console.log("Rendering chat box");
                    check(req.session.mailID);
                    res.redirect('/e');
                    console.log("Chat box render complete");
                }
                else{
                    console.log("Log in inside sign up not verified..");
                    console.log('I don\'t know where to go from here');
                }
            }
            else{
                console.log("Sign up itself failed....didn\'t even make it to login");
                res.redirect('SignUp');
            }
        }
        else{
            console.log("Invalid OTP");
            res.redirect('otp');
        }
    });

app.get('/logout',async (req,res)=>{
    console.log("Inside get request of logout");
    console.log("Calling log out function");
    console.log(req.session.mailID);
    const out = await logOut(req.session.mailID);
    if(out)
        console.log("LogOut successful");
    else    
        console.log("LogOut Unsuccessful");
    req.session.destroy();
    console.log("Redirecting to home page");
    res.redirect('/');
    console.log("Redirected to home page");
});

conn.getConnection((err,res)=>{
    if(err) throw err;
    console.log(__dirname);
    console.log("Connected!!");
});

// declaring functions
async function logIn(userName,pwd){
    console.log("Inside called body of logIn function");
    console.log(userName);
    console.log(pwd);
    console.log("Getting password");
    sqli = "SELECT pingUserMailPass FROM pingchat.pinguser WHERE pingUserMailID = '"+userName+"';";
    const hashedPassword = await conn.query(sqli);
    if(hashedPassword !== undefined){
        console.log(hashedPassword[0][0].pingUserMailPass);
    }
    const password = await bcrypt.compare(pwd,hashedPassword[0][0].pingUserMailPass);
    if(password){
        console.log("printing value of password");
        console.log(password);
        sqli = "SELECT pingUserIsOnline FROM pingchat.pinguser WHERE pingUserMailID = '"+userName+"';";
        console.log("executing the sql query");
        const QResult = await conn.query(sqli);
        console.log(QResult);
        if(QResult===undefined){
            return 4;
        }
        else if(Object.keys(QResult[0]).length == 1 && QResult[0][0].pingUserIsOnline==0){
            var sqli = "UPDATE pingchat.pinguser SET pingUserIsOnline=1 WHERE pingUserMailID = '"+userName+"';";
            const QueryResult = await conn.query(sqli);
            if(QueryResult[0].affectedRows)
                return 1;
            else
                return 4;
        }
        else if(Object.keys(QResult[0]).length == 1 && QResult[0][0].pingUserIsOnline==1){
            return 2;
        }
        else {
            return 3;
        }
    }
    else{
        console.log(password)
        console.log("bcrypt compare failed");
        return 4;
    }
};

async function getAvatarNames(){
    names = await readDir("E:\\PingProject\\public\\Avatars");
    return names;
}

async function signUp(userName,MailID,Password){
    console.log("Inside called body of SignUp function");
    sqli = "INSERT INTO `pingchat`.`pinguser`(`pingUserName`,`pingUserMailID`,`pingUserMailPass`)VALUES('"+userName+"','"+MailID+"','"+Password+"');";
    console.log("Executing query to enter user details into database");
    const QResult = await conn.query(sqli);
    if(Object.keys(QResult).length!=0){
        console.log("Query executed successfully....Registered");
        return 1;
    }
    else{
        console.log("Query not executed successfully...Not registered");
        return 0;
    }
};

async function BlockFriend(user,friend){
    console.log("Inside block friend");
    console.log(user,friend);
    sqli = "UPDATE pingchat.pingfriends SET pingFrndBlocked = 1 WHERE (pingFrndPersonOne = "+user+" AND pingFrndPersonTwo = "+friend+") OR (pingFrndPersonOne = "+friend+" AND pingFrndPersonTwo"+user+");";
    const result = await conn.query(sqli);
}

async function UnblockFriend(user,friend){
    console.log("Inside unblock friend");
    console.log(user,friend);
    sqli = "UPDATE pingchat.pingfriends SET pingFrndBlocked = 0 WHERE (pingFrndPersonOne = "+user+" AND pingFrndPersonTwo = "+friend+") OR (pingFrndPersonOne = "+friend+" AND pingFrndPersonTwo"+user+");";
    const result = await conn.query(sqli);
}

async function reportSpam(friend){
    console.log("Inside report spam ");
    console.log(friend);
    sqli = "UPDATE pingchat.pinguser SET pingUserSpamCount = pingUserSpamCount + 1 WHERE pingUserMailID = '"+friend+"';";
    const result = await conn.query(sqli);
}

async function checkSpamCount(user){
    console.log("Inside spam count");
    console.log(user);
    sqli = "SELECT pingUserSpamCount from pingchat.pinguser WHERE pingUserMailID = '"+user+"';";
    const result = await conn.query(sqli);
    console.log("Spam Count:");
    return result[0][0].pingUserSpamCount;
}

async function setIsOnlineTrue(mailID){
    console.log("Inside setIsOnlineTrue");
    sqli = "UPDATE pingchat.pinguser SET pingUserIsOnline=1 WHERE pingUserMailID = '"+mailID+"';";
    await conn.query(sqli);
}

async function setIsOnlineFalse(mailID){
    console.log("Inside setIsOnlineFalse");
    sqli = "UPDATE pingchat.pinguser SET pingUserIsOnline=0 WHERE pingUserMailID = '"+mailID+"';";
    await conn.query(sqli);
}

async function sendOTPMail(toId,sub,data){
    console.log("Inside called mail function body");
    console.log("Defining mail content");
    var mailContent = {
        from:'ping.chat.007@gmail.com',
        to:toId,
        subject:sub,
        text:data
    };
    console.log("Sending mail");
    const mail = await transporter.sendMail(mailContent);
    console.log("Leaving the mail function");
}

async function emailExists(mailID){
    console.log("Entering the emailExists function body");
    sqli = "SELECT COUNT(*) as returnValue FROM pingchat.pinguser WHERE pingUserMailID='"+mailID+"';";
    console.log("Executing the query to verify fresh email id");
    const QResult = await conn.query(sqli);
    console.log("Query has been executed");
    console.log("Return value "+QResult[0][0].returnValue);
    return QResult[0][0].returnValue;
};

async function logOut(mailID){
    console.log("Inside logout called function body");
    console.log(mailID);
    sqli = "UPDATE pingchat.pinguser SET pingUserIsOnline=0 WHERE pingUserMailID = '"+mailID+"';";
    console.log("Executing query to log out user");
    const QResult = await conn.query(sqli);
    console.log("Query has been executed")
    console.log("Log in status has been updated!");
    if(QResult[0].affectedRows==1){
        console.log("Undefined result");
        return 1;
    }
    else
        return 0;
};

async function sendFriendRequest(CurrentUser,OtherUser){
    console.log("1.Inside called function of sendFriendRequest");
    var logUser,nextUser;
    console.log("2."+CurrentUser);
    console.log("3.Getting userID of current user");
    const myUserID = await getUserID(CurrentUser);
    console.log(myUserID[0][0].retVal);
    logUser = myUserID[0][0].retVal;
    const endUserID = await getUserID(OtherUser);
    console.log(endUserID[0][0].retVal);
    nextUser = endUserID[0][0].retVal;
    sqli = "INSERT INTO pingchat.pingfriends(pingFrndPersonOne,pingFrndPersonTwo)VALUES("+logUser+","+nextUser+");";
    const QResult = await conn.query(sqli);
    console.log(QResult[0].affectedRows);
    if(QResult[0].affectedRows){
        console.log("12.Request Sent!!");
        return 1;
    }
    else{
          console.log("13.Request not sent!!");
          return 0;
    }
};

async function getUserID(mailID){
    console.log("Inside getUserID function");
    sqli = "SELECT pingUserID as retVal FROM pingchat.pinguser WHERE pingUserMailID = '"+mailID+"';";
    const QResult = await conn.query(sqli);
    return QResult;
}

async function getMailID(ID){
    console.log("Inside getMailID");
    console.log(ID);
    sqli="SELECT pingUserMailID,pingUserName FROM pingchat.pinguser WHERE pingUserID = "+ID+";"
    const QResult = await conn.query(sqli);
    return QResult[0][0];
}


async function getFriendDetails(userID){
        console.log("Mail ==> "+userID);
        sqli = "SELECT pingUserMailID,pingUserName,pingUserIsOnline,pingUserProfilePic FROM pingchat.pinguser WHERE pingUserID = "+userID+";";
        const Result = await conn.query(sqli);
        console.log(Result[0][0].pingUserMailID);
        return Result;
}
async function checkFriendRequest(senderid,receiverid){
    console.log(senderid[0][0].retVal);
    console.log(receiverid[0][0].retVal);
    sqli="SELECT * FROM  pingchat.pingfriends where (pingFrndPersonOne="+senderid[0][0].retVal+" and pingFrndPersonTwo="+receiverid[0][0].retVal+") or (pingFrndPersonOne="+receiverid[0][0].retVal+" and pingFrndPersonTwo="+senderid[0][0].retVal+") AND pingFrndDeclined=0;"
    const Result=await conn.query(sqli);
    console.log(Result[0][0]);
    if(Result[0][0])
        return 0;
    else
        return 1;
}

async function getUserName(mailID)
{
    console.log("Inside getUserName");
    sqli="SELECT pingUserName FROM pingchat.pinguser where pingUserMailID='"+mailID+"';";
    const Query=await conn.query(sqli);
    return Query[0][0].pingUserName;
}

async function getStatus(mailID)
{
    console.log("Inside getStatus");
    sqli="SELECT pingUserStatus FROM pingchat.pinguser where pingUserMailID='"+mailID+"';";
    const Query=await conn.query(sqli);
    return Query[0][0].pingUserStatus;
}

async function receivedFriendRequest(userMail){
    console.log(userMail);
    const userID = await getUserID(userMail);
    console.log(userID[0][0].retVal);
    sqli = "SELECT * FROM  pingchat.pingfriends where (pingFrndPersonOne="+userID[0][0].retVal+" or pingFrndPersonTwo="+userID[0][0].retVal+") and pingFrndTrue=0 AND pingFrndDeclined = 0;"
    const Result = await conn.query(sqli);
    console.log(Result[0]);
    return Result[0];
}

async function getProfilePic(UserName){
    console.log("Inside getProfilePic");
    Query = "SELECT pingUserProfilePic from pingchat.pinguser WHERE pingUserMailID = '"+UserName+"';";
    const result = await conn.query(Query);
    console.log(result);
    return result[0][0].pingUserProfilePic;
}

async function getFriends(mail){
    console.log("Inside getFriends function");
    var myFriends=[],details={};
    const userIDReceiver = await getUserID(mail);
    sqli = "SELECT pingFrndPersonTwo from pingchat.pingfriends WHERE pingFrndPersonOne='"+userIDReceiver[0][0].retVal+"' AND pingFrndTrue=1 UNION SELECT pingFrndPersonOne from pingchat.pingfriends WHERE pingFrndPersonTwo = '"+userIDReceiver[0][0].retVal+"' AND pingFrndTrue=1;";
    const result = await conn.query(sqli);
    console.log(result[0][0]);
    for(var i=0;i<result[0].length;i++){
        console.log("For the main user"+result[0][i].pingFrndPersonTwo);
        const maildIDofUser = await getFriendDetails(result[0][i].pingFrndPersonTwo);
        details={Id:maildIDofUser[0][0].pingUserMailID,Name:maildIDofUser[0][0].pingUserName,Online:maildIDofUser[0][0].pingUserIsOnline,pic:maildIDofUser[0][0].pingUserProfilePic};
        myFriends.push(details);
    }
    rooms[mail] = myFriends;
    return myFriends;
}

async function BlockFriend(user,friend){
    console.log("Inside block friend");
    console.log(user,friend);
    let userid=await getUserID(user);
    let friendid=await getUserID(friend);
    console.log(userid[0][0].retVal);
    console.log(friendid[0][0].retVal);
    sqli = "UPDATE pingchat.pingfriends SET pingFrndBlocked = "+userid[0][0].retVal+" WHERE (pingFrndPersonOne = "+userid[0][0].retVal+" AND pingFrndPersonTwo = "+friendid[0][0].retVal+") OR (pingFrndPersonOne = "+friendid[0][0].retVal+" AND pingFrndPersonTwo="+userid[0][0].retVal+");";
    const result = await conn.query(sqli);
}

async function UnblockFriend(user,friend){
    console.log("Inside unblock friend");
    console.log(user,friend);
    let userid=await getUserID(user);
    let friendid=await getUserID(friend);
    console.log(userid[0][0].retVal);
    console.log(friendid[0][0].retVal);
    sqli = "UPDATE pingchat.pingfriends SET pingFrndBlocked = 0 WHERE (pingFrndPersonOne = "+userid[0][0].retVal+" AND pingFrndPersonTwo = "+friendid[0][0].retVal+") OR (pingFrndPersonOne = "+friendid[0][0].retVal+" AND pingFrndPersonTwo = "+userid[0][0].retVal+");";
    const result = await conn.query(sqli);
}

 function getKeyByValue(object, value) {
     console.log("Inside getKeyByValue function");
    return Object.keys(object).find(key => object[key] === value);
  }
server.listen(3000,()=>{
    console.log("Server started on port 3000")
  })


app.use(fileUpload());
const rooms = { }, Userid = { }, link = { },naming = { },getemail = { },User_messages = { };
let messages = [],messagecontainer = { };
let sender_name, file_user;

function check(e){
    console.log("Inside check function");
    id = e;
}

async function setNameById(id)
{
    const q = "SELECT pingUserMailID,pingUserName from pinguser where pingUserID = '"+id+"';";
    const result = await conn.query(q);
    console.log(result[0][0].pingUserMailID)
    return result;
}

async function setName(n)
{
    const q = "SELECT pingUserName,pingUserID from pinguser where pingUserMailID = '"+n+"';";
    const result = await conn.query(q);
    naming[n] = result[0][0].pingUserName;
    Userid[n] = result[0][0].pingUserID;
    console.log("Inside setname function")
    console.log(result[0][0].pingUserID)
    console.log("Value of n")
    console.log(n)
    getemail[result[0][0].pingUserID] = n;
    console.log(naming);
}

app.get('/e', async(req, res) => {
    let friendname = await getFriends(id);
    res.redirect(id);
    await setName(id);
    //console.log(rooms);
})
app.get('/download',(req, res)=>{
    console.log("Inside /download");
    console.log(uploadPath+name,name);
    console.log(name);
    res.download(uploadPath+name,name);
})

app.get('/:room', async(req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('back')
    }
    console.log(req.params.room);
    console.log("Inside get request of chat box");
    console.log(req.session.mailID);
    const friendReq=await receivedFriendRequest(req.params.room);
    const currentUser=await getUserID(req.params.room);
    console.log(currentUser[0][0].retVal);
    let mail=[];
    for(let i=0;i<friendReq.length;i++){
        console.log(friendReq[i].pingFrndPersonOne);
        console.log(friendReq[i].pingFrndPersonTwo);
        const person1=friendReq[i].pingFrndPersonOne;
       console.log("if("+person1+"!=="+currentUser[0][0].retVal+")"+req.params.room);
        if(person1!==currentUser[0][0].retVal)
            mail.push(await getMailID(person1));
        console.log(mail.pingUserMailID);
        console.log(mail.pingUserName);
 }
    console.log("Printing sessionFullName")
    console.log(req.session.full_name)
    const Username=await getUserName(req.params.room);
    const status=await getStatus(req.params.room);
    const profilePic = await getProfilePic(req.params.room);
    console.log(status);
    console.log("Getting avatar names");
    avatarNames = await getAvatarNames();
    console.log(avatarNames);
    res.render('chat', { roomName: req.params.room,friends: rooms[req.params.room],friendlist:mail ,Username:Username,status:status, avatars:avatarNames, profilePic:profilePic});
})

app.post('/l', (req, res)=> {  
    console.log("Inside /l ");
    if (!req.files || Object.keys(req.files).length === 0|| file_user === undefined) {
 	    console.log("received error")
    res.end();         
    } 
    else
    {
        //let date = new Date();
        let sampleFile = req.files.file;
        let filess = uploadPath+ req.files.file.name;
        sampleFilename = req.files.file.name;
        sampleFile.mv(filess, (err)=> {
        if (err) {
          return res.status(500).send(err);
        }
        sendfile(sampleFilename)
        });
    }
   res.status(204).send(); 
});

function sendfile(filename){
    s.to(link[file_user]).broadcast.emit('download',{filename:filename,name:naming[sender_name],user:sender_name});
    messagecontainer = {data: filename, from: sender_name, to: file_user,stored: 0,file: 1};
    messages.push(messagecontainer);
    console.log("Array:  ");
    User_messages[sender_name].push(messages.length-1)
    if(User_messages[file_user]!=null)
        User_messages[file_user].push(messages.length-1)
    else{
            User_messages[file_user] = [];
            User_messages[file_user].push(messages.length-1)
        }
   console.log("Printing the user_messages")
   console.log(User_messages);
}
async function changePass(sender,newPass){
    console.log("Inside Change Pass");
    console.log(newPass);
    console.log(sender);
    const newPwd = await bcrypt.hash(newPass,saltRounds)
    sqli="UPDATE pingchat.pinguser set pingUserMailPass='"+newPwd+"' where pingUserMailID='"+sender+"';";
    const query = await conn.query(sqli);
}

async function changeUserProfilePic(newPicture,User){
    console.log("Inside changeUserProfilePic");
    Query = "UPDATE pingchat.pinguser set pingUserProfilePic = '"+newPicture+"' WHERE pingUserMailID = '"+User+"';";
    await conn.query(Query);
}

//sockets 
//on connection between socket and the server
io.on('connection', socket => {
    socket.on('name',(obj)=>{
        flag=1;
        console.log(obj)
         file_user = obj.send;    
          s = socket;
          sender_name = obj.room; 
          //console.log("file:"+file_user);
      })

      async function retrievemessages(email){
        console.log("LINK ID :")
        let userno = await getUserID(email);
        console.log("ID NO  : >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        console.log( userno[0][0].retVal)
        userno =  userno[0][0].retVal
        console.log("Inside messages retrieval!");
         let sqli = "select * from `pingchat`.`pingmessage` where pingMsgSndr = "+userno+" or pingMsgRcvr = "+userno+";";
         const result = await conn.query(sqli);
         console.log("RETRIEVE : >>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  "+result[0].length)
         for(let p=0;p<result[0].length;p++)
         {
             if(result[0][p].pingMsgFile === 1)
               {
                messagecontainer = {data: result[0][p].pingMsgData, from: result[0][p].pingMsgSndr, to: result[0][p].pingMsgRcvr,file:1}
               }
               else
               {
                messagecontainer = {data: result[0][p].pingMsgData, from: result[0][p].pingMsgSndr, to: result[0][p].pingMsgRcvr,file:0}
               }
             messages.push(messagecontainer);
             console.log("Messages retrieved")
         }
     
     }
     async function storemessages(array){
        let fromid ,toid,x,file;
        console.log("Inside storemessages !");
        console.log(">>>>>>>>>>>>>>>>>>length<<<<<<<<<<<<<<<<<"+array.length);
        console.log(array);
        for(x=0;x<array.length;x++){
        fromid = await getUserID(array[x].from);
        toid = await getUserID(array[x].to);
        fromid = fromid[0][0].retVal;
        toid = toid[0][0].retVal;
        console.log("Printing from")
        console.log(fromid)
        console.log("Printing to")
        console.log(toid)
        console.log("VALUE IN ARRAY FOR FILE PROPERTY");
        console.log(array[x].file);
        if(array[x].file === undefined)
           file = 0;
        else
           file = array[x].file;   
        console.log(array[x].data);
            const q = "Insert into `pingchat`.`pingmessage`(`pingMsgSndr`,`pingMsgRcvr`,`pingMsgData`,`pingMsgFile`) values('"+fromid+"','"+toid+"','"+array[x].data+"','"+file+"');";
            const result = await conn.query(q);
            console.log(result)
        }
    }
socket.on('clickeddata',(obj)=>{
    console.log(obj)
   	name = obj;
})



async function changePass(sender,newPass){
    console.log("Inside Change Pass");
    console.log(newPass);
    console.log(sender);
    sqli="UPDATE pingchat.pinguser set pingUserMailPass='"+newPass+"' where pingUserMailID='"+sender+"';";
    const query = await conn.query(sqli);
}

socket.on('changeStatus',async(sender,newStatus)=>{
    console.log("Inside Change Status");
    console.log(newStatus);
    console.log(sender);
    sqli="UPDATE pingchat.pinguser set pingUserStatus='"+newStatus+"' where pingUserMailID='"+sender+"';";
    await conn.query(sqli);
    })

socket.on('changePass',async(sender,newPass)=>{
    const changing = await changePass(sender,newPass);
})

socket.on('changeProfile',async(newPicture,User)=>{
    console.log("Inside changeProfile");
    await changeUserProfilePic(newPicture,User);
})

socket.on('acceptRequest',async(name,email)=>{
    console.log("Inside Accept Request");
    console.log(email);
    const id=await getUserID(email);
    console.log(id[0][0].retVal);
    sqli="UPDATE pingchat.pingfriends set pingFrndTrue=1 where pingFrndPersonOne="+id[0][0].retVal+" and pingFrndDeclined=0;";
    await conn.query(sqli);
    socket.emit('deleteRequest',email);
})

socket.on('declineRequest',async(email)=>{
    console.log("Inside Accept Request");
    console.log(email)
    const id=await getUserID(email);
    console.log(id[0][0].retVal);
    sqli="UPDATE pingchat.pingfriends set pingFrndDeclined=1 where pingFrndPersonOne="+id[0][0].retVal+";";
    await conn.query(sqli);
    socket.emit('deleteRequest',email);
})
    
socket.on('sendrequest',async(sender,receiver)=>{
    console.log("Post of add friend");      
    console.log(sender);
    console.log(receiver);
    let senderid=await getUserID(sender)
    let receiverid=await getUserID(receiver)
    console.log(receiverid)
    const senderName=await getUserName(sender);
    console.log(senderName);
    console.log("Checking whether this email exists in database");
    const email = await emailExists(receiver);
    console.log('Inside emailExists function called body');
    if(email!=0){
        console.log("Email does exist in the database and hence sending friend request (inserting query in friend table)");
        const checkEmail=await checkFriendRequest(senderid,receiverid)
        if(checkEmail!=0){
            console.log("Inside CheckEmail");
            const frndReq = await sendFriendRequest(sender,receiver);
            if(frndReq){
                console.log("Friend request sent successfully!!");
                socket.emit('sentSuccessfully',receiver);
                socket.to(receiver).broadcast.emit('request',sender,senderName);
            }
            else
                console.log("Friend request could not be sent");
        }
        else{
            console.log("Request Has Already Been Sent");  
            socket.emit('AlreadyFriend');
        }    
    }
    else{
        console.log("Email does not exist in the database");
        socket.emit('EmailDoesNotExists');
    }
})

socket.on('addToFriendList',async(roomName,roomUserName,email,name)=>{
    console.log("addToFriendList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.")
    console.log(roomName);
    console.log(roomUserName);
    const sqli1="SELECT pingUserIsOnline FROM pingchat.pinguser where pingUserMailID='"+email+"';"
    const QueryForMe=await conn.query(sqli1);
    console.log(QueryForMe[0][0].pingUserIsOnline);

    const sqli2="SELECT pingUserIsOnline FROM pingchat.pinguser where pingUserMailID='"+roomName+"';"
    const QueryForOtherUser=await conn.query(sqli2);
    console.log(QueryForOtherUser[0][0].pingUserIsOnline)
    socket.emit('addFriend',email,name,QueryForMe[0][0].pingUserIsOnline);
    socket.to(email).broadcast.emit('addFriend',roomName,roomUserName,QueryForOtherUser[0][0].pingUserIsOnline);
})

socket.on('new-user',async (room) => {
    let user,message,sender;
    socket.join(room)
    await setIsOnlineTrue(room);
    await retrievemessages(room)
    if(User_messages[room] === undefined)
        User_messages[room] = [];    
    if(messages.length!=0)
    {
        let messageobj = {},sendarray = [],obj;
        for(let i=0;i<messages.length;i++)
        {
            // naming[n] = result[0][0].pingUserName;
            //Userid[n] = result[0][0].pingUserID;
            if(messages[i].to === Userid[room] || messages[i].from === Userid[room])
            {
                if(messages[i].from === Userid[room])
                   { 
                    obj = await setNameById(messages[i].to);
                    n = 0
                    user = 'self'+obj[0][0].pingUserMailID;
                    sender = 'You';
                   }
                else{
                    n = 1
                    obj = await setNameById(messages[i].from);
                    console.log(messages[i].from)
                     user = obj[0][0].pingUserMailID;
                     console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                     console.log(sender)
                     sender = obj[0][0].pingUserName;
                    }   
                  message = sender+":"+messages[i].data;
                  if(messages[i].file === 1)
                  {
                        messageobj = {data: messages[i].data ,name: sender,status:n,user:user,file:messages[i].file};
                  }
                  else
                  {
                    messageobj = {data: message ,status:n,user:user};
                  }

                  sendarray.push(messageobj);  
            }
        }
        console.log("SENDING DATA TO CLIENT")
        console.log(sendarray);
        socket.emit('reload',sendarray);
        sendarray.splice(0,sendarray.length);
        messages.splice(0,messages.length)
    }
    console.log("Checking reload")
    link[room] = socket.id;
    for(let z=0;z<rooms[room].length;z++)
     {
            if(link[rooms[room][z].Id] !== null)
                 {
                     socket.to(link[rooms[room][z].Id]).broadcast.emit('status', {status:1,roomname:room,func:1});
                 }
     }
    console.log(link);
  })

  socket.on('selfdata', (objroom)=>{
    socket.to(link[objroom.sendto]).broadcast.emit('status', {status:1,roomname:objroom.name,func:0});
    socket.io = null;
})

socket.on('send-chat-message', (room, message,thirduser) => {
    console.log(naming[room])
    socket.to(link[thirduser]).broadcast.emit('chat-message', { message: message, name: naming[room], room:room})
    messagecontainer = {data: message, from: room, to: thirduser,stored: 0}
    messages.push(messagecontainer);
    console.log("Array:  ");
        User_messages[room].push(messages.length-1)
        if(User_messages[thirduser]!=null)
            User_messages[thirduser].push(messages.length-1)
        else{
                User_messages[thirduser] = [];
                User_messages[thirduser].push(messages.length-1)
            }
    console.log("Printing the user_messages")
    console.log(User_messages);
  })

socket.on('statusOfFriend',async(friend)=>{
    console.log("Inside Status Of Friend>>>>>>>>>>>>>");
    const friendStatus=await getStatus(friend);
    console.log(friendStatus);
    socket.emit('updateStatus',friendStatus);
})

socket.on('blockFriend',async(roomName,friendName)=>{
    console.log("Inside Block Friend>>>>>>>>>>>>>>>");
    console.log(roomName);
    console.log(friendName);
    const blockedFriend=await BlockFriend(roomName,friendName);
})

socket.on('unblockFriend',async(roomName,friendName)=>{
    console.log("Inside UnBlock Friend>>>>>>>>>>>>>>>");
    console.log(roomName);
    console.log(friendName);
    const unblockFriend=await UnblockFriend(roomName,friendName);
})

socket.on('checkBlock',async(user,friend,counter)=>{
    console.log("Inside checkBlock>>>>>>>>>>>>>.")
    let userid=await getUserID(user);
    let friendid=await getUserID(friend);
    console.log(userid[0][0].retVal);
    console.log(friendid[0][0].retVal);
    let sqli = "SELECT pingFrndBlocked FROM pingchat.pingfriends WHERE (pingFrndPersonOne = "+userid[0][0].retVal+" AND pingFrndPersonTwo = "+friendid[0][0].retVal+") OR (pingFrndPersonOne = "+friendid[0][0].retVal+" AND pingFrndPersonTwo="+userid[0][0].retVal+");";
    const query=await conn.query(sqli);
    console.log(query[0][0].pingFrndBlocked);
        if(query[0][0].pingFrndBlocked!==0)
         {
             if(counter===0)
            {
                    socket.emit('verifyUnBlock',user,friend); 
            }
            else if(counter===1)
            {
                if(query[0][0].pingFrndBlocked===userid[0][0].retVal)
                    socket.emit('userBlocked',friend,0);
                else
                    socket.emit('hideBlocked',friend,0);
            }
         }
         else
        {
            if(counter===0)
            {
                socket.emit('verifyBlock',user,friend);
            }
            else if(counter===1)
            {
                console.log("Inside Not Block Code>>>>>>>>>>>>>");
                socket.emit('userNotBlocked',friend,0);
            }  
        }
})

socket.on('disconnect', async() => {
    console.log("disconnect");
    let sendmessages = [],messobj = {},from,data,to,file;
        let socket_talker = getKeyByValue(link,socket.id);
         console.log(rooms[socket_talker])
         await setIsOnlineFalse(socket_talker);
if(rooms[socket_talker].length!=undefined||messages[User_messages[socket_talker][x]].stored !== undefined){
         for(let z=0;z<rooms[socket_talker].length;z++)
            {
            if(link[rooms[socket_talker][z].Id] !== null)
                 {
                     socket.to(link[rooms[socket_talker][z].Id]).broadcast.emit('status', {status:0,roomname:socket_talker,func:1});
                 }
            }
          for(let x=0;x<User_messages[socket_talker].length;x++)
            {
              if(messages[User_messages[socket_talker][x]].stored === 0)
                 {
                    console.log("LIST: >>>>>>>>>!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! "+x)    
                    console.log(messages[User_messages[socket_talker][x]])    
                    to = messages[User_messages[socket_talker][x]].to;
                    from = messages[User_messages[socket_talker][x]].from;  
                    data = messages[User_messages[socket_talker][x]].data;  
                    file = messages[User_messages[socket_talker][x]].file; 
                    messobj = {from,data,to,file};
                    sendmessages.push(messobj);
                    messages[User_messages[socket_talker][x]].stored = 1;
                    console.log("Placed data in the database")
                    console.log(messages[User_messages[socket_talker][x]])
                    messages.splice(x,0); 
                    console.log("check message after delete")
                    console.log(messages[User_messages[socket_talker][x]])
                }
            }
        console.log(messages)
      await storemessages(sendmessages)
     console.log("THE DATA IN SEND MESSAGE  :  "+sendmessages.length)
    } 
  })
})
