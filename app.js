require('dotenv').config();
const express = require("express");
const server = express();
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const {isAuthenticated} = require("./middleware/auth");
const Blog = require("./models/blog");


const routeBlog = require("./routes/blog"); 
const routeUser = require("./routes/user");

const path = require("path");
const port = process.env.PORT || 3000;
 

main().then(()=>{
    console.log("mongoDB connection established");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });
}
 
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

 
server.get("/", isAuthenticated,async(req, res)=>{
  let allBlogs = await Blog.find();
  console.log("user", req.user);
  res.render("home", { allBlogs });
}) 
 
server.use("/blog",   isAuthenticated,  routeBlog);
server.use("/user",   routeUser); 
     
server.listen(port, (req, res)=>{ 
    console.log(`app is listing on port ${port}`);
}) 