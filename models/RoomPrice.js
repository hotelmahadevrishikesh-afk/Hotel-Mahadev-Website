import mongoose from 'mongoose';

const RoomPriceSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, unique: true },
  prices: [{
    type: { type: String, enum: ['01 Pax', '02 Pax', 'Extra Bed'], required: true },
    amount: { type: Number, required: true },
    oldPrice: { type: Number },
    cgst: { type: Number },
    sgst: { type: Number }
  }]
}, { timestamps: true });
export default mongoose.models.RoomPrice || mongoose.model('RoomPrice', RoomPriceSchema);
