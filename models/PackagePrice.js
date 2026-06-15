import mongoose from 'mongoose';

const PriceDetailSchema = new mongoose.Schema({
  type: { type: String, required: true },
  inr: { type: Number, required: true },
  usd: { type: Number, required: true },
});

const PackagePriceSchema = new mongoose.Schema({
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages', required: true, unique: true },
  onePerson: [PriceDetailSchema], // Array for 1 person
  eightPerson: [PriceDetailSchema], // Array for 8 persons (minimum up to 8)
  tenPerson: [PriceDetailSchema], // Array for 10 persons (minimum up to 10)
  elevenToFourteenPerson: [PriceDetailSchema], // Array for 11 to 14 persons (minimum up to 14)
  fifteenToTwentyEightPerson: [PriceDetailSchema], // Array for 15 to 28 persons (minimum up to 28)
}, { timestamps: true });

export default mongoose.models.PackagePrice || mongoose.model('PackagePrice', PackagePriceSchema);
