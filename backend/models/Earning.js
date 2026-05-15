import mongoose from 'mongoose';

const earningSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  category: { type: String, default: 'Sale' },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const Earning = mongoose.model('Earning', earningSchema);
export default Earning;
