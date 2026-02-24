import express from "express";
import upload from "../middleware/middleware.multer.js";
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

router.post("/upload", upload.single("file"), async (req, res) => {
  console.log("UPLOAD FILE:", req.file);

  const result = await cloudinary.uploader.upload(req.file.path);

  res.json({ url: result.secure_url });
});

export default router;