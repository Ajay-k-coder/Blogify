const express = require("express");

const router = express.Router({mergeParams:true});
const multer  = require('multer')
const Blog = require("../models/blog");
const {isAutherized}  = require("../middleware/auth")
const Comment = require("../models/comment");
const path = require("path");
 
const {createBlogHandler} = require("../controllers/blog");
const blog = require("../models/blog");
 

 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('uploads'));
  },
  filename: function (req, file, cb) {
    const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    console.log("Unique prefix generated:", uniquePreffix);
    cb(null, uniquePreffix+ '-' + file.originalname); 
  }
});

// server.use("uploads", express.static(path.join(__dirname,"./uploads")));
// server.use("/uploads", express.static("./uploads"));
// server.use(express.static('public'));
const upload = multer({ storage: storage });
router.post("/",  upload.single('image'), createBlogHandler);

router.get("/", isAutherized, (req, res, next)=>{
    res.render("../views/blog/new", {user: req.user});
});


router.get("/:id", async(req,res,next)=>{
   const id = req.params.id
  const blog = await Blog.findOne({_id:id});
  const comments =  await Comment.find({commitedIn:id}).populate("commitedBy");
  console.log(comments);
  res.render("../views/blog/blog",{user: req.user, blog, comments})
});

router.post("/:id/comment", async(req, res, next)=>{
  const id = req.params.id;
  const body = req.body;
  console.log("user", req.user)
  body.commitedBy = req.user._id;
  body.commitedIn = req.params.id;
  const result = Comment(body);
  await result.save()
  res.redirect(`/blog/${id}`);
});


module.exports = router;    