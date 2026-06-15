import mongoose from 'mongoose';

const CategoryTagSchema = new mongoose.Schema({
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages', required: true },
  tags: [String]
}, { timestamps: true });

export default mongoose.models.CategoryTag || mongoose.model('CategoryTag', CategoryTagSchema);
