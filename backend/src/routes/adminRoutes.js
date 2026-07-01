import express from 'express';
import { 
  getDashboardStats, 
  getStudents, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  addSettlement,
  getNewsScrollSettings,
  updateNewsScrollSettings
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'owner'), getDashboardStats);

router.get('/students', protect, authorize('admin', 'owner'), getStudents);
router.post('/students', protect, authorize('admin', 'owner'), createStudent);
router.put('/students/:id', protect, authorize('admin', 'owner'), updateStudent);
router.delete('/students/:id', protect, authorize('admin', 'owner'), deleteStudent);

// Affiliate routes
router.get('/affiliates', protect, authorize('admin', 'owner'), getAffiliates);
router.post('/affiliates', protect, authorize('admin', 'owner'), createAffiliate);
router.put('/affiliates/:id', protect, authorize('admin', 'owner'), updateAffiliate);
router.delete('/affiliates/:id', protect, authorize('admin', 'owner'), deleteAffiliate);
router.post('/affiliates/:id/settlements', protect, authorize('admin', 'owner'), addSettlement);

// News Scroll settings routes
router.get('/news-scroll', getNewsScrollSettings); // Public
router.put('/news-scroll', protect, authorize('admin', 'owner'), updateNewsScrollSettings); // Protected

export default router;
