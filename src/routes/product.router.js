import express from 'express';
import isAuthenticated from '../middleware/middleware.user.isAuthenticated.js';
import {
  addProduct,
  getAllProducts,
  getProductsByType,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  searchProperties,
  getProperties,
  getStationeryProducts,
  getProductBySlug
} from '../controllers/product.controller.js';
import upload from '../middleware/middleware.multer.js';
import { validateProduct as validate } from '../middleware/middleware.dataValidater.js';

const router = express.Router();

// =======================
// 🔥 SPECIFIC ROUTES FIRST
// =======================

router.get("/search", searchProperties);
router.get("/properties", getProperties);
router.get("/public", getPublicProducts);
router.get("/type/:type", getProductsByType);

// ✅ Stationery routes BEFORE dynamic id
router.get("/stationery", getStationeryProducts);
router.get("/slug/:slug", getProductBySlug);

// =======================
//  GENERIC ROUTES LAST
// =======================

router.get('/', getAllProducts);
router.get('/:id', getSingleProduct);

router.post('/', upload.array("images", 5), validate, addProduct);
router.put("/:id", upload.array("newImages", 5), validate, updateProduct);
router.delete('/:id', deleteProduct);

export default router;
