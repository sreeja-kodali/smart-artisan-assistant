import Earning from '../models/Earning.js';
import Production from '../models/Production.js';

export const getEarnings = async (req, res) => {
  try {
    const earnings = await Earning.find({ user: req.user._id }).sort({ date: -1 });
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createEarning = async (req, res) => {
  try {
    const { amount, source, category, status, quantity } = req.body;
    const earning = await Earning.create({
      user: req.user._id,
      amount: parseFloat(amount) || 0,
      source,
      category: category || 'Sale',
      status: status || 'Paid',
      quantity: parseInt(quantity, 10) || 1,
    });
    res.status(201).json(earning);
  } catch (error) {
    res.status(400).json({ message: 'Invalid earning data' });
  }
};

export const getReportsSummary = async (req, res) => {
  try {
    const totalEarnings = await Earning.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' }, paidAmount: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0] } }, pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0] } }, count: { $sum: 1 } } }
    ]);

    const totalProduction = await Production.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, count: { $sum: '$quantity' }, materialCost: { $sum: '$materialCost' } } }
    ]);

    res.json({
      totalEarnings: totalEarnings[0]?.total || 0,
      totalItemsProduced: totalProduction[0]?.count || 0,
      totalSales: totalEarnings[0]?.count || 0,
      paidAmount: totalEarnings[0]?.paidAmount || 0,
      pendingAmount: totalEarnings[0]?.pendingAmount || 0,
      totalMaterialCost: totalProduction[0]?.materialCost || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
