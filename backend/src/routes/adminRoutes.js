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
  addManualWalletTransaction,
  addManualAffiliateReferral,
  removeAffiliateReferral,
  getWithdrawalRequests,
  processWithdrawalRequest,
  getNewsScrollSettings,
  updateNewsScrollSettings
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getBookClaims, updateBookClaimStatus, getEyeCheckupClaims, updateEyeCheckupStatus } from '../controllers/offerAdminController.js';

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
router.post('/affiliates/:id/wallet', protect, authorize('admin', 'owner'), addManualWalletTransaction);
router.post('/affiliates/:id/referrals', protect, authorize('admin', 'owner'), addManualAffiliateReferral);
router.delete('/affiliates/:id/referrals/:referralId', protect, authorize('admin', 'owner'), removeAffiliateReferral);

// Withdrawal routes
router.get('/withdrawals', protect, authorize('admin', 'owner'), getWithdrawalRequests);
router.put('/withdrawals/:id', protect, authorize('admin', 'owner'), processWithdrawalRequest);

// News Scroll settings routes
router.get('/news-scroll', getNewsScrollSettings); // Public
router.put('/news-scroll', protect, authorize('admin', 'owner'), updateNewsScrollSettings); // Protected

// Offer Admin routes
router.get('/offers/book', protect, authorize('admin', 'owner'), getBookClaims);
router.put('/offers/book/:id', protect, authorize('admin', 'owner'), updateBookClaimStatus);
router.get('/offers/eye-checkup', protect, authorize('admin', 'owner'), getEyeCheckupClaims);
router.put('/offers/eye-checkup/:id', protect, authorize('admin', 'owner'), updateEyeCheckupStatus);

export default router;
