const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");

const router = express.Router();

// GET user cart
router.get("/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    let cart = await Cart.findOne({ phone });
    if (!cart) return res.json({ phone, items: [] });
    res.json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// POST update/add cart
router.post("/update", async (req, res) => {
  try {
    const { phone, items } = req.body;

    if (!phone || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Convert productId correctly
    const fixedItems = items.map((i) => ({
      productId: new mongoose.Types.ObjectId(i.productId), // ✅ must use `new`
      cropName: i.cropName || "Unknown",
      price: i.price || 0,
      quantity: i.quantity || 1,
      location: i.location || "",
      imageUrl: i.imageUrl || "",
      cartQuantity: i.cartQuantity || 1,
    }));

    const cart = await Cart.findOneAndUpdate(
      { phone },
      { phone, items: fixedItems },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, cart });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: err.message || "Failed to update cart" });
  }
});

// DELETE clear cart
router.delete("/clear/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    await Cart.findOneAndDelete({ phone });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

module.exports = router;
