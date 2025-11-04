app.get("/api/posts", async (req, res) => {
    try {
        const posts = await db.query("SELECT * FROM blogs ORDER BY date_created DESC");
        res.json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});