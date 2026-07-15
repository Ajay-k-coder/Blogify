const express = require("express");
const marked = require("marked");
const removeMd = require("remove-markdown");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const Blog = require("../models/mongodb/blog");
const { isAuthenticated, isAutherized } = require("../middleware/auth");
const Comment = require("../models/mongodb/comment");
const path = require("path");
var striptags = require("striptags");
const { v4: uuidv4 } = require("uuid");
const { mysqlPool } = require("../config/db");
const { formatDistance } = require("date-fns");
const { createBlogHandler, editBlogHandler } = require("../controllers/blog");
const blog = require("../models/mongodb/blog");
const upload = require("../config/postImageUpload");

router.post("/", upload.single("image"), createBlogHandler);

router.get("/new", isAutherized, (req, res, next) => {
    res.render("../views/blog/new", { user: req.user });
});

router.get("/:id", async (req, res, next) => {
    const id = req.params.id;
    const blog = await Blog.findOne({ _id: id });
    const targetdate = blog.createdAt;
    const new_date = formatDistance(
        targetdate,
        new Date(),
        { addSuffix: true },
        { locale: "en" },
        { includeSeconds: true },
    );

    blog.content = marked.parse(blog.content);
    const [author] = await mysqlPool.query(
        "SELECT * FROM users WHERE id = ? ",
        [blog.createdBy],
    );

    let bookmarkStatus = false;
    if (req.user) {
        const [bookmark] = await mysqlPool.query(
            "SELECT * FROM user_bookmarks WHERE user_id = ? AND blog_id = ?",
            [req.user ? req.user.id : null, id],
        );
        bookmarkStatus = bookmark.length > 0;
    }

    let isLiked = false;
    if (req.user) {
        const [like] = await mysqlPool.query(
            "SELECT * FROM  likes WHERE user_id = ? AND blog_id = ?",
            [req.user ? req.user.id : null, id],
        );
        isLiked = like.length > 0;
    }

    let likeCount = 0;

    const [likingRows] = await mysqlPool.query(
        "SELECT COUNT(*) AS  likeCount FROM likes WHERE blog_id = ?",
        [id],
    );

    likeCount = likingRows[0].likeCount;
    const [comments] = await mysqlPool.query(
        `
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
`,
        [id],
    );

    const targetDate = comments.created_at;

    comments.forEach((comment) => {
        comment.created_at = formatDistance(
            new Date(comment.created_at),
            new Date(),
            { addSuffix: true },
            { locale: "en" },
            { includeSeconds: true },
        );
    });

    res.render("../views/blog/blog", {
        author,
        user: req.user,
        comments,
        blog,
        new_date,
        bookmarkStatus,
        isLiked,
        likeCount,
    });
});

router.get("/api/bookmark", isAutherized, async (req, res, next) => {
    try {
        const [bookmarks] = await mysqlPool.query(
            "SELECT blog_id FROM user_bookmarks WHERE user_id = ?",
            [userId],
        );
        const saveblogId = bookmarks.map((bookmark) => bookmark.blog_id);
        let saveBlogs = [];

        if (saveblogId.length > 0) {
            saveBlogs = await Blog.find({ _id: { $in: saveblogId } });
            saveBlogs = saveBlogs.map((blog) => {
                let blogData = blog.toObject ? blog.toObject() : blog;
                blogData.content = striptags(blogData.content).substring(0, 80);
                const targetdate = blogData.createdAt;
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
        }
        res.json({ saveBlogs: saveBlogs });
    } catch (error) {
        console.log(error);
        res.status(500).send("server Error");
    }
});

router.get("/api/like", isAutherized, async (req, res, next) => {
    const userId = req.user.id;
    try {
        const [likes] = await mysqlPool.query(
            "SELECT blog_id FROM likes WHERE user_id = ?",
            [userId],
        );
        const likeblogId = likes.map((like) => like.blog_id);
        let likeBlogs = [];

        if (likeblogId.length > 0) {
            likeBlogs = await Blog.find({ _id: { $in: likeblogId } });
        }

        likeBlogs = likeBlogs.map((blog) => {
            let blogData = blog.toObject ? blog.toObject() : blog;
            blogData.content = striptags(blogData.content).substring(0, 80);
            const targetdate = blogData.createdAt;

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

        res.json({ likeblogs: likeBlogs });
    } catch (error) {
        console.log(error);
        res.status(500).send("server Error");
    }
});

router.post("/edit/:id", isAutherized, upload.single("image"), editBlogHandler);

router.post("/bookmark/:id", isAutherized, async (req, res, next) => {
    const blog_id = req.params.id;
    const user_id = req.user.id;
    const [existingBookmark] = await mysqlPool.query(
        "SELECT * FROM user_bookmarks WHERE user_id = ? AND blog_id = ?",
        [user_id, blog_id],
    );

    if (existingBookmark[0]) {
        await mysqlPool.query(
            "DELETE FROM user_bookmarks WHERE user_id = ? AND blog_id = ?",
            [user_id, blog_id],
        );
        return res.json({ status: "unsaved" });
    }

    await mysqlPool.query(
        "INSERT INTO user_bookmarks (user_id, blog_id) VALUES (?, ?)",
        [user_id, blog_id],
    );
    return res.json({ status: "saved" });
});

router.post("/like/:id", isAutherized, async (req, res, next) => {
    const blog_id = req.params.id;
    const user_id = req.user.id;

    const [isLike] = await mysqlPool.query(
        "SELECT * FROM  likes WHERE user_id = ? AND blog_id = ?",
        [user_id, blog_id],
    );

    if (isLike[0]) {
        await mysqlPool.query(
            "DELETE FROM likes WHERE user_id = ? AND blog_id = ?",
            [user_id, blog_id],
        );
        return res.json({ status: "unsaved" });
    }

    await mysqlPool.query(
        // "INSERT INTO user_bookmarks (user_id, blog_id) VALUES (?, ?)",
        "INSERT INTO likes (user_id, blog_id) VALUES (?, ?)",
        [user_id, blog_id],
    );
    return res.json({ status: "saved" });
});

router.get("/preview/:id", isAutherized, async (req, res, next) => {
    const id = req.params.id;
    const blog = await Blog.findOne({ _id: id });
    blog.content = marked.parse(blog.content);
    res.render("../views/blog/preview.ejs", { blog });
});

router.get("/edit/:id", isAutherized, async (req, res, next) => {
    const id = req.params.id;
    const blog = await Blog.findOne({ _id: id });
    res.render("../views/blog/edit.ejs", { blog, user: req.user });
});

router.post("/public/:id", async (req, res, next) => {
    const id = req.params.id;
    const blog = await Blog.findById({ _id: id });
    blog.status = "published";
    await blog.save();
    res.redirect("/");
});

router.post("/:id/comment", async (req, res, next) => {
    const { content } = req.body;
    const blogId = req.params.id;
    const userId = req.user.id;
    const id = uuidv4(); // This is the MySQL ID from your session

    try {
        await mysqlPool.query(
            "INSERT INTO comments (id, content, blog_id, user_id) VALUES (?, ?, ?, ?)",
            [id, content, blogId, userId],
        );

        res.redirect(`/blog/${blogId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error posting comment");
    }
});

router.delete("/:id/comment/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { blogId } = req.body;
    const currentUserId = req.user.id; // From your auth middleware

    try {
        // We add "AND user_id = ?" to the query for SECURITY.
        // This prevents someone from deleting others' comments using Postman/Tools.
        const [result] = await mysqlPool.query(
            "DELETE FROM comments WHERE id = ? AND user_id = ?",
            [commentId, currentUserId],
        );

        if (result.affectedRows === 0) {
            console.log(
                "❌ Attempted to delete a comment that isn't yours or doesn't exist.",
            );
        }

        res.redirect(`/blog/${blogId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting comment");
    }
});

module.exports = router;
