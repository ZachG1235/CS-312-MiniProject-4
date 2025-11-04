import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js"; 

export const registerUser = async (req, res) => {
    console.log("Registering user with data:", req.body);
    const saltRounds = 10;

    const { email, password, displayname } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing username or password" });
    }

    try {
        // Check if user already exists
        const checkResult = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [email]
        );

        if (checkResult.rows.length > 0) {
            console.log(
                "warning",
                "The email is already registered. Please register using a different email or sign in."
            );
            res.status(500).json({ success: false, message: "User Already exists" });
        }

        // Hash the password
        const hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3) RETURNING *",
            [email, hash, displayname]
        );

        console.log("success", "Registration successful. Please log in.");
        res.status(201).json({
            success: true,
            message: "Registration successful!",
            user: result.rows[0]
        });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export async function getUserName(req, res) {
    const { email } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [email, ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ success: true,
            message: "Logged in",
            user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}