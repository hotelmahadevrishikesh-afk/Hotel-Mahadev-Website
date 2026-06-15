const mongoose = require('mongoose');

const RoomAmenitiesSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  iconKey: {
    type: String,
    required: false,
    trim: true
  }
});

module.exports = mongoose.models.RoomAmenities || mongoose.model('RoomAmenities', RoomAmenitiesSchema);
