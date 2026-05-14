const express = require("express");
 
const server = express();
const router = express.Router({mergeParams:true});
const multer  = require('multer')
const OTP = require("../models/mongodb/forOTP");
const {mysqlPool} = require("../config/db");
const {createToken} = require("../service/authentication");

server.use(express.json());     
server.use(express.urlencoded({extended:true}));
// server.use(require("connect-flash"));
// server.use(require("express-session")({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }));

const {userSignUpHandler,
    userLoginHandler
} = require("../controllers/user");
 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/usersImages");
  },
  filename: function (req, file, cb) {
    const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    console.log("Unique prefix generated:", uniquePreffix);
    cb(null, uniquePreffix+ '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get("/signup", (req, res, next)=>{
    res.render("../views/signup", {user: req.user});
    next();
});

router.get("/auth/otp", (req, res, next)=>{
  const  email = req.query.email;
  res.render("../views/email/verifyOTP", {email }); 

})


router.post("/auth/otp", async(req, res)=>{
   try {
  const result = req.body.otp;
  const email = req.body.email;
  console.log("email", email)
  const filter = Object.values(result);
  const otp = Number(filter.join(""));
  console.log("otp", otp);
  
   
   
     

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = await OTP.findOne({ email });
    console.log(record);
    console.log(record.otp);
    console.log("otp = ",typeof(otp));
    console.log("record.otp", typeof(record.otp));


    if (!record) {
      return res.status(404).json({ message: "Email not found" });
    }

    if (record.otp !== otp) {
      
       req.flash("error", "wrong otp try again");
       return res.redirect(`/user/auth/otp?email=${encodeURIComponent(email)}`);

    }

    // If OTP matches, you can proceed (e.g., mark verified, issue token, etc.)
    // return res.status(200).json({ message: "OTP verified successfully" });
    req.flash("success", "OTP verified successfully");
      const q = "SELECT * FROM users WHERE email = ? ";

     try {
      const [results, fields] = await mysqlPool.query(
        'SELECT * FROM `users` WHERE `email` = ?',
      [email]
    );
 
      
        console.log("result = ", results);
       const token = createToken(results[0]);
        console.log("token = ", token);
        console.log("Login successful");
        res.cookie("auth_token", token, {httpOnly: true});
        // req.user = results; 
       
    }catch (err) { 
      console.log(err);
    }
       

    
    res.redirect("/");

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }


}) 

router.post("/signup", upload.single("profilePicture") ,userSignUpHandler);
router.post("/login", userLoginHandler); 
 
router.get("/login",(req, res, next)=>{
    res.render("../views/login",{user: req.user})
    next(); 
})


router.get("/logout",(req, res, next)=>{ 
    res.clearCookie("auth_token");
    res.redirect("/");
    next();
});


module.exports = router;