const User = require("../models/user");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {createToken} = require("../service/authentication");
 

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
 
    const body = await req.body;
    const file = await req.file;
    console.log(file);
    console.log(body);
    
    body.profilePicture = "/" + file.path;
    body.age = getAge(body.age);

    bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(body.password, salt, async function(err, hash) {
        body.password = await hash;
        const newUser = new User(body);
        console.log("new User", newUser);
        const result = await newUser.save();
        console.log(result);
        const token = createToken(newUser);
        console.log(token);
        console.log("Login successful");
        res.cookie("auth_token", token, {httpOnly: true});
        req.user = newUser;
        res.redirect("/");
      });
    });

         
     
    // res.send("Signup data received");

    
} 


async function userLoginHandler(req, res, next){
    const body = await req.body;
     const user = await User.findOne({email: body.email});
     console.log(user);

     if(!user){
      console.log("Email invalid");
      return res.render("login", {error: "Invalid email or password"});
     }

    bcrypt.compare(body.password, user.password, async function(err, result) {

      if(result){
        const token = createToken(user);
        console.log("Login successful");
        res.cookie("auth_token", token, {httpOnly: true});
        req.user = user;
        
        res.redirect("/");
         
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

