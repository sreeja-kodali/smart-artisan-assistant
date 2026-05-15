import mongoose from 'mongoose';

const productionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  materials: { type: [{ type: String }], default: [] },
  materialCost: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const Production = mongoose.model('Production', productionSchema);
export default Production;
