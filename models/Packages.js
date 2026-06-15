// Product.js - Mongoose Product Model for AddDirectProduct Page
import mongoose from 'mongoose';
const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true },
  slug: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuBar' },
  isDirect: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  gallery: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' },
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  description: { type: mongoose.Schema.Types.ObjectId, ref: 'Description' },
  info: { type: mongoose.Schema.Types.ObjectId, ref: 'Info' },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductReview' }],
  packagePrice: { type: mongoose.Schema.Types.ObjectId, ref: 'PackagePrice' }, // Link to PackagePrice
  pdfs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PackagePdf' }],
  packageHighlight: { type: mongoose.Schema.Types.ObjectId, ref: 'PackageHighlight' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Packages || mongoose.model('Packages', PackageSchema);
