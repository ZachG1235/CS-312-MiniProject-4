import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import { configDotenv } from "dotenv";
import pg from "pg";
import session from "express-session";
import flash from "connect-flash";
import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import postsRouter from "./routes/posts.js";
import authRouter from "./routes/auth.js";
import initializePassport from "./config/passportConfig.js";
import cors from "cors";



const app = express();
const port = 5000;
const saltRounds = 10;

let is_logged_in = false;
let current_user = {name: "", email: ""};

configDotenv('./.env');

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static("public"));

app.use(session({
    secret: "BLOGDBSECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: "lax", secure: false
    },
}));

app.use(flash());



app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.warning_msg = req.flash('warning');
    next();
});

// Project 4 middlewares
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(express.json());
app.use(postsRouter);


app.use(passport.initialize());
app.use(passport.session());

initializePassport(passport);

app.use("/api/auth", authRouter);

// --------------- ROUTING ----------------
app.get("/", async (req, res) => {    
    let storedData = await getBlogData();
    storedData = storedData.rows;
    // console.log(storedData);
    console.log(req.user || null);
    // UPDATED FROM PROJECT 3
    res.json({data: storedData, user_logged_in: req.isAuthenticated(), current_user: req.user || null});
    // res.render("index.ejs", {data: storedData, user_logged_in: req.isAuthenticated(), current_user: req.user || null})
});
 
// get if user is logged in
app.get("/ap/auth/status", (req, res) => {
    res.json({ user_logged_in: is_logged_in, user: current_user });
});

app.post("/log-in", (req, res) => {
    is_logged_in = true;
    const { name, email } = req.body;
    current_user = {name: name, email: email};
    res.json({ message: "User logged in" });
});

app.post("/submit", async (req, res) => {
    let post = req.body;
    let now = new Date();
    try {
        db.query("INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created, edited) VALUES ($1, $2, $3, $4, $5, $6)", 
                                                [req.user.name, req.user.user_id, post['blogtitle'], post['blogcontent'], now, false]);
        req.flash("success", "Blog Post created Successfully!");
    } catch (err) {
        req.flash('error', "There was an error creating the Blog Bost.");
    }
    res.redirect("/")
});

app.delete("/delete/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM blogs WHERE blog_id = $1", [Number(req.params.id),]);
        req.flash("success", "Successfully deleted Blog Post.");
    } catch (err) {
        req.flash("error", "There was an error deleting the Blog Post.")
    }    
    res.redirect("/")
});

// app.get("/edit/:id", async (req, res) => {
//     let current_blog = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [Number(req.params.id),]);
//     console.log(current_blog.rows[0]);
//     res.render("edit.ejs", {blog_data: current_blog.rows[0], user_logged_in: req.isAuthenticated(), current_user: req.user || null})
// });

app.put("/update/:id", async (req, res) => {
    let updated_post = req.body;
    let now = new Date();
    try {
        await db.query("UPDATE blogs SET title = $1, body = $2, date_created = $3, edited = $4 WHERE blog_id = $5", 
                            [updated_post['blogtitle'], updated_post['blogcontent'], now, true, Number(req.params.id)]);
        req.flash("success", "Successfully edited Blog Post.");
    } catch (err) {
        req.flash("error", "There was an error editing the Blog Post.");
    }
    res.redirect("/");
});

app.post("/return-home", (req, res) => {
    res.redirect("/");
});

app.get("/register", (req, res) => {
    res.render("register.ejs", {user_logged_in: req.isAuthenticated(), current_user: req.user || null});
});

app.post("/register", async (req, res) => {
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const displayname = req.body.displayname.trim();
    console.log(email);
    console.log(password);
    console.log(displayname);

    const checkResult = await db.query("SELECT * FROM users WHERE user_id = $1", [email,]);

    if (checkResult.rows.length > 0)
    {
        req.flash('warning', "The email is already registerd. Please register using a different email or sign in.");
        res.redirect("/register");
    }
    else
    {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) 
            {
                console.error("Error hashing password:", err);
            }
            else
            {
                const result = await db.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3) RETURNING *", 
                                                                                                [email, hash, displayname]);
                req.flash("success", "Registration successful. Please Log in.");
                res.redirect("/login");
            }
        });
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs", {user_logged_in: req.isAuthenticated(), current_user: req.user || null});
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/", 
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Successfully signed in."
}));

app.get("/logout", (req, res) => {
    req.logout(function (err){
        if (err)
        {
            req.flash("error", "There was an error signing out.");
            return next(err);
        }
        else
        {
            req.flash("success", "Successfully signed out.");
        }
        res.redirect("/");
    });
});

app.get("/account", (req, res) => {
    res.render("account.ejs", {user_logged_in: req.isAuthenticated(), current_user: req.user || null})
})

app.post("/account", async (req, res) => {
    let formdata = req.body;
    let user_from_db = await db.query("SELECT * FROM users WHERE user_id = $1", [req.user.user_id,]); 
    // check if password is updated
    let new_password = "";
    if (formdata['new_password'].length > 0)
    {
        try {
            new_password = await bcrypt.hash(formdata['new_password'].trim(), saltRounds);
        }
        catch (err) {
            console.error("Error hashing password:" , err);
        }
        
    }
    let new_display_name = req.user.name;
    if (formdata['new_display_name'].length > 0)
    {
        new_display_name = formdata['new_display_name'];
    }
    let new_user_id = req.user.user_id;
    if (formdata['new_user_id'].length > 0)
    {
        new_user_id = formdata['new_user_id'];
    }
    try {
        if (new_password.length > 0) {
            await db.query("UPDATE users SET user_id = $1, password = $2, name = $3 WHERE user_id = $4", [new_user_id, new_password, new_display_name, req.user.user_id]);
        }
        else
        {
            await db.query("UPDATE users SET user_id = $1, name = $2 WHERE user_id = $3", [new_user_id, new_display_name, req.user.user_id]);
        }
        req.flash("success", "Successfully changed account info. Please sign in again.");
        res.redirect("/logout");
    }
    catch (err) {
        req.flash("error", "There was an error updating your account information.");
        console.log(err);
        res.redirect("/");
    }
    
});


// // Import Passport configuration (strategies, serialize/deserialize)
// import "./routes/auth.js"; // make sure this file configures passport

// passport.use(new Strategy({usernameField: 'email', passwordField: 'password'}, async function verify(email, password, cb) {
//     console.log(email);
//     try {
//         const result = await db.query("SELECT * FROM users WHERE user_id = $1", [email,]);
//         if (result.rows.length > 0) 
//         {
//             const user = result.rows[0];
//             const storedHashedPassword = user.password;
//             bcrypt.compare(password, storedHashedPassword, (err, result) => {
//                 if (err)
//                 {
//                     console.error("Error comparing passwords:", err);
//                     return cb(err);
//                 }
//                 else
//                 {
//                     if (result)
//                     {
//                         // logged in
//                         return cb(null, user);
//                     }
//                     else
//                     {
//                         // incorrect password
//                         cb(null, false, { message: "Incorrect password" });
//                     }
//                 }
//             });
//         }
//         else
//         {
//             // user not found
//             return cb(null, false, { message: "User not found" });
//         }
//     }
//     catch (err) 
//     {
//         console.error("Error in Verify function:" (err));
//     }
// }));

// passport.serializeUser((user, cb) => {
//     cb(null, user);
// });

// passport.deserializeUser((user, cb) => {
//     cb(null, user);
// });

async function getBlogData()
{
    return await db.query("SELECT * FROM blogs ORDER BY date_created DESC");
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});