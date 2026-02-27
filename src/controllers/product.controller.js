
import Product from '../model/product.model.js'
import cloudinary from "../config/config.cloudinary.js"
import fs from "fs";



/* ---------- retry uploader ---------- */
const uploadWithRetry = async (filePath, retries = 1) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "products",
      timeout: 60000,
    });

    if (!result?.secure_url) {
      throw new Error("Invalid Cloudinary response");
    }

    return result;
  } catch (err) {
    const isTimeout =
      err?.error?.http_code === 499 ||
      err?.error?.name === "TimeoutError" ||
      err?.code === "ENOTFOUND";

    console.error("Cloudinary upload failed:", err);

    if (isTimeout && retries > 0) {
      console.warn("Retrying upload...");
      await new Promise((r) => setTimeout(r, 1500));
      return uploadWithRetry(filePath, retries - 1);
    }

    throw err;
  }
};

export const addProduct = async (req, res) => {
  try {
    let imageUrls = [];

    /* ---------- SEQUENTIAL UPLOAD (STABLE) ---------- */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadWithRetry(file.path, 1);
          imageUrls.push(result.secure_url);
        } catch (err) {
          console.error("Single image upload failed:", err);
          throw err;
        } finally {
          // ✅ ALWAYS delete local file
          try {
            if (file?.path && fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log("Local file deleted:", file.path);
            }
          } catch (delErr) {
            console.error("File delete failed:", delErr);
          }
        }
      }
    }

    /* ---------- CREATE PRODUCT ---------- */
    const newProduct = await Product.create({
      ...req.body,
      priceNegotiable: req.body.priceNegotiable === "true",
      productImg: imageUrls,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (err) {
    console.error("Add Product Error:", err);

    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const {
      type,
      purpose,
      location,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};

    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;
    if (location) filter.location = location;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ✅ PARALLEL QUERIES (BIG SPEED BOOST)
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      // ✅ FAST COUNT
      Product.estimatedDocumentCount(), // ⚠️ faster than countDocuments
    ]);

    res.status(200).json({
      success: true,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalProducts: total,
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

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

    //Validate MongoDB ObjectId
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
}




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

    /* ================= EXISTING IMAGES ================= */
    let imageUrls = req.body.existingImages
      ? Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages]
      : [];

    /* ================= DELETE REMOVED IMAGES ================= */
    const removedImages = product.productImg.filter(
      (img) => !imageUrls.includes(img)
    );

    for (const url of removedImages) {
      try {
        const parts = url.split("/");
        const fileName = parts.pop();
        const folderName = parts.pop();
        const publicId = `${folderName}/${fileName.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.log("Cloudinary delete failed:", e.message);
      }
    }

    /* ================= UPLOAD NEW IMAGES ================= */
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products", // ⚠️ keep consistent
          });

          imageUrls.push(result.secure_url);

          // local delete
          if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.error("Image upload failed:", err);
        }
      }
    }

    /* ================= BOOLEAN FIX ================= */
    const priceNegotiable =
      req.body.priceNegotiable === "true" ||
      req.body.priceNegotiable === true;

    /* ================= SAFE UPDATE OBJECT ================= */
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      discountPrice: req.body.discountPrice,
      stock: req.body.stock,
      size: req.body.size,
      material: req.body.material,
      weight: req.body.weight,
      color: req.body.color,
      brand: req.body.brand,
      priceNegotiable,
      productImg: imageUrls,
    };

    /* ================= DB UPDATE ================= */
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.log("ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



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

    /* ================= DELETE IMAGES FROM CLOUDINARY ================= */
    if (product.productImg?.length > 0) {
      await Promise.all(
        product.productImg.map(async (url) => {
          try {
            // ✅ robust publicId extraction
            const publicId = url
              .split("/")
              .slice(-2)
              .join("/")
              .split(".")[0];

            const result = await cloudinary.uploader.destroy(publicId);

            console.log("Cloudinary delete:", publicId, result.result);
          } catch (err) {
            console.error("Cloudinary delete failed:", err.message);
          }
        })
      );
    }

    /* ================= DELETE PRODUCT ================= */
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product and images deleted successfully",
    });
  } catch (err) {
    console.error("Delete Product Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getPublicProducts = async (req, res) => {
  try {
    const { type, location, furnished, ownership, bhk, minPrice, maxPrice, minArea, maxArea, sort,
      q, purpose, page = 1, limit = 8 } = req.query;

    const filter = {};


    // Basic type filter
    // -----------------------------------------
    if (type) {
      filter.type = type;
    }


    // Purpose Filter
    // -----------------------------------------
    if (purpose) {
      filter.purpose = purpose.toLowerCase();
    }


    // Sidebar Filter
    // -----------------------------------------
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (furnished) {
      filter.furnished = { $regex: furnished, $options: "i" };
    }

    if (ownership) {
      filter.ownership = { $regex: ownership, $options: "i" };
    }

    if (bhk) {
      filter.bhk = Number(bhk);
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }


    // Universal smart search with natural language parsing
    // -----------------------------------------
    if (q) {
      const search = q.toLowerCase().trim();
      const words = search.split(/\s+/).filter(w => w.length > 0);

      const orConditions = [];
      let detectedBhk = null;
      let detectedLocation = null;
      const purposeKeywords = { buy: "Buy", rent: "Rent", sell: "Sell", lease: "Lease" };

      // Common stopwords to filter out
      const stopwords = new Set(['in', 'at', 'the', 'a', 'an', 'and', 'or', 'of', 'to', 'for', 'on', 'is', 'are', 'was', 'were', 'be', 'been']);

      words.forEach(word => {
        // Skip stopwords
        if (stopwords.has(word)) {
          return;
        }

        // Detect BHK pattern: "1bhk", "2bhk", "3bhk", etc.
        //--------------------------------------
        const bhkMatch = word.match(/^(\d+)\s*bhk?$/i);
        if (bhkMatch) {
          detectedBhk = Number(bhkMatch[1]);
          if (!filter.bhk) {
            filter.bhk = detectedBhk;
          }
          return;
        }

        // Detect purpose keywords
        //--------------------------------------
        if (purposeKeywords[word]) {
          if (!filter.purpose) {
            filter.purpose = purposeKeywords[word].toLowerCase();
          }
          return;
        }

        // Detect property type keywords
        //--------------------------------------
        const propertyTypes = ['flat', 'apartment', 'apt', 'house', 'villa', 'office', 'shop', 'commercial', 'land', 'plot'];
        if (propertyTypes.includes(word)) {
          if (!filter.type) {
            filter.type = "property";
          }
          orConditions.push({ title: { $regex: word, $options: "i" } });
          return;
        }

        // Detect furnished keywords
        //--------------------------------------
        const furnishedKeywords = ['furnished', 'unfurnished', 'semi'];
        if (furnishedKeywords.some(f => word.includes(f))) {
          if (!filter.furnished) {
            filter.furnished = { $regex: word, $options: "i" };
          }
          return;
        }

        // Detect location keywords (cities, areas)
        //--------------------------------------
        const indianCities = ['indore', 'mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'gurgaon', 'noida', 'kolkata', 'jaipur', 'ahmedabad', 'chandigarh', 'lucknow', 'bhopal', 'nagpur'];
        if (indianCities.includes(word)) {
          detectedLocation = word;
          if (!filter.location) {
            filter.location = { $regex: word, $options: "i" };
          }
          return;
        }

        // General text search - match in title, description, location
        //----------------------------------------------------
        if (word.length > 2) {
          orConditions.push(
            { title: { $regex: word, $options: "i" } },
            { description: { $regex: word, $options: "i" } },
            { location: { $regex: word, $options: "i" } },
            { furnished: { $regex: word, $options: "i" } },
            { purpose: { $regex: word, $options: "i" } },
            { parking: { $regex: word, $options: "i" } }
          );
        }
      });

      if (orConditions.length > 0) {
        filter.$or = orConditions;
      }
    }


    // Sorting
    // -----------------------------------------
    let sortOption = { createdAt: -1 };

    if (sort === "price_low") sortOption = { price: 1 };
    if (sort === "price_high") sortOption = { price: -1 };


    // Pagination
    // -----------------------------------------
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


// Advanced Natural Language Search Function
export const searchProperties = async (req, res) => {
  try {
    const { q, page = 1, limit = 8, sort = "newest" } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const search = q.toLowerCase().trim();
    const words = search.split(/\s+/).filter(w => w.length > 0);

    const filter = { type: "property" };
    const orConditions = [];

    // Stopwords and keywords mapping
    const stopwords = new Set(['in', 'at', 'the', 'a', 'an', 'and', 'or', 'of', 'to', 'for', 'on', 'is', 'are', 'was', 'were', 'be', 'been', 'buy', 'sell', 'rent', 'lease']);

    const purposeKeywords = {
      'buy': 'Buy',
      'purchase': 'Buy',
      'rent': 'Rent',
      'lease': 'Lease',
      'sell': 'Sell',
      'sale': 'Sell'
    };

    const propertyTypes = {
      'flat': 'flat',
      'apartment': 'apartment',
      'apt': 'apartment',
      'house': 'house',
      'villa': 'villa',
      'office': 'office',
      'shop': 'shop',
      'commercial': 'commercial',
      'land': 'land',
      'plot': 'plot',
      'bungalow': 'villa',
      'farmhouse': 'villa'
    };

    const furnishedTypes = {
      'furnished': 'Furnished',
      'unfurnished': 'Unfurnished',
      'semi': 'Semi-furnished'
    };

    const indianCities = {
      'indore': 'Indore',
      'mumbai': 'Mumbai',
      'delhi': 'Delhi',
      'bangalore': 'Bangalore',
      'pune': 'Pune',
      'hyderabad': 'Hyderabad',
      'gurgaon': 'Gurgaon',
      'noida': 'Noida',
      'colkata': 'Kolkata',
      'kolkata': 'Kolkata',
      'jaipur': 'Jaipur',
      'ahmedabad': 'Ahmedabad',
      'chandigarh': 'Chandigarh',
      'lucknow': 'Lucknow',
      'bhopal': 'Bhopal',
      'nagpur': 'Nagpur'
    };

    // Parse natural language search
    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      if (stopwords.has(word)) continue;

      // BHK Detection: "1bhk", "2bhk", "3bhk", "1 bhk", "2 bhk"
      const bhkMatch = word.match(/^(\d+)\s*bhk?$/i);
      if (bhkMatch) {
        filter.bhk = Number(bhkMatch[1]);
        continue;
      }

      // Purpose Keywords
      if (purposeKeywords[word]) {
        filter.purpose = purposeKeywords[word].toLowerCase();
        continue;
      }

      // Property Type Keywords
      if (propertyTypes[word]) {
        orConditions.push({ title: { $regex: propertyTypes[word], $options: "i" } });
        continue;
      }

      // Furnished Keywords
      if (furnishedTypes[word]) {
        filter.furnished = furnishedTypes[word];
        continue;
      }

      // City/Location Keywords
      if (indianCities[word]) {
        filter.location = { $regex: indianCities[word], $options: "i" };
        continue;
      }

      // Price range detection: "lakh", "lac", "cr", "crore"
      if (word.match(/lakh|lac|l$/) && i > 0) {
        const priceValue = parseInt(words[i - 1]);
        if (!isNaN(priceValue)) {
          const maxPrice = priceValue * 100000;
          filter.price = { $lte: maxPrice };
          continue;
        }
      }

      if (word.match(/crore|cr$/) && i > 0) {
        const priceValue = parseInt(words[i - 1]);
        if (!isNaN(priceValue)) {
          const maxPrice = priceValue * 10000000;
          filter.price = { $lte: maxPrice };
          continue;
        }
      }

      // General fuzzy text search
      if (word.length > 2) {
        orConditions.push(
          { title: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } },
          { location: { $regex: word, $options: "i" } }
        );
      }
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === "price_low") sortOption = { price: 1 };
    if (sort === "price_high") sortOption = { price: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    // Pagination
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
      query: q,
      appliedFilters: filter,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalProducts: total,
      data: products
    });

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const getProperties = async (req, res) => {
  try {
    const {
      q,
      title,
      description,
      location,
      city,
      state,
      price,
      bhk,
      purpose,
      furnished,
      parking,
      area,
      category,
      type,
      page = 1,
      limit = 8,
      minPrice,
      maxPrice
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 8);
    const skip = (pageNumber - 1) * limitNumber;

    let filter = { type: "property" };
    let andConditions = [];

    // ============================================================
    // 🧠 NATURAL LANGUAGE SEARCH
    // ============================================================

    if (q && q.trim() !== "") {
      const stopWords = ["in", "at", "for", "the", "with", "and", "or", "to", "of"];

      const words = q
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(word => !stopWords.includes(word));

      words.forEach(word => {

        const bhkMatch = word.match(/^(\d+)bhk$/);
        if (bhkMatch) {
          andConditions.push({ bhk: Number(bhkMatch[1]) });
          return;
        }

        if (["rent", "rental"].includes(word)) {
          andConditions.push({ purpose: "rent" });
          return;
        }

        if (["sell", "sale", "buy"].includes(word)) {
          andConditions.push({ purpose: "sell" });
          return;
        }

        if (!isNaN(word)) {
          andConditions.push({ price: { $lte: Number(word) } });
          return;
        }

        andConditions.push({
          $or: [
            { title: { $regex: word, $options: "i" } },
            { description: { $regex: word, $options: "i" } },
            { location: { $regex: word, $options: "i" } },
            { city: { $regex: word, $options: "i" } },
            { state: { $regex: word, $options: "i" } },
            { furnished: { $regex: word, $options: "i" } },
            { parking: { $regex: word, $options: "i" } },
            { category: { $regex: word, $options: "i" } },
            { area: { $regex: word, $options: "i" } }
          ]
        });
      });
    }

    // ============================================================
    // 🎯 DIRECT FIELD FILTERS (if passed separately)
    // ============================================================

    if (title) filter.title = { $regex: title, $options: "i" };
    if (description) filter.description = { $regex: description, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (city) filter.city = { $regex: city, $options: "i" };
    if (state) filter.state = { $regex: state, $options: "i" };
    if (bhk && !isNaN(bhk)) filter.bhk = Number(bhk);
    if (purpose) filter.purpose = purpose.toLowerCase();
    if (furnished) filter.furnished = { $regex: furnished, $options: "i" };
    if (parking) filter.parking = { $regex: parking, $options: "i" };
    if (category) filter.category = { $regex: category, $options: "i" };
    if (area) filter.area = { $regex: area, $options: "i" };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(minPrice)) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(maxPrice)) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Combine smart search conditions
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    console.log("FINAL FILTER:", JSON.stringify(filter, null, 2));

    // ============================================================
    // 📦 FETCH DATA
    // ============================================================

    const properties = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalProducts: total,
      data: properties
    });

  } catch (error) {
    console.error("SMART SEARCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties"
    });
  }
};


// ========================================
// 📦 GET ALL STATIONERY
// ========================================
export const getStationeryProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12
    } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * limitNumber;

    let filter = { type: "stationery" };

    // 🔍 Search
    if (q) {
      const words = q.toLowerCase().split(" ");

      filter.$and = words.map(word => ({
        $or: [
          { title: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } },
          { category: { $regex: word, $options: "i" } },
          { brand: { $regex: word, $options: "i" } }
        ]
      }));
    }

    // 📂 Category filter
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // 💰 Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalProducts: total,
      data: products
    });

  } catch (error) {
    console.error("Stationery Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ========================================
// 🔎 GET SINGLE PRODUCT BY SLUG OR ID
// ========================================
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Try to find by slug first
    let product = await Product.findOne({ slug: slug });

    // If not found by slug, try to find by ObjectId
    if (!product) {
      product = await Product.findById(slug);
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
