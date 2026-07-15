const express = require("express");
const server = express();
const { connectMongoDB, mysqlPool } = require("./config/db");
const cookieParser = require("cookie-parser");
const { isAuthenticated } = require("./middleware/auth");
const Blog = require("./models/mongodb/blog");
const path = require("path");
const session = require("express-session");
const removeMd = require("remove-markdown");
const routeBlog = require("./routes/blog");
const routeAuth = require("./routes/authentication");
const routeUser = require("./routes/user");
const routeHome = require("./routes/home");
const flash = require("connect-flash");

server.use(express.static(path.join(__dirname, "/public")));
const methodOverride = require("method-override");
server.use(methodOverride("_method"));
const port = process.env.PORT || 3000;

connectMongoDB();
server.set("view engine", "ejs");
server.set("views", path.resolve("views"));
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
server.use(cookieParser());
server.use(express.urlencoded({ extended: true }));

const sessionOption = {
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
};

server.use(session(sessionOption));
server.use(flash());

server.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
});

server.get("/", (req, res, next) => {
    res.redirect("/home");
});

let name = "John Doe";

server.use("/blog", isAuthenticated, routeBlog);
server.use("/profile", routeUser);
server.use("/user", routeAuth);
server.use("/home", routeHome);

server.listen(port, (req, res) => {
    console.log(`app is listing on port ${port}`);
});
