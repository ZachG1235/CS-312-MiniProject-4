import express from "express";
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Example placeholder logic
  if (email === "test@example.com" && password === "password") {
    return res.json({ success: true, user: { email } });
  }
  res.status(401).json({ success: false, message: "Invalid credentials" });
});

export default router;