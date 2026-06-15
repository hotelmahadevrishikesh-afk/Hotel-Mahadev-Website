import mongoose from 'mongoose';

const DescriptionSchema = new mongoose.Schema({
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages', required: true },
  overview: String,
  heading:String,
  description:String,
}, { timestamps: true });

export default mongoose.models.Description || mongoose.model('Description', DescriptionSchema);
