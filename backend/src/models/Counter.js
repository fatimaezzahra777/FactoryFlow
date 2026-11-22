const mongoose = require('mongoose');

// Compteur pour numéroter les ordres (OF-0001, OF-0002...)
const counterSchema = new mongoose.Schema(
  { _id: { type: String }, seq: { type: Number, default: 0 } },
  { versionKey: false }
);

module.exports = mongoose.model('Counter', counterSchema);
