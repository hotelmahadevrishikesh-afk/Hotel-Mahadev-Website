import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
 packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages', required: true, unique: true },
  mainImage: {
    url: { type: String, required: true },
    key: { type: String, required: true }
  },
  subImages: [{
    url: { type: String, required: true },
    key: { type: String, required: true }
  }],
}, { timestamps: true });

export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);
