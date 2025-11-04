import pool from "../db.js";

export async function getPost(req, res) {
    const { blogId } = req.params;
    console.log("Fetching blog with ID:", blogId);
    try {
        const result = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [Number(blogId), ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json({ blog: result.rows[0] }); // important: frontend expects `data.blog`
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export const getAllPosts = async (req, res) => {
    const result = await pool.query("SELECT * FROM blogs ORDER BY date_created DESC");
    try {
        // console.log("Fetched posts:", result);
        res.json({posts: result.rows});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }    
};


export const createPost = (req, res) => {
    const { title, body } = req.body;
    console.log("Received new post:", { title, body });
    // insert into DB

    res.json({ message: "Post created successfully", title, body });
};

export const updatePost = async (req, res) => {
    const blog_id = req.params.blogId;
    const title = req.body.title;
    const body = req.body.body;
    console.log("Updating post:", { blog_id, title, body });
    let now = new Date();
    const result = await pool.query("UPDATE blogs SET title = $1, body = $2, date_created = $3, edited = $4 WHERE blog_id = $5", [title, body, now, true, blog_id]);
    
    console.log("Updated post:", { blog_id, title, body });
    res.json({ message: "Post updated successfully", title, body });
};