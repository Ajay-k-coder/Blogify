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
// const upload = require("../config/upload");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join('uploads'));
//   },
//   filename: function (req, file, cb) {
//     const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     console.log("Unique prefix generated:", uniquePreffix);
//     cb(null, uniquePreffix+ '-' + file.originalname);
//   }
// });

// server.use("uploads", express.static(path.join(__dirname,"./uploads")));
// server.use("/uploads", express.static("./uploads"));
// server.use(express.static('public'));

// const upload = multer({ storage: storage });

router.post("/", upload.single("image"), createBlogHandler);

router.get("/new", isAutherized, (req, res, next) => {
  res.render("../views/blog/new", { user: req.user });
});

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  //    console.log("id", id);

  const blog = await Blog.findOne({ _id: id });
  // console.log("blog", blog);

  const targetdate = blog.createdAt;
  // console.log("targetdate", targetdate);
  const new_date = formatDistance(
    targetdate,
    new Date(),
    { addSuffix: true },
    { locale: "en" },
    { includeSeconds: true },
  );

  // blog.createdAt = new_date;
  // console.log("blog with updated date", blog);

  // console.log("new_date", new_date);

  blog.content = marked.parse(blog.content);

  //   console.log("create by id ", blog.createdBy);

  const [author] = await mysqlPool.query("SELECT * FROM users WHERE id = ? ", [
    blog.createdBy,
  ]);

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

  console.log("likingRows", likingRows);

  likeCount = likingRows[0].likeCount;

  console.log("isLIke", isLiked);

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
  // const newDate = formatDistance(targetDate, new Date(), { addSuffix: true}, {locale: "en"}, {includeSeconds: true});

  comments.forEach((comment) => {
    comment.created_at = formatDistance(
      new Date(comment.created_at),
      new Date(),
      { addSuffix: true },
      { locale: "en" },
      { includeSeconds: true },
    );
  });

  console.log("commnets", comments);

  //   console.log(comments);
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
  const userId = req.user.id;
  //   console.log("userId", userId);

  try {
    const [bookmarks] = await mysqlPool.query(
      "SELECT blog_id FROM user_bookmarks WHERE user_id = ?",
      [userId],
    );
    // console.log("bookmkars", bookmarks);

    const saveblogId = bookmarks.map((bookmark) => bookmark.blog_id);
    // console.log("saveblogID", saveblogId);

    let saveBlogs = [];

    if (saveblogId.length > 0) {
      saveBlogs = await Blog.find({ _id: { $in: saveblogId } });

      // saveBlogs.forEach(blog =>{
      //     blog.content  = removeMd(marked.parse(blog.content).substring(0, 100));
      // })
      saveBlogs = saveBlogs.map((blog) => {
        let blogData = blog.toObject ? blog.toObject() : blog;
        console.log("blog.content ", typeof blogData.content);
        blogData.content = striptags(blogData.content).substring(0, 80);

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
        // console.log("blogData", blogData.createdAt);
        return blogData;
      });
    }

    // console.log("saveBlogs", shortSaveBlogs);

    res.json({ saveBlogs: saveBlogs });
  } catch (error) {
    console.log(error);
    res.status(500).send("server Error");
  }
});

router.get("/api/like", isAutherized, async (req, res, next) => {
  const userId = req.user.id;
  console.log("userId", userId);

  try {
    const [likes] = await mysqlPool.query(
      "SELECT blog_id FROM likes WHERE user_id = ?",
      [userId],
    );

    const likeblogId = likes.map((like) => like.blog_id);
    console.log("saveblogID", likeblogId);

    let likeBlogs = [];

    if (likeblogId.length > 0) {
      likeBlogs = await Blog.find({ _id: { $in: likeblogId } });
      console.log("likeblogs", likeBlogs);
    }

    // likeBlogs.forEach((blog) => {
    //   blog.content = removeMd(marked.parse(blog.content).substring(0, 100));
    // });

    likeBlogs = likeBlogs.map((blog) => {
      let blogData = blog.toObject ? blog.toObject() : blog;
      console.log("blog.content ", typeof blogData.content);
      blogData.content = striptags(blogData.content).substring(0, 80);

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
      // console.log("blogData", blogData.createdAt);
      return blogData;
    });

    console.log("likeBogs after forEach", likeBlogs);
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
  console.log("Existing bookmark query result:", existingBookmark);

  if (existingBookmark[0]) {
    await mysqlPool.query(
      "DELETE FROM user_bookmarks WHERE user_id = ? AND blog_id = ?",
      [user_id, blog_id],
    );
    console.log("Bookmark removed for user", user_id, "and blog", blog_id);
    return res.json({ status: "unsaved" });
  }

  await mysqlPool.query(
    "INSERT INTO user_bookmarks (user_id, blog_id) VALUES (?, ?)",
    [user_id, blog_id],
  );
  console.log("Bookmark added for user", user_id, "and blog", blog_id);
  return res.json({ status: "saved" });

  // console.log(blog_id);

  // res.json({status:"saved"});
});

router.post("/like/:id", isAutherized, async (req, res, next) => {
  const blog_id = req.params.id;
  console.log("like post id", blog_id);
  const user_id = req.user.id;
  console.log("user_id", user_id);

  const [isLike] = await mysqlPool.query(
    "SELECT * FROM  likes WHERE user_id = ? AND blog_id = ?",
    [user_id, blog_id],
  );
  console.log("isLIke", isLike);
  if (isLike[0]) {
    await mysqlPool.query(
      "DELETE FROM likes WHERE user_id = ? AND blog_id = ?",
      [user_id, blog_id],
    );
    console.log("like removed for user", user_id, "and blog", blog_id);
    return res.json({ status: "unsaved" });
  }

  await mysqlPool.query(
    // "INSERT INTO user_bookmarks (user_id, blog_id) VALUES (?, ?)",
    "INSERT INTO likes (user_id, blog_id) VALUES (?, ?)",
    [user_id, blog_id],
  );

  console.log("like added for user", user_id, "and blog", blog_id);
  return res.json({ status: "saved" });
});

router.get("/preview/:id", isAutherized, async (req, res, next) => {
  const id = req.params.id;
  // console.log("id", id);
  const blog = await Blog.findOne({ _id: id });
  blog.content = marked.parse(blog.content);
  //    blog.content = marked.parser(blog.content);
  res.render("../views/blog/preview.ejs", { blog });
});

router.get("/edit/:id", isAutherized, async (req, res, next) => {
  const id = req.params.id;
  // console.log("id", id);
  const blog = await Blog.findOne({ _id: id });
  //    console.log("blog", blog);
  res.render("../views/blog/edit.ejs", { blog, user: req.user });
});

router.post("/public/:id", async (req, res, next) => {
  const id = req.params.id;
  const blog = await Blog.findById({ _id: id });
  blog.status = "published";
  await blog.save();
  console.log("blog by public route:=", blog);
  console.log("by public route", id);
  res.redirect("/");
});

router.post("/:id/comment", async (req, res, next) => {
  // const id = req.params.id;
  // const body = req.body;
  // console.log("user", req.user)
  // body.commitedBy = req.user.id;
  // body.commitedIn = req.params.id;
  // const result = Comment(body);
  // await result.save()
  // res.redirect(`/blog/${id}`);
  const { content } = req.body;
  // console.log("content", content);
  const blogId = req.params.id;
  // console.log(blogId);
  // This is the MongoDB ID from the URL
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
