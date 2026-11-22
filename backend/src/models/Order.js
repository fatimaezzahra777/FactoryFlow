const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../utils/constants');
const { strictlyPositive } = require('../utils/validators');

// Copie de la composition du produit AU MOMENT de la création de l'ordre
const compositionLineSchema = new mongoose.Schema(
  {
    matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'MatierePremiere', required: true },
    quantite: { type: Number, required: true, validate: strictlyPositive }, // par unité de produit
  },
  { _id: false }
);

const orderLineSchema = new mongoose.Schema(
  {
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
    reference: { type: String, required: true },
    name: { type: String, required: true },
    quantite: {
      type: Number,
      required: [true, 'La quantité est obligatoire'],
      validate: strictlyPositive,
    },
    composition: { type: [compositionLineSchema], default: [] },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    lines: {
      type: [orderLineSchema],
      validate: {
        validator: (value) => value.length > 0,
        message: 'Un ordre doit contenir au moins un produit',
      },
    },
    status: {
      type: String,
      enum: { values: Object.values(ORDER_STATUS), message: 'Statut invalide' },
      default: ORDER_STATUS.PLANNED,
      index: true,
    },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'lines.produit': 1 });

module.exports = mongoose.model('Order', orderSchema);
