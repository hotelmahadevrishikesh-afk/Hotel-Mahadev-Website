// Product.js - Mongoose Product Model for AddDirectProduct Page
import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuBar' }, // or ref: 'SubMenu' if you have such a model
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' },
  isDirect: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  info: { type: mongoose.Schema.Types.ObjectId, ref: 'Info' },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductReview' }],
  price: { type: mongoose.Schema.Types.ObjectId, ref: 'Price' },
  Amenities: { type: mongoose.Schema.Types.ObjectId, ref: 'Amenities' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);