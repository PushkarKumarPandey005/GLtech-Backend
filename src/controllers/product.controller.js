
import Product from '../model/product.model.js'
import cloudinary from "../config/config.cloudinary.js"
import fs from "fs";

export const addProduct = async (req, res) => {

    try {
        
        let imageUrls = [];

        //multer logics
        if(req.files && req.files.length > 0){
            for(const file of req.files){
                const result = await cloudinary.uploader.upload(file.path);
                imageUrls.push(result.secure_url);

                //temporiry files delete
                fs.unlinkSync(file.path); 
            }
        }
        const newProduct = await Product.create({
            ...req.body,
             productImg: imageUrls});
             
        res.status(201).json({ success: true, message: "Product added successfully", data: newProduct });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}


export const getAllProducts = async (req, res) => {

    try {

        const products = await Product.find();
        res.status(200).json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}


export const getProductsByType = async (req, res) => {
    try {

        const type = req.params.type.trim(); 

        const products = await Product.find({ type });
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: `No product found for type: ${type}` });
        }

        res.status(200).json({ success: true, count: products.length, data: products });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });

    }
}


export const getSingleProduct = async (req, res) => {

    try {

        const { id } = req.params;

        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({ success: true, data: product });

    } catch (err) {
        res.status(500).json({ success: false, message: "Invalid Id or Server error", error: err.message });
    }
}



export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    

    const product = await Product.findById(id);
    if (!product) {
      console.log("Product not found in DB");
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("Existing product images in DB:", product.productImg);

    // Remaining old images from frontend
    let imageUrls = req.body.existingImages
      ? Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages]
      : [];

    

    // Upload new images if any
    if (req.files && req.files.length > 0) {
      console.log("Uploading new images...");
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        productImg: imageUrls,
      },
      { new: true, runValidators: true }
    );

   

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}




export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

   
    for (const url of product.productImg) {
      const publicId = url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }


    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product and images deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}