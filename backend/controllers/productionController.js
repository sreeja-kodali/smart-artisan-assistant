import Production from '../models/Production.js';

export const getProductionEntries = async (req, res) => {
  try {
    const entries = await Production.find({ user: req.user._id }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProductionEntry = async (req, res) => {
  try {
    const { item, quantity, materials, materialCost, notes } = req.body;
    const entry = await Production.create({
      user: req.user._id,
      item,
      quantity,
      materials: Array.isArray(materials) ? materials : [],
      materialCost: parseFloat(materialCost) || 0,
      notes: notes || '',
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: 'Invalid entry data' });
  }
};

export const updateProductionEntry = async (req, res) => {
  try {
    const { item, quantity, materials, materialCost, notes } = req.body;
    const entry = await Production.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        item,
        quantity,
        materials: Array.isArray(materials) ? materials : [],
        materialCost: parseFloat(materialCost) || 0,
        notes: notes || '',
      },
      { new: true }
    );

    if (!entry) return res.status(404).json({ message: 'Production entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data' });
  }
};

export const deleteProductionEntry = async (req, res) => {
  try {
    const entry = await Production.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Production entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
