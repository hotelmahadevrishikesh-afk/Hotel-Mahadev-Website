import mongoose from 'mongoose';

const RoomReviewSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
  },
  review: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
    trim: true,
  },
  image: { url: { type: String }, key: { type: String } },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.RoomReview || mongoose.model('RoomReview', RoomReviewSchema);
