const express = require("express");
const cloudinary = require("cloudinary").v2;
const router = express.Router({ mergeParams: true });
const upload = require("../config/upload");
const marked = require("marked");
const removeMd = require("remove-markdown");
const Blog = require("../models/mongodb/blog");
const { isAutherized } = require("../middleware/auth");
const { isAuthenticated } = require("../middleware/auth");
const Comment = require("../models/mongodb/comment");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { mysqlPool } = require("../config/db");
var striptags = require("striptags");
const { formatDistance } = require("date-fns");
const { createBlogHandler } = require("../controllers/blog");
const blog = require("../models/mongodb/blog");
const { createToken } = require("../service/authentication");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const bcrypt = require("bcrypt");

router.get("/suggested", isAuthenticated, isAutherized, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = 2;
        let [suggestedUsers] = await mysqlPool.query(
            `SELECT id, full_name, profile_image_url, role FROM users  WHERE id != ? LIMIT ${limit}`,
            [userId],
        );

        suggestedUsers = await Promise.all(
            suggestedUsers.map(async (author) => {
                const [isFollowing] = await mysqlPool.query(
                    "SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ? ",
                    [userId, author.id],
                );
                if (isFollowing[0]) {
                    author.isFollowing = true;
                } else {
                    author.isFollowing = false;
                }
                return author;
            }),
        );

        res.render("suggested_authors", { authors: suggestedUsers });
    } catch (error) {
        console.error("Error fetching authors:", error);
        res.status(500).send("Server Error");
    }
});

router.get("/edit", isAutherized, async (req, res, next) => {
    const userId = req.user.id;

    const [userRows] = await mysqlPool.query(
        "SELECT full_name, bio, profile_image_url, email  FROM users WHERE id = ?",
        [userId],
    );

    const userInfo = userRows[0];
    userInfo.userId = userId;

    console.log("from user profile", userRows[0]);

    res.render("user/profile-edit", { userInfo });
});

router.get("/:id", isAuthenticated, async (req, res) => {
    const userId = req.params.id; // This is the MySQL ID

    try {
        // 1. Get User Details from MySQL
        const [userRows] = await mysqlPool.query(
            "SELECT id, full_name, email, profile_image_url, bio, created_at FROM users WHERE id = ?",
            [userId],
        );

        const [followerRows] = await mysqlPool.query(
            "SELECT COUNT(*) AS followerCount FROM user_follows WHERE following_id = ?",
            [userId],
        );
        const [followingRows] = await mysqlPool.query(
            "SELECT COUNT(*) AS followingCount FROM user_follows WHERE follower_id = ?",
            [userId],
        );

        let checkUserExists = false;
        if (req.user && req.user.id) {
            const checkUser = await mysqlPool.query(
                "SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?",
                [req.user.id, userId],
            );
            checkUserExists = checkUser[0].length > 0;
        }

        const followerCount = followerRows[0].followerCount;
        const followingCount = followingRows[0].followingCount;
        const profileUser = userRows[0];
        const targetdate = profileUser.created_at;
        const new_date = formatDistance(targetdate, new Date(), {
            addSuffix: true,
        });

        profileUser.created_at = new_date;
        if (!profileUser) return res.status(404).send("User not found");

        // 2. Get all Blogs by this user from MongoDB
        let userBlogs = await Blog.find({ createdBy: userId }).sort({
            createdAt: -1,
        });

        userBlogs = userBlogs.map((blog) => {
            let blogData = blog.toObject ? blog.toObject() : blog;
            // blogData.content = removeMd(blogData.content).substring(0, 100)  ;

            const targetdate = blogData.createdAt;
            // console.log("targetdate", targetdate);
            const new_date = formatDistance(
                targetdate,
                new Date(),
                { addPreffix: false },
                { addSuffix: false },
                { locale: "en" },
                { includeSeconds: true },
            );
            blogData.createdAt = new_date;
            return blogData;
        });

        profileUser.followerCount = followerCount;
        profileUser.followingCount = followingCount;
        profileUser.isFollowing = checkUserExists;

        // 3. Render the profile page
        res.render("user/profile", {
            profileUser,
            userBlogs,
            isOwnProfile: req.user && req.user.id == userId,
            striptags, // Check if viewing own profile
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post(
    "/edit",
    isAutherized,
    upload.single("avatar"),
    async (req, res, next) => {
        const { full_name, bio, password, email } = req.body;
        const file = req.file;
        const userId = req.user.id;

        const [oldImage] = await mysqlPool.query(
            // 'SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?
            "SELECT profile_image_url FROM users WHERE id = ?",
            [userId],
        );

        const imagePath = oldImage[0].profile_image_url;
        let finalAvatar = imagePath;

        try {
            const [userData] = await mysqlPool.query(
                "SELECT * FROM users WHERE email = ?",
                [email],
            );
            const userPassword = userData[0].password;

            bcrypt.compare(
                password,
                userPassword,
                async function (err, result) {
                    console.log("password comperision = ", result);
                    if (result) {
                        if (file) {
                            finalAvatar = file.path;
                            const urlParts = imagePath.split("/");
                            const filenameWithExt = urlParts.pop(); // "abc123.jpg"
                            const folderName = urlParts.pop(); // "blogify_avatars"
                            const publicId = `${folderName}/${filenameWithExt.split(".")[0]}`; // "blogify_avatars/abc123"
                            await cloudinary.uploader.destroy(publicId);
                            console.log(`Deleted old avatar: ${publicId}`);
                        }
                        await mysqlPool.query(
                            "UPDATE users SET full_name = ?, profile_image_url = ?, bio = ?  WHERE id = ?",
                            [full_name, finalAvatar, bio, userId],
                        );
                        const token = createToken(userData[0]);
                        console.log("Login successful");
                        res.cookie("auth_token", token, { httpOnly: true });
                        req.user = userData[0];
                        res.redirect(`/profile/${userId}`);
                    } else {
                        return res.render("user/profile-edit", {
                            userInfo: userData[0], // The original database user
                            error: "Incorrect current password. Please try again.", // The error
                            formData: req.body, // <--- We send their typed data right back to the frontend!
                        });
                    }
                },
            );
        } catch (error) {
            console.log(error);
        }
    },
);

router.post("/follow/:id", isAutherized, isAuthenticated, async (req, res) => {
    const author = req.params.id;
    const userId = req.user.id;

    try {
        const [isFollowing] = await mysqlPool.query(
            "SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ? ",
            [userId, author],
        );

        if (isFollowing[0]) {
            await mysqlPool.query(
                "DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?",
                [userId, author],
            );
            return res.json({ status: "unsaved" });
        }

        await mysqlPool.query(
            "INSERT INTO user_follows (follower_id, following_id)  VALUE (?, ?)",
            // "INSERT INTO user_bookmarks (user_id, blog_id) VALUES (?, ?)",
            [userId, author],
        );

        return res.json({ status: "saved" });
    } catch (error) {
        console.log(error);
    }
});

router.post("/:id/follow", isAutherized, isAuthenticated, async (req, res) => {
    console.log("follow route hit");
    const following_user_id = req.params.id;
    const follower_user_id = req.user.id;

    if (following_user_id == follower_user_id) {
        return res.status(400).send("You cannot follow yourself");
    }

    const checkUser = await mysqlPool.query(
        "SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?",
        [follower_user_id, following_user_id],
    );
    if (checkUser[0].length > 0) {
        try {
            mysqlPool.query(
                "DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?",
                [follower_user_id, following_user_id],
            );
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    } else {
        try {
            mysqlPool.query(
                "INSERT INTO user_follows  (follower_id, following_id) VALUES (?, ?)",
                [follower_user_id, following_user_id],
            );
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
    res.redirect("/profile/" + following_user_id);
});

router.get(
    "/api/more-user",
    isAuthenticated,
    isAutherized,

    async (req, res) => {
        userId = req.user.id;
        const pageNo = parseInt(req.query.page) || 1;
        const limit = 2;
        const skipAmount = (pageNo - 1) * limit;

        try {
            let [moreUser] = await mysqlPool.query(
                `SELECT * FROM users WHERE id != ? LIMIT ? OFFSET ?`,
                [userId, limit, skipAmount],
            );

            moreUser = await Promise.all(
                moreUser.map(async (author) => {
                    const [isFollowing] = await mysqlPool.query(
                        "SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ? ",
                        [userId, author.id],
                    );
                    if (isFollowing[0]) {
                        author.isFollowing = true;
                    } else {
                        author.isFollowing = false;
                    }
                    return author;
                }),
            );

            return res.json({ moreUser: moreUser });
        } catch (error) {
            console.log(error);
        }
        return res.json({ status: "working" });
    },
);

module.exports = router;
