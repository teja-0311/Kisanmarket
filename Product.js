const mongoose = require("mongoose");
const User = require("./User"); // ✅ required for farmer auto-upgrade logic

const productSchema = new mongoose.Schema({
  cropName: { type: String, required: true },
  description: String,
  phone: String,
  location: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Include virtual "id" field when sending JSON
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
productSchema.set("toJSON", { virtuals: true });

// 📌 Auto-upgrade user role to farmer on product creation
productSchema.pre("save", async function (next) {
  try {
    const farmer = await User.findById(this.farmerId);
    if (farmer) await farmer.becomeFarmer();
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Product", productSchema);
