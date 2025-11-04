import express from "express";
import { getAllPosts, getPost, createPost, updatePost } from "../controllers/postsController.js";

const router = express.Router();

router.get("/api/posts", getAllPosts);
router.get("/api/posts/:blogId", getPost);
router.put("/api/edit/:blogId", updatePost);
// router.post("/", createPost);

export default router;