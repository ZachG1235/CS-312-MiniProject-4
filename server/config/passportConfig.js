import passportLocal from "passport-local";
import db from "../db.js";
import bcrypt from "bcryptjs";

const LocalStrategy = passportLocal.Strategy;

export default function initializePassport(passport) {
  const authenticateUser = async (email, password, cb) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE user_id = $1", [email]);
      const user = result.rows[0];
      if (!user) return cb(null, false, { message: "No user with that email" });

      const match = await bcrypt.compare(password, user.password);
      if (match) return cb(null, user);
      else return cb(null, false, { message: "Password incorrect" });
    } catch (err) {
      return cb(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  passport.serializeUser((user, cb) => cb(null, user.user_id));
  passport.deserializeUser(async (id, cb) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE user_id = $1", [id]);
      cb(null, result.rows[0]);
    } catch (err) {
      cb(err);
    }
  });
}