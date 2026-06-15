const mongoose = require('mongoose');
const { Schema } = mongoose;

const PackageHighlightSchema = new Schema({
    packageId: { type: Schema.Types.ObjectId, ref: 'Packages', required: true },
  highlights: [{ type: String, required: true }],
}, { timestamps: true });

// Prevent model overwrite upon repeated imports
module.exports = mongoose.models.PackageHighlight || mongoose.model('PackageHighlight', PackageHighlightSchema);
