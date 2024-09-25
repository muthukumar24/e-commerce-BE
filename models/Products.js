const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  images: { type: [String], default: [] }, // Array of image URLs
});

const Products = mongoose.model('Products', ProductSchema);
module.exports = Products;