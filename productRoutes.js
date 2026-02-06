const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const Product = require("../models/Product");
const streamifier = require("streamifier");
require("dotenv").config();

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: "kisanmarket", resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains { id, role }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ➕ Add Product (protected)
router.post("/add", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { cropName, description, phone, location, price, quantity } = req.body;

    if (!req.file) return res.status(400).json({ error: "Image is required" });

    const result = await uploadToCloudinary(req.file.buffer);

    const product = new Product({
      cropName,
      description,
      phone,
      location,
      price,
      quantity,
      imageUrl: result.secure_url,
      farmerId: req.user.id, // ✅ from token
    });

    await product.save();
    res.json({ success: true, message: "✅ Product added successfully", product });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "❌ Server error", details: err.message });
  }
});


// 📦 Fetch Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("farmerId", "name email")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "❌ Cannot fetch products" });
  }
});

module.exports = router;
