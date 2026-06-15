import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages', required: true, unique: true },
  videos: [{ url: String, description: String }],
}, { timestamps: true });

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
