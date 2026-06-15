import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  active:{type:Boolean,default:true},
  code:{type:String,required:true},
  heading:{type:String},
  paragraph: { type: String },
  mainPhoto: { url: { type: String }, key: { type: String } },
  relatedPhotos: [{ url: { type: String }, key: { type: String } }],
  
  prices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoomPrice' }],
  amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoomAmenities' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoomReview' }],
});

export default mongoose.models.Room || mongoose.model('Room', roomSchema);