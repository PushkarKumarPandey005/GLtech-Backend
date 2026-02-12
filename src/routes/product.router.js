import express from 'express';
import isAuthenticated from '../middleware/middleware.user.isAuthenticated.js'
import {addProduct, getAllProducts,
       getProductsByType,getSingleProduct,
       updateProduct,deleteProduct} from '../controllers/product.controller.js'
import upload from '../middleware/middleware.multer.js'

import {validateProduct as validate} from '../middleware/middleware.dataValidater.js'      

const router = express.Router();

router.post('/', upload.array("images",5),isAuthenticated,validate, addProduct)
router.get('/',isAuthenticated, getAllProducts)
router.get('/type/:type',isAuthenticated, getProductsByType )
router.get('/:id',isAuthenticated, getSingleProduct)
router.put("/:id", upload.array("newImages", 5),isAuthenticated, validate, updateProduct);

router.delete('/:id', deleteProduct)

export default router;