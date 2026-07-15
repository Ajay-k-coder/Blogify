const Blog = require("../models/mongodb/blog");

async function createBlogHandler(req, res, next) {
    try {
        // 1. Capture the text data from Quill and the title
        const body = req.body;
        // 2. Safely check if an image was actually uploaded before grabbing the path
        if (req.file) {
            body.path = req.file.path; // Cloudinary URL
        } else {
            // Optional: Provide a default image if they didn't upload one
            // body.path = "https://your-default-image-url.com/placeholder.jpg";
        }

        // 3. Attach the author details from the logged-in user
        if (req.user) {
            body.createdBy = req.user.id;
            body.author = req.user.full_name;
        }
        // 4. Create and save the new blog post
        let tagsArray = [];
        if (body.tags) {
            // Split by comma, then map over the array to trim whitespace
            tagsArray = tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);
        }
        body.tag = tagArray;
        const newBlog = new Blog(body);
        await newBlog.save();

        // 5. Send exactly ONE successful response
        return res.redirect("/home");
    } catch (error) {
        console.error("Error creating blog:", error);

        // 6. If anything fails, safely send exactly ONE error response
        // This prevents the ERR_HTTP_HEADERS_SENT crash!
        console.log("CRASH DETAILS:", error);

        // 2. Send readable JSON to the browser instead of [object Object]
        return res.status(500).json({
            errorName: error.name,
            errorMessage: error.message,
            fullError: error,
        });
    }
}

async function editBlogHandler(req, res, next) {
    const id = req.params.id;
    const body = req.body;

    const blog = await Blog.findOne({ _id: id });
    blog.content = body.content;
    blog.title = body.title;

    let tagsArray = [];
    if (body.tags) {
        // Split by comma, then map over the array to trim whitespace
        tagsArray = body.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        blog.tags = tagsArray;
    }

    if (req.file) {
        // console.log("file in edit handler", req.file);
        blog.path = req.file.path;
    }

    await blog.save();
    res.redirect(`/blog/preview/${id}`);
}

module.exports = { createBlogHandler, editBlogHandler };
