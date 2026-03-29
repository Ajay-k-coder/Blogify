 
const express = require("express");

const router = express.Router({mergeParams:true});
 
const Blog = require("../models/mongodb/blog");
const {isAutherized}  = require("../middleware/auth")
const Comment = require("../models/mongodb/comment");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const {mysqlPool} = require("../config/db");
 
const {createBlogHandler} = require("../controllers/blog");
const blog = require("../models/mongodb/blog");




router.get('/:id', async (req, res) => {
    const userId = req.params.id; // This is the MySQL ID
    console.log("userId", userId);

    try {
        // 1. Get User Details from MySQL
        const [userRows] = await mysqlPool.query(
            'SELECT full_name, email, profile_image_url, bio, created_at FROM users WHERE id = ?',
            [userId]
        );
        const profileUser = userRows[0];

        if (!profileUser) return res.status(404).send("User not found");

        // 2. Get all Blogs by this user from MongoDB
        const userBlogs = await Blog.find({ createdBy: userId }).sort({ createdAt: -1 });

        // 3. Render the profile page
        res.render('user/profile', { 
            profileUser, 
            userBlogs,
            isOwnProfile: req.user && req.user.id == userId // Check if viewing own profile
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


module.exports = router;  