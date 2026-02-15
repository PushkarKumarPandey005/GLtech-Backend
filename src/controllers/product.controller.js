
import Product from '../model/product.model.js'
import cloudinary from "../config/config.cloudinary.js"
import fs from "fs";

export const addProduct = async (req, res) => {
  try {

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    const newProduct = await Product.create({
      ...req.body,
      priceNegotiable: req.body.priceNegotiable === "true",
      productImg: imageUrls,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}


export const getAllProducts = async (req, res) => {
  try {

    const {
      type,
      purpose,
      location,
      minPrice,
      maxPrice
    } = req.query;

    let filter = {};

    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;
    if (location) filter.location = location;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}


export const getProductsByType = async (req, res) => {
  try {

    const { type } = req.params;

    const allowedTypes = ["stationery", "machinery", "property"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product type",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const products = await Product.find({ type })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({ type });

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      data: products,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}



import mongoose from "mongoose";

export const getSingleProduct = async (req, res) => {
  try {

    const { id } = req.params;

    // 🔥 Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};




export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔥 Handle existing images from frontend
    let imageUrls = req.body.existingImages
      ? Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages]
      : [];

    // ------------------------------------------------
    // 🗑 DELETE REMOVED IMAGES FROM CLOUDINARY
    // ------------------------------------------------
    const removedImages = product.productImg.filter(
      (img) => !imageUrls.includes(img)
    );

    for (const url of removedImages) {
      const parts = url.split("/");
      const fileName = parts.pop();
      const folderName = parts.pop();
      const publicId = `${folderName}/${fileName.split(".")[0]}`;

      await cloudinary.uploader.destroy(publicId);
    }

    // ------------------------------------------------
    // 📤 Upload New Images
    // ------------------------------------------------
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "properties",
        });

        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    // ------------------------------------------------
    // 🔄 Boolean Fix
    // ------------------------------------------------
    const priceNegotiable =
      req.body.priceNegotiable === "true" ||
      req.body.priceNegotiable === true;

    // ------------------------------------------------
    // 📝 Update DB
    // ------------------------------------------------
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        priceNegotiable,
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
    res.status(500).json({
      success: false,
      message: err.message,
    });
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

    // 🔥 Delete Images from Cloudinary (SAFE VERSION)
    if (product.productImg && product.productImg.length > 0) {
      for (const url of product.productImg) {

        // Extract public ID correctly including folder
        const parts = url.split("/");
        const fileName = parts.pop(); // abcxyz.jpg
        const folderName = parts.pop(); // properties

        const publicId = `${folderName}/${fileName.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
      }
    }

    // 🔥 Delete Product from DB
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



export const getPublicProducts = async (req, res) => {
 console.log("FULL REQUEST:", {
  query: req.query,
  body: req.body,
  params: req.params
});


  try {
    const {
      type,
      location,
      furnished,
      ownership,
      bhk,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      sort,
      q,
      purpose,
      page = 1,
      limit = 8
    } = req.query;

    const filter = {};

    // ------------------------------------------------
    // BASIC FILTER
    // ------------------------------------------------
    if (type) filter.type = type;

    // ------------------------------------------------
    // PURPOSE FILTER (VERY IMPORTANT FIX)
    // ------------------------------------------------
    if (purpose) 
      filter.purpose = { $regex: purpose, $options: "i" };
    

    // ------------------------------------------------
    // SIDEBAR FILTERS
    // ------------------------------------------------
    if (location)
      filter.location = { $regex: location, $options: "i" };

    if (furnished)
      filter.furnished = { $regex: furnished, $options: "i" };

    if (ownership)
      filter.ownership = { $regex: ownership, $options: "i" };

    if (bhk)
      filter.bhk = bhk;

    // PRICE RANGE
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ------------------------------------------------
    // SMART NATURAL SEARCH
    // ------------------------------------------------
    if (q) {
      const search = q.toLowerCase();
      const words = search.split(/\s+/);

      // Detect BHK
      const bhkMatch = search.match(/(\d+)\s*bhk/);
      if (bhkMatch) filter.bhk = bhkMatch[1];

      // Detect Purpose
      if (search.includes("rent"))
        filter.purpose = "rent";

      if (search.includes("buy") || search.includes("sale"))
        filter.purpose = "sell";

      // Detect Furnishing
      if (search.includes("fully"))
        filter.furnished = { $regex: "fully", $options: "i" };

      if (search.includes("semi"))
        filter.furnished = { $regex: "semi", $options: "i" };

      if (search.includes("unfurnished"))
        filter.furnished = { $regex: "unfurnished", $options: "i" };

      // Detect Price Under
      const underMatch = search.match(/under\s*(\d+)/);
      if (underMatch)
        filter.price = { $lte: Number(underMatch[1]) };

      // Detect Price Above
      const aboveMatch = search.match(/above\s*(\d+)/);
      if (aboveMatch)
        filter.price = { $gte: Number(aboveMatch[1]) };

      // Detect City
      const cities = ["indore", "delhi", "bhopal", "mumbai", "bangalore"];
      const foundCity = cities.find(city => search.includes(city));
      if (foundCity)
        filter.location = { $regex: foundCity, $options: "i" };

      // Text search in title & description
      filter.$and = words.map(word => ({
        $or: [
          { title: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } }
        ]
      }));
    }

    // ------------------------------------------------
    // SORTING
    // ------------------------------------------------
    let sortOption = { createdAt: -1 };

    if (sort === "price_low")
      sortOption = { price: 1 };

    if (sort === "price_high")
      sortOption = { price: -1 };

    // ------------------------------------------------
    // PAGINATION
    // ------------------------------------------------
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalProducts: total,
      data: products
    });

  } catch (err) {
    console.error("SMART SEARCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



