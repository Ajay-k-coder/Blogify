
const express = require("express");
const server = express();
// const mongoose = require("mongoose");
const { connectMongoDB, mysqlPool } = require('./config/db');
const cookieParser = require('cookie-parser');
const {isAuthenticated} = require("./middleware/auth");
const Blog = require("./models/mongodb/blog");
const path = require("path");

const routeBlog = require("./routes/blog"); 
const routeAuth = require("./routes/authentication");
const routeUser = require("./routes/user");
server.use(express.static(path.join(__dirname, "/public")));

const methodOverride = require('method-override')
server.use(methodOverride('_method'));

const port = process.env.PORT || 3000;  
 

 
  
connectMongoDB();
server.set("view engine", "ejs");
server.set("views", path.resolve("views"));
// server.use(express.static(path.resolve("./uploads")));

server.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
  
// server.use("/uploads", express.static("uploads"));
//
// server.use("/uploads", path.join(__dirname, "./uploads"));
// server.use("/uploads", path.join(__dirname,"./uploads"));
 
server.use(cookieParser())
server.use(express.urlencoded({extended:true}));
server.get("/db-test", async(req, res)=>{
  try {
        const [rows] = await mysqlPool.query('SELECT 1 + 1 AS solution');
        res.send(`MySQL is working! Solution: ${rows[0].solution}`);
    } catch (err) {
        res.status(500).send("MySQL Connection Failed");
    }
})  
 
server.get("/", isAuthenticated,async(req, res)=>{
  let allBlogs = await Blog.find(); 
  console.log("user", req.user);
  res.render("home", { allBlogs });
}) 
  
server.use("/blog",   isAuthenticated,  routeBlog);
server.use("/profile", routeUser);
server.use("/user",   routeAuth); 

     
server.listen(port, (req, res)=>{ 
    console.log(`app is listing on port ${port}`);
}) 