import express from 'express';
import isAuthenticated from '../middleware/middleware.user.isAuthenticated.js'
import {addProduct, getAllProducts,
       getProductsByType,getSingleProduct,
       updateProduct,deleteProduct, getPublicProducts} from '../controllers/product.controller.js'
import upload from '../middleware/middleware.multer.js'

import {validateProduct as validate} from '../middleware/middleware.dataValidater.js'      

const router = express.Router();

router.post('/', upload.array("images",5),validate, addProduct)
router.get("/public", getPublicProducts);
router.get('/', getAllProducts)
router.get('/type/:type', getProductsByType )
router.get('/:id', getSingleProduct)
router.put("/:id", upload.array("newImages", 5), validate, updateProduct);

router.delete('/:id', deleteProduct)



export default router;