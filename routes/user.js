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
        // Query MySQL for users.
        // Pro-Tip: You could order by a 'followers_count' column if you have one,
        // or just order by when they joined (created_at).
        const limit = 2;
        let [suggestedUsers] = await mysqlPool.query(
            `SELECT id, full_name, profile_image_url, role FROM users  WHERE id != ? LIMIT ${limit}`,
            [userId],
        );

        suggestedUsers = await Promise.all(
            suggestedUsers.map(async (author) => {
                // console.log("author ", author);
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

        // console.log(" suggestedUsers ", suggestedUsers);

        res.render("suggested_authors", { authors: suggestedUsers });
    } catch (error) {
        console.error("Error fetching authors:", error);
        res.status(500).send("Server Error");
    }
    // res.render("suggested_authors");
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
    // console.log("userId", userId);

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
        // console.log("req.user.id", req.user.id);
        if (req.user && req.user.id) {
            const checkUser = await mysqlPool.query(
                "SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?",
                [req.user.id, userId],
            );
            // console.log("checkUser", checkUser);
            checkUserExists = checkUser[0].length > 0;
            // console.log("checkUserExists", checkUserExists);
        }

        // console.log("checkUserExists", checkUserExists);

        const followerCount = followerRows[0].followerCount;
        const followingCount = followingRows[0].followingCount;
        // console.log("followerCount", followerCount);
        // console.log("followingCount", followingCount);

        const profileUser = userRows[0];
        const targetdate = profileUser.created_at;
        // console.log("targetdate", targetdate);
        const new_date = formatDistance(targetdate, new Date(), {
            addSuffix: true,
        });
        // console.log("new-date", new_date);

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
            console.log("blogData", blogData.createdAt);
            return blogData;
        });

        console.log("userBlogs = ", userBlogs);

        profileUser.followerCount = followerCount;
        profileUser.followingCount = followingCount;
        profileUser.isFollowing = checkUserExists;

        console.log("profile user  ", profileUser);

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

        console.log("full_Name", full_name);
        console.log("email", email);
        console.log("password ", password);
        console.log("bio", bio);

        const file = req.file;
        const userId = req.user.id;

        console.log("full_Name", full_name);
        console.log("file", file);
        const [oldImage] = await mysqlPool.query(
            // 'SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?
            "SELECT profile_image_url FROM users WHERE id = ?",
            [userId],
        );

        const imagePath = oldImage[0].profile_image_url;
        let finalAvatar = imagePath;
        // console.log("old image URL", imagePath);

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
                            // console.log("urlParts", urlParts);

                            const filenameWithExt = urlParts.pop(); // "abc123.jpg"
                            // console.log("filenameWithExt", filenameWithExt);
                            const folderName = urlParts.pop(); // "blogify_avatars"
                            // console.log("folderName", folderName);
                            const publicId = `${folderName}/${filenameWithExt.split(".")[0]}`; // "blogify_avatars/abc123"
                            // console.log("publicId", publicId);

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
    console.log(author);
    console.log(userId);

    try {
        const [isFollowing] = await mysqlPool.query(
            "SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ? ",
            [userId, author],
        );

        console.log("isfollowing ", isFollowing);
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
        console.log("one added for user", userId, "and author", author);

        return res.json({ status: "saved" });
    } catch (error) {
        console.log(error);
    }
});

router.post("/:id/follow", isAutherized, isAuthenticated, async (req, res) => {
    console.log("follow route hit");
    const following_user_id = req.params.id;
    const follower_user_id = req.user.id;
    console.log("following_user_id", following_user_id);
    console.log("follower_user_id", follower_user_id);

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
        console.log("pageNo ", pageNo);

        console.log(typeof pageNo); // output number
        const limit = 2;
        const skipAmount = (pageNo - 1) * limit;

        // const userId = req.user;
        // const pageNo = parseInt(req.query.page) || 1;
        // console.log("following-feed ", pageNo);
        // const limit = 10;
        // const skipAmount = (pageNo - 1) * limit;

        // const skipAmount = 2;

        console.log(typeof skipAmount); // output number

        try {
            let [moreUser] = await mysqlPool.query(
                // `SELECT id, full_name, profile_image_url, role FROM users  WHERE id != ? LIMIT ${limit}`,
                `SELECT * FROM users WHERE id != ? LIMIT ? OFFSET ?`,
                [userId, limit, skipAmount],
            );

            moreUser = await Promise.all(
                moreUser.map(async (author) => {
                    // console.log("author ", author);
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
