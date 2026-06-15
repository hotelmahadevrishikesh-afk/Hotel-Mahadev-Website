const mongoose = require('mongoose');

const BookingDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  packagesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Packages' },
  bookingId: { type: String, required: true },
  arrival: { type: Date, required: true },
  departure: { type: Date },
  days: { type: Number, },
  specialReq: { type: String },
  offers: [{ type: String }],
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  callNo: { type: String, required: true },
  altCallNo: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  price: { type: Number },
  // Room summary details
  roomName: { type: String },
  packageName: { type: String },
  invoiceNumber:{type:String},
  priceBreakdown: {
    main: {
      type: { type: String },
      amount: { type: Number },
    },
    extraBed: {
      type: { type: String },
      amount: { type: Number },
    },
  },
  packagesPrices: {
    onePerson: [
      {
        type: { type: String },
        inr: { type: Number },
        usd: { type: Number }
      }
    ],
    twoPerson: [
      {
        type: { type: String },
        inr: { type: Number },
        usd: { type: Number }
      }
    ],
    eightPerson: [
      {
        type: { type: String },
        inr: { type: Number },
        usd: { type: Number }
      }
    ]
  },
  packageIdImage: {
    url: { type: String },
    key: { type: String }
  },
  accommodationType: { type: String },
  numPersons: { type: Number},
  subtotal: { type: Number },
  finalAmount: { type: Number },
  // In your BookingDetails model
payment: {
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  method: String,
  amount: Number,
  originalCurrency: { type: String, default: 'INR' },
  exchangeRate: { type: Number, default: 1 },
  amountInINR: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paidAt: Date,
  receipt: String,
  exchangeRateUpdatedAt: Date
},
status: { 
  type: String, 
  enum: ['pending_payment', 'confirmed', 'cancelled', 'completed'],
  default: 'pending_payment'
},
  type: { type: String, enum: ['room', 'packages'] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.BookingDetails || mongoose.model('BookingDetails', BookingDetailsSchema);
