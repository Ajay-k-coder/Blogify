const { verifyToken } = require("../service/authentication");

function isAuthenticated(req, res, next) {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
             return next();
        }
        const decoded = verifyToken(token);
        req.user = decoded;

        res.locals.user = req.user;
        console.log(req.user);
        return next();

    } catch (err) {
        console.error("Auth error:", err.message);
        return res.status(401).render("login", { error: "Invalid token. Please login again" });

    }
}

async function isAutherized(req, res, next) {
    try {
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).render("login", { error: "You must be logged in to access this page" });
        }
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).render("login", { error: "Session expired. Please login again" });
        }

        req.user = decoded;
        res.locals.user = req.user;
        return next();

    } catch (err) {
        console.error("Auth error:", err.message);
        return res.status(401).render("login", { error: "Invalid token. Please login again" });
    }
}


module.exports = {
    isAuthenticated,
    isAutherized,
}