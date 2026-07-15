const express = require("express");
const router = express.Router({ mergeParams: true });
const { isAutherized, isAuthenticated } = require("../middleware/auth");
const Blog = require("../models/mongodb/blog");
// const removeMd = require('remove-markdown');
var striptags = require("striptags");
const { mysqlPool } = require("../config/db");
const { formatDistance } = require("date-fns");

router.get("/", isAuthenticated, async (req, res) => {
    try {
        const queryResult = req.query.tag;
        const searchQuery = req.query.search;
        // const searchQuery = "ajay";
        const userNameSearch = `%${searchQuery}%`;

        console.log("query ", queryResult);
        console.log("searchQuery", searchQuery);
        const userId = req.user;
        let query = {};
        // console.log("userId home page", userId);
        let authors;
        if (searchQuery) {
            [authors] = await mysqlPool.query(
                // "SELECT id, name, profilePic FROM users WHERE name LIKE ?",
                // "SELECT * FROM users WHERE full_name LIKE ?",
                `SELECT * FROM users 
                  WHERE full_name LIKE ? or SOUNDEX(full_name) = SOUNDEX(?)`,
                // "SELECT * FROM users WHERE SOUNDEX(full_name) = SOUNDEX(?)",
                [userNameSearch, searchQuery],
            );

            // console.log("userData ", authors);
        }

        if (searchQuery)
            authors = await Promise.all(
                authors.map(async (author) => {
                    const [followerRows] = await mysqlPool.query(
                        "SELECT COUNT(*) AS followerCount FROM user_follows WHERE following_id = ?",
                        [author.id],
                    );

                    author.followerRows = followerRows[0].followerCount;

                    const [followingRows] = await mysqlPool.query(
                        "SELECT COUNT(*) AS followingCount FROM user_follows WHERE follower_id = ?",
                        [author.id],
                    );
                    author.followingRows = followingRows[0].followingCount;
                    // console.log("author.followerRows ", author.followingRows);

                    let userBlogs = await Blog.countDocuments({
                        createdBy: author.id,
                    });
                    author.posts = userBlogs;
                    // console.log("userBlogs ", userBlogs);
                    return author;
                }),
            );

        // console.log("map authors ", authors);
        // console.log("map authors length ", authors.length);

        if (queryResult) {
            query = { tags: queryResult };
        }

        if (searchQuery) {
            query = {
                $or: [
                    { title: { $regex: searchQuery, $options: "i" } },
                    // { content: { $regex: searchQuery, $options: "i" } },
                    { tags: { $regex: searchQuery, $options: "i" } },
                ],
            };
        }

        let allBlogs = await Blog.find(query).limit(10);

        allBlogs = allBlogs.map((blog) => {
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
            // console.log("blogData", blogData.createdAt);
            return blogData;
        });

        let followingsBlogs = [];

        if (userId) {
            const [follows] = await mysqlPool.query(
                "SELECT following_id from user_follows WHERE follower_id = ?",
                [userId.id],
            );

            // console.log(follows);
            const followings = follows.map((follow) => follow.following_id);
            // console.log(followings);

            if (followings.length > 0) {
                followingsBlogs = await Blog.find({
                    createdBy: { $in: followings }, // Match authors in the list
                    // status: 'public'
                })
                    .sort({ createdAt: -1 })
                    .limit(10);
            }

            followingsBlogs = followingsBlogs.map((blog) => {
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

            // console.log("followingsBlogs ", followingsBlogs);
            // console.log("followingsBlogs .length ", followingsBlogs.length);
        }

        // console.log("allBlogs[0].tags", allBlogs[15].tags);
        // let separatTags;
        // allBlogs[15].tags.forEach((tag) => {
        //   separatTags = tag.split(",");
        // });

        // separatTags.forEach((tag) => {
        //   console.log("tag.trim() ", tag.trim());
        // });
        res.render("home", {
            allBlogs,
            followingsBlogs,
            striptags,
            authors,
            currentTag: queryResult,
            searchResult: searchQuery,
        });
    } catch (error) {
        console.error(error);
    }

    // const [followdingIds] = await mysqlPool.query(
    //   "SELECT "
    // )

    // console.log("blog", blog.cr);
    // console.log("all blogs after map", allBlogs);
    // console.log("user", req.user);
    // let user = allBlogs[0].createdBy;
    // console.log("user id", user);
});

router.get("/api/load-more", async (req, res) => {
    const pageNo = parseInt(req.query.page) || 1;
    console.log(pageNo);
    const limit = 10;

    const skipAmount = (pageNo - 1) * limit;

    const newBlog = await Blog.find().skip(skipAmount).limit(limit);
    // console.log("newBlog ", newBlog);
    return res.json({ newBlog: newBlog });
});

router.get("/api/more-following-feed", isAuthenticated, async (req, res) => {
    const userId = req.user;
    const pageNo = parseInt(req.query.page) || 1;
    console.log("following-feed ", pageNo);
    const limit = 10;
    const skipAmount = (pageNo - 1) * limit;

    let followingsBlogs = [];

    const [follows] = await mysqlPool.query(
        "SELECT following_id from user_follows WHERE follower_id = ?",
        [userId.id],
    );

    // console.log(follows);
    const followings = follows.map((follow) => follow.following_id);
    // console.log(followings);

    // if (followings.length > 0) {
    followingsBlogs = await Blog.find({
        createdBy: { $in: followings }, // Match authors in the list
        // status: 'public'
    })
        .sort({ createdAt: -1 })
        .skip(skipAmount)
        .limit(limit);
    // }

    // console.log("followingBlogs ", followingsBlogs);

    followingsBlogs = followingsBlogs.map((blog) => {
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

    const newBlog = followingsBlogs;
    // console.log(" newBlog", newBlog);
    return res.json({ newBlog: newBlog });
});

module.exports = router;
