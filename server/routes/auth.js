import express from "express";
import passport from "passport";
import { registerUser, getUserName } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }

    // Log the user in (establish session)
    req.logIn(user, (err) => {
      if (err) return next(err);

      // Successful login  send user info to client
      return res.json({
        success: true,
        user: { id: user.user_id, name: user.name },
      });
    });
  })(req, res, next);
});

router.post("/name", getUserName);

router.post("/log-in" , (req, res) => {
  returnres.json({ success: true, message: "Logged in" });
});


export default router;