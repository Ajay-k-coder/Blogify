const express = require("express");
 
const server = express();
const router = express.Router({mergeParams:true});
const multer  = require('multer')
 


server.use(express.json());    
server.use(express.urlencoded({extended:true}));

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