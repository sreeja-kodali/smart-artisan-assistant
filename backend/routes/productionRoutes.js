import express from 'express';
const router = express.Router();
import { getProductionEntries, createProductionEntry, updateProductionEntry, deleteProductionEntry } from '../controllers/productionController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getProductionEntries).post(protect, createProductionEntry);
router.route('/:id').put(protect, updateProductionEntry).delete(protect, deleteProductionEntry);

export default router;
