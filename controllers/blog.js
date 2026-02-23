// const express = require("express");
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })

// const Blog = require("../models/Blog");
const Blog = require("../models/blog");

async function  createBlogHandler(req, res, next){
    const file = req.file;
    console.log("Uploaded file:", file);
    console.log("File stored at:", file.path);
    const body = req.body; 
    body.path = "/" +file.path;
    console.log("user Info", req.user); 
    body.createdBy = req.user.id;

    console.log("body", body);
    console.log(file.path);
    const newBlog = new Blog(body);
    console.log(newBlog);
    await newBlog.save();
    // res.send("done")
    res.redirect("/"); 
} 
 

module.exports = {createBlogHandler};