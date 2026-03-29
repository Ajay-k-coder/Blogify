const express = require("express");

const router = express.Router({mergeParams:true});
const multer  = require('multer')
const Blog = require("../models/mongodb/blog");
const {isAutherized}  = require("../middleware/auth")
const Comment = require("../models/mongodb/comment");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const {mysqlPool} = require("../config/db");
 
const {createBlogHandler} = require("../controllers/blog");
const blog = require("../models/mongodb/blog");


 

 
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

router.get("/new", isAutherized, (req, res, next)=>{
    res.render("../views/blog/new", {user: req.user});
});


router.get("/:id", async(req,res,next)=>{
   const id = req.params.id
   console.log("id", id);
  const blog = await Blog.findOne({_id:id});

  console.log("blog", blog);
  console.log("create by id ", blog.createdBy);
  
  const [author] = await mysqlPool.query(
    "SELECT * FROM users WHERE id = ? ",
    [blog.createdBy]

  )
  console.log("user from ", author); 
  // const comments =  await Comment.find({commitedIn:id}).populate("commitedBy");
  // const [comments] = await mysqlPool.query(`
  //       SELECT c.*, u.full_name, u.profile_image_url 
  //       FROM comments c
  //       JOIN users u ON c.user_id = u.id
  //       WHERE c.blog_id = ? 
  //       ORDER BY c.created_at DESC`, 
  //       [req.params.id]
  //   );
  
  // Change your query to include comments.user_id
const [comments] = await mysqlPool.query(`
    SELECT 
        comments.id AS commentId, -- We need this ID to know WHICH comment to delete
        comments.content, 
        comments.user_id,         -- We need this to check ownership
        comments.created_at, 
        users.full_name, 
        users.profile_image_url 
    FROM comments
    INNER JOIN users ON comments.user_id = users.id
    WHERE comments.blog_id = ?
    ORDER BY comments.created_at DESC
`, [id]);
  
  console.log(comments);   
  res.render("../views/blog/blog",{author, user:req.user, comments, blog})
}); 

 
router.post("/:id/comment", async(req, res, next)=>{
  // const id = req.params.id;
  // const body = req.body;
  // console.log("user", req.user)
  // body.commitedBy = req.user.id;
  // body.commitedIn = req.params.id;
  // const result = Comment(body);  
  // await result.save()
  // res.redirect(`/blog/${id}`);
    const { content } = req.body;
    console.log("content", content);
    const blogId = req.params.id;
    console.log(blogId);
     // This is the MongoDB ID from the URL
    const userId = req.user.id;
    const id =   uuidv4();  // This is the MySQL ID from your session

    try {
        await mysqlPool.query(
            'INSERT INTO comments (id, content, blog_id, user_id) VALUES (?, ?, ?, ?)',
            [id, content, blogId, userId]
        );
        
        res.redirect(`/blog/${blogId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error posting comment");
    }
});
  


 
router.delete('/:id/comment/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { blogId } = req.body;
    const currentUserId = req.user.id; // From your auth middleware

    try {
        // We add "AND user_id = ?" to the query for SECURITY. 
        // This prevents someone from deleting others' comments using Postman/Tools.
        const [result] = await mysqlPool.query(
            'DELETE FROM comments WHERE id = ? AND user_id = ?',
            [commentId, currentUserId]
        );

        if (result.affectedRows === 0) {
            console.log("❌ Attempted to delete a comment that isn't yours or doesn't exist.");
        }

        res.redirect(`/blog/${blogId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting comment");
    }
});


module.exports = router;     