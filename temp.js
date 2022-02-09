const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const mysql = require("mysql2/promise");
const dotenv =require('dotenv');
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt')
const saltRounds = 10
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'mercenary0003@gmail.com',
        pass:'trafficoffender'
    }
});

app.use(session({
    key:'sessionName',
    secret:'whatdoido',
    resave:false,
    saveUninitialized:false,
}));

dotenv.config({path:'./.env'});

const db = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    multipleStatements:false,
    connectionLimit:10,
    queueLimit:0,
    waitForConnections:true
});

db.getConnection((err,res)=>{
    if(err)
    throw err
    console.log("Connected!")
})

const publicdirectory = path.join(__dirname, './public');
app.use(express.static(publicdirectory));
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.set('view engine', 'hbs');
app.set('views','./views');
// db.connect( (error) => {
//     if(error) {
//         console.log(error)
//     }else{
//         console.log("MYSQL Connected.....")
//     }
// })
app.listen(5000, () => {
    console.log("Server started on Port 5000");
})
    
// Starting Routing
app.route('/')
    .get(async(req,res)=>{
        console.log("Inside home get request")
        res.render('home')
    })

app.route('/signin')
    .get(async(req,res)=>{
        console.log(" inside signin get request")
        res.render('signin')

    })
app.route('/signup')
    .post(async( req, res) => {
        sqli = "SELECT COUNT(*)  as retVal FROM admindb WHERE AdminEmail='"+req.body.email+"';";
        console.log(req.body.email)
        const val = await db.query(sqli);
        // const val = await queryRunner(req.body.email)
        // console.log(val)
        // console.log(result)
        if(val[0][0] .retVal== 0){
            console.log("New user")
            req.session.name = req.body.name;
            req.session.email = req.body.email;
            req.session.pass = req.body.password;
            req.session.otp = Math.floor(100000+Math.random()*900000);
            console.log(req.session.otp)
            sendOTPMail(req.body.email,"Verification Mail","OTP:"+req.session.otp);
            res.redirect('otp');
        }
        else{
            console.log("Email already exists")
            res.redirect('back')
        }
    });

app.route('/otp')
    .get(async(req,res)=>{
        console.log("Inside get request of otp")
        res.render('signup_otp')
    })
    .post(async(req,res)=>{
        console.log("Inside post request of otp");
        if(req.body.otpVal == req.session.otp){
            let hashedPassword = await bcrypt.hash(req.session.pass, 8);
            console.log(hashedPassword);
            sqli = "INSERT INTO `admindb`(`AdminName`,`AdminEmail`,`AdminPassword`)VALUES('"+req.session.name+"','"+req.session.email+"','"+hashedPassword+"');";
            const result = await db.query(sqli);
            if(Object.keys(result).length!=0){
                res.render('main')
            }
            else{
                console.log("Query Failed")
            }
        }
        else{
            console.log("Invalid OTP")
            res.redirect('otp')
        }
    })


app.route('/signingIn')
    .post(async(req,res)=>{
        req.session.email = req.body.email1
        req.session.pass = req.body.password1
        sqli = "SELECT COUNT(*) as returnvalue FROM admindb WHERE AdminEmail='"+req.body.email1+"';";
        output = await db.query(sqli);
        console.log(output)
        console.log(req.body.email1)
        if(output[0][0] .returnvalue != 0){
           sqli = "SELECT AdminPassword FROM admindb WHERE AdminEmail = '"+req.body.email1+"';";
           const hashPass = await db.query(sqli);
           const passwordVal = await bcrypt.compare(req.body.password1,hashPass[0][0].AdminPassword);
           if(passwordVal){
               res.redirect('/main');
           }
           else{
               console.log("Wrong password")
               res.redirect('back')
           }
        }
        else{
            console.log("Email does not exist")
            res.redirect('back')
        }
    })

app.route('/forgotPass')
    .get(async(req,res)=>{
        console.log("Inside get of forgot Pass")
        res.render('email')
    })
    .post(async(req,res)=>{
        req.session.forgotMail = req.body.mail;
        console.log(req.session.forgotMail)
        req.session.forgotOTP = Math.floor(100000+Math.random()*900000);
        sendOTPMail(req.body.mail,"Password Recovery OTP","OTP"+req.session.forgotOTP)
        console.log(req.session.forgotOTP)
        res.render('ForgotPass')
    })

app.route('/enterCode')
    .get(async(req,res)=>{
        console.log("Inside get of enter OTP for forgot pass")
        res.render('ForgotPass')
    })
    .post(async(req,res)=>{
        console.log("inside post of enter code")
        if(req.body.code == req.session.forgotOTP){
            const passOTP = await bcrypt.hash(req.body.password_otp,saltRounds);
            sqli = "UPDATE admindb SET AdminPassword = '"+passOTP+"' WHERE AdminEmail = '"+req.session.forgotMail+"';";
            db.query(sqli);
            res.redirect('/main')
        }
        else{
            console.log("Invalid OTP")
            res.redirect('back')
        }
    })
// function
async function sendOTPMail(toId,sub,data){
    var mailContent = {
        from:'mercenary0003@gmail.com',
        to:toId,
        subject:sub,
        text:data
    };
    console.log("Sending mail");
    const mail = await transporter.sendMail(mailContent);
    console.log("Leaving the mail function");
}

/*let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO admindb SET ?', {AdminName: name,AdminEmail: email,AdminPassword: hashedPassword }, (error, results) => {
            if(error){
                console.log(error);
            } else{
                return res.render('signin',{
                    message: 'Admin Registered'
                });
            }
        }
*/

app.route('/main')
    .get(async(req,res)=>{

        console.log("i have entered get of main")
        //if(if report view == 0 && adminid ==0 )
        const Q1 = await db.query('SELECT *  FROM report WHERE Report_Status=0;');

        console.log("This is Query");
        console.log(Q1[0][0]);
        res.render('main',{date_time: Q1[0][0].date_and_time, repo: Q1[0][0].Report, num_plate: Q1[0][0].number_plate, manufacturer: Q1[0][0].Vehicle_manufacturer, color: Q1[0][0].Vehicle_colour, locate: Q1[0][0].Location, fine_amt: Q1[0][0].Fine_amount, img1: Q1[0][0].image1, img2: Q1[0][0].image2, img3: Q1[0][0].image3, img4: Q1[0][0].image4, img5: Q1[0][0].image5 })

        /*
        const admin_id = await db.query('SELECT AdminID from admindb WHERE AdminEmail ="'+req.session.email+'";')
        console.log("This is admin id")
        console.log(admin_id[0][0].AdminID);
        if(Q1[0][0].admin_id===0 && Q1[0][0].report_view==0 &&Q1[0][0].Report_status==0)
        {
           const counter=await db.query("SELECT COUNT(*) FROM report WHERE admin_id=0 AND report_view=0 AND Report_status=0;");
            console.log(counter);
        {
                await db.query('UPDATE report SET admin_id= "'+admin_id[0][0].AdminID+'",  WHERE id=1;')
                await db.query('UPDATE report SET report_view=1 WHERE id="'+ADMIN_ID[0][0].ID+'";');
                res.render('main',{date_time: Q1[0][0].date_and_time, repo: Q1[0][0].Report, num_plate: Q1[0][0].number_plate, manufacturer: Q1[0][0].Vehicle_manufacturer, color: Q1[0][0].Vehicle_colour, locate: Q1[0][0].Location, fine_amt: Q1[0][0].Fine_amount, img1: Q1[0][0].image1, img2: Q1[0][0].image2, img3: Q1[0][0].image3, img4: Q1[0][0].image4, img5: Q1[0][0].image5 })
        }
        else 
        {
            var no_data = 'All the reports have been viewed! Have a nice day ';
            res.render('main',{no_data})
        }*/
    })

app.route("/report_accepted")
    .post(async(req,res)=>{
        sqli = "UPDATE report SET Report_status = 1 WHERE id = "
    })

app.route('/editReport')
    .post(async(req,res)=>{
        const {num_plate,reported_offence,fine_amt} = req.body
        sqli = "UPDATE UPDATE report SET report_view=1 WHERE  "
        res.redirect('back');
    })