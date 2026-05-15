import express from 'express';
const router = express.Router();
import { getEarnings, createEarning, getReportsSummary } from '../controllers/earningsController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getEarnings).post(protect, createEarning);
router.get('/summary', protect, getReportsSummary);

export default router;
