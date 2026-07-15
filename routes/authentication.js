const express = require("express");
const server = express();
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const OTP = require("../models/mongodb/forOTP");
const { mysqlPool } = require("../config/db");
const { createToken } = require("../service/authentication");
const upload = require("../config/upload");
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const { userSignUpHandler, userLoginHandler } = require("../controllers/user");

router.get("/signup", (req, res, next) => {
    res.render("../views/signup", { user: req.user });
});

router.get("/auth/otp", (req, res, next) => {
    const email = req.query.email;
    res.render("../views/email/verifyOTP", { email });
});

router.post("/auth/otp", async (req, res) => {
    try {
        const result = req.body.otp;
        const email = req.body.email;
        console.log("email", email);
        const filter = Object.values(result);
        const otp = Number(filter.join(""));
        console.log("otp", otp);

        if (!email || !otp) {
            return res
                .status(400)
                .json({ message: "Email and OTP are required" });
        }

        const record = await OTP.findOne({ email });

        if (!record) {
            return res.status(404).json({ message: "Email not found" });
        }

        if (record.otp !== otp) {
            req.flash("error", "wrong otp try again");
            return res.redirect(
                `/user/auth/otp?email=${encodeURIComponent(email)}`,
            );
        }

        req.flash("success", "OTP verified successfully");
        const q = "SELECT * FROM users WHERE email = ? ";

        try {
            const [results, fields] = await mysqlPool.query(
                "SELECT * FROM `users` WHERE `email` = ?",
                [email],
            );

            const token = createToken(results[0]);
            res.cookie("auth_token", token, { httpOnly: true });
        } catch (err) {
            console.log(err);
        }

        res.redirect("/home");
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/signup", upload.single("profilePicture"), userSignUpHandler);
router.post("/login", userLoginHandler);

router.get("/login", (req, res, next) => {
    return res.render("../views/login", { user: req.user });
});

router.get("/logout", (req, res, next) => {
    res.clearCookie("auth_token");
    return res.redirect("/home");
});

module.exports = router;
