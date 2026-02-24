import express from "express";
import {
  createBlog,
  updateBlog,
  getBlogs,
  getBlogBySlug,
  deleteBlog,
} from "../controllers/blog.controller.js";

import { validate } from "../middleware/middleware.blogData.validater.js";
import {
  createBlogSchema,
  updateBlogSchema,
} from "../middleware/middleware.blogValidater.js";

const router = express.Router();

/* ================================
   CREATE BLOG
================================ */
router.post(
  "/",
  validate(createBlogSchema), // ✅ multer हटाया
  createBlog
);

/* ================================
   UPDATE BLOG
================================ */
router.put(
  "/:id",
  validate(updateBlogSchema), // ✅ multer हटाया
  updateBlog
);

/* ================================
   GET BLOGS
================================ */
router.get("/", getBlogs);

/* ================================
   GET SINGLE BLOG
================================ */
router.get("/:slug", getBlogBySlug);

/* ================================
   DELETE BLOG
================================ */
router.delete("/:id", deleteBlog);



export default router;