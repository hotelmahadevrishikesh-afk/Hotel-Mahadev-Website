import mongoose from 'mongoose';

const QuantitySchema = new mongoose.Schema({
  packages: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages', required: true },
  prices: [
    {
      person: String, // "01", "02", "08"
      type: String,   // accommodation type
      inr: Number,
      usd: Number
    }
  ]
}, { timestamps: true });

export default mongoose.models.Quantity || mongoose.model('Quantity', QuantitySchema);
