const express = require("express");
const Order  = require("./../models/Order");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware/authMiddleware");
const Notification = require("./../models/Notification");
// Place order
router.post("/", async (req, res) => {
  try {
    const { productId, farmerId, customerId, type, negotiatedPrice, message } = req.body;

    const order = new Order({ productId, farmerId, customerId, type, negotiatedPrice, message });
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: "...", role: "farmer" or "customer" }
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Update order status
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(id).populate("customerId");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    // If order is rejected, notify the customer
    if (status === "rejected") {
      const notification = new Notification({
        userId: order.customerId._id,
        message: `Your negotiated order for ${order.productId.cropName} was cancelled by the farmer.`,
      });
      await notification.save();
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get orders for farmer
router.get("/farmer", authMiddleware, async (req, res) => {
  try {
    const farmerId = req.user.id; // comes from JWT
    const orders = await Order.find({ farmerId })
      .populate("productId")
      .populate("customerId", "name email phone");
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get orders for customer
router.get("/customer", authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id; // comes from JWT
    const orders = await Order.find({ customerId })
      .populate("productId")
      .populate("farmerId", "name email phone");
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
