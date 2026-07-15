require('dotenv').config();
const path = require("path");

const ejs = require("ejs");

const User = require("../models/user");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {createToken} = require("../service/authentication");
const {mysqlPool} = require("../config/db");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const OTP = require("../models/mongodb/forOTP");
console.log(OTP);

 
console.log(mysqlPool); 
function getAge(Dob){
  let dob = new Date(Dob);
  let today = new Date();
  let age  = today.getFullYear() - dob.getFullYear();
  let m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
     age--
  }
  return age;
}

async function userSignUpHandler(req, res, next){

    const body =  await req.body;
     const email = body.email;
     const file = await req.file;

    // console.log("email", body.email);
    // console.log("file = ",  file  );
    // console.log("body = ",body);


    body.profilePicture =  file.path; 
    body.age = getAge(body.age);
      body.id = uuidv4();
      // console.log(body);
    
      const q = "INSERT INTO users(full_name, age, email, password, bio, profile_image_url, id)  VALUES (?)";

    bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(body.password, salt, async function(err, hash) {
        body.password = await hash;
        let arrayValue = Object.values(body)
        console.log("arrayValue", arrayValue);
     
        
    try {
      const [results, fields] = await mysqlPool.query(
       q,
       [arrayValue] 
    );
 
      
        // console.log("result = ", results);
            //  const token = createToken(body);
        // console.log("token = ", token);
        // console.log("Login successful");
        // res.cookie("auth_token", token, {httpOnly: true});
          // req.user = results; 
       
    }catch (err) {
      console.log(err);
    }
       
      }); 
    });
    console.log("body after hash", body);

    const generatedOtp = crypto.randomInt(100000, 999999);
    async function main() {

    let transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
     user: process.env.EMAIL,
     pass: process.env.EMAIL_PASSWORD, 
    },
  });
  console.log("transporter", transporter);

  const templetePath = path.join(__dirname,  "../views/email/verify.ejs");
  const htmlData = await ejs.renderFile(templetePath, { otp: generatedOtp });
  console.log("htmlData =  c", htmlData);

  let info = await transporter.sendMail({
   
    from: `"Localhost Test" <${process.env.EMAIL}>`,
    to: email,
    subject:"Email Verify 🚀",
    text: "Welcome to our platform!",
    html: htmlData,

  //   html: `
  //   <div style="text-align: center; max-width: 400px; margin: auto; border: 2px solid #eee; padding: 20px;">
  //     <h3>Verification Code</h3>
  //     <p>Use the code below to complete your login. It expires in 5 minutes.</p>
  //     <h1 style="letter-spacing: 5px; color: #333; background: #f4f4f4; padding: 10px;">${generatedOtp}</h1>
  //   </div>
  // `

  });

  console.log("Message sent: %s", info.messageId);
  // Preview URL (Click this in your console to see the email!)
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }

main().catch(console.error);

const info = {};
info.email = email;
info.otp = generatedOtp;
console.log(info); 
const newOTP = new OTP(info);
    console.log(newOTP);
    await newOTP.save();

     
    // res.send("Signup data received");
    // req.email=email;

    // res.redirect(`/auth/otp?email=${encodeURIComponent(email)}`);
    res.redirect(`/user/auth/otp?email=${encodeURIComponent(email)}`);
} 



async function userLoginHandler(req, res, next){
    const body =  req.body;
    console.log("login body = ", body);
    console.log("email",body.email);
    let user;
  try {
    const [results] = await mysqlPool.query(
    'SELECT * FROM `users` WHERE `email` = ?',
    [ body.email]
    );
    user = results;
      
    console.log("results =", results);
  } catch (err) {
    console.log(err);
  }

  console.log(user);  
   

    //  const user = await User.findOne({email: body.email});
    //  console.log(user);

     if(user == [] || (!user) ){
      console.log("Email invalid");
      return res.render("login", {error: "Invalid email or password"});
     }

    //  console.log(user[0].password); 
    //  console.log(body.password)
    bcrypt.compare(body.password, user[0].password, async function(err, result) {
      console.log("password comperision = ", result);
      if(result){
        const token = createToken(user[0]);
        console.log("Login successful");
        res.cookie("auth_token", token, {httpOnly: true});
        req.user = user[0];
        
        res.redirect("/home");
         
      }
      else{
        req.error = "Invalid email or password";
        
        console.log("Password invalid");
        return res.render("login", {error: "Invalid email or password"});
      }

      
      // return next();
       
  });
}


module.exports = {
    userSignUpHandler,
    userLoginHandler,
}

