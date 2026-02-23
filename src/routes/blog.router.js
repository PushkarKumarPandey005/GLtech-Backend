import express from "express";
import {createBlog, updateBlog, getBlogs, getBlogBySlug, deleteBlog,} from "../controllers/blog.controller.js";
import { validate } from "../middleware/middleware.blogData.validater.js";
import { createBlogSchema, updateBlogSchema,
} from "../middleware/middleware.blogValidater.js";
import upload from "../middleware/middleware.multer.js";

const router = express.Router();

// CREATE BLOG
router.post(
  "/",
  upload.single("featuredImage"), // ⭐ YE LINE ADD KARO
  validate(createBlogSchema),
  createBlog
);

// UPDATE BLOG
router.put(
  "/:id",
  upload.single("featuredImage"), // ⭐ ADD THIS
  validate(updateBlogSchema),
  updateBlog
);

// GET BLOGS
router.get("/", getBlogs);

// GET SINGLE BLOG
router.get("/:slug", getBlogBySlug);

// DELETE BLOG
router.delete("/:id", deleteBlog);

export default router;