import mongoose from 'mongoose';

const AskExpertsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  need: { type: String },
  question: { type: String, required: true },
  contactMethod: { type: String },
  queryName:{type:String},
  type: { type: String, required: true,enum:['instructor','packages','room'] },
  artisanId:{type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' },
  packagesId:{type: mongoose.Schema.Types.ObjectId, ref: 'Packages' },
  room:{type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AskExperts || mongoose.model('AskExperts', AskExpertsSchema);
