import express from 'express';
const router = express.Router();
import { handleAnalyzeImage, handleAskQuestion } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/analyze', protect, handleAnalyzeImage);
router.post('/chat', protect, handleAskQuestion);

export default router;
