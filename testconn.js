require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, family: 4 })
  .then(() => { console.log("Connected ok"); process.exit(0); })
  .catch(err => { console.error("Conn failed:", err); process.exit(1); });
