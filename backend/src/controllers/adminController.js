import User from '../models/User.js';
import Song from '../models/Song.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Affiliate from '../models/Affiliate.js';
import NewsScroll from '../models/NewsScroll.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const teachers = await User.countDocuments({ role: { $in: ['admin', 'owner'] } });
    
    const songs = await Song.find({});
    const totalTracks = songs.length;
    const premiumTracks = songs.filter(s => s.isPremium).length;
    const freeTracks = totalTracks - premiumTracks;
    
    const learningModules = await Course.countDocuments();
    const quizzes = await Quiz.countDocuments();
    
    // Calculate actual completionRate and average score dynamically
    const students = await User.find({ role: 'student' });
    let totalCoursesAssigned = 0;
    let completedCoursesCount = 0;
    let totalScoreSum = 0;
    let scoreRecordsCount = 0;

    students.forEach(student => {
      if (student.progress && student.progress.length > 0) {
        student.progress.forEach(p => {
          totalCoursesAssigned++;
          if (p.completed) completedCoursesCount++;
          if (p.score !== undefined && p.score > 0) {
            totalScoreSum += p.score;
            scoreRecordsCount++;
          }
        });
      }
    });

    const completionRate = totalCoursesAssigned > 0 ? Math.round((completedCoursesCount / totalCoursesAssigned) * 100) : 0;
    const avgScore = scoreRecordsCount > 0 ? Math.round(totalScoreSum / scoreRecordsCount) : 0;
    
    res.json({
      totalStudents,
      teachers,
      totalTracks,
      premiumTracks,
      freeTracks,
      learningModules,
      quizzes,
      completionRate,
      avgScore
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new student manually
// @route   POST /api/admin/students
// @access  Private/Admin
export const createStudent = async (req, res) => {
  const { name, email, password, role, membershipPlan, isPremium } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      membershipPlan: membershipPlan || 'none',
      isPremium: isPremium || false,
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a student
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
export const updateStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.role) user.role = req.body.role;
      if (req.body.membershipPlan) user.membershipPlan = req.body.membershipPlan;
      if (req.body.isPremium !== undefined) user.isPremium = req.body.isPremium;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        membershipPlan: updatedUser.membershipPlan,
        isPremium: updatedUser.isPremium,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a student
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
export const deleteStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- AFFILIATES ---

export const getAffiliates = async (req, res) => {
  try {
    const affiliates = await Affiliate.find().select('-password').populate('affiliatedUsers.userId', 'name email');
    
    // Add computed wallet balances to each affiliate
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all pending and completed withdrawals to subtract
    const allWithdrawals = await WithdrawalRequest.find();

    const affiliatesWithBalances = affiliates.map(affiliate => {
      let totalEarned = 0;
      let availableCommissions = 0;

      if (affiliate.walletTransactions && affiliate.walletTransactions.length > 0) {
        affiliate.walletTransactions.forEach(tx => {
          if (tx.type === 'commission' || tx.type === 'manual_addition') {
            totalEarned += tx.amount;
            if (new Date(tx.date) <= sevenDaysAgo || tx.type === 'manual_addition') {
              availableCommissions += tx.amount;
            }
          } else if (tx.type === 'manual_deduction') {
            totalEarned -= tx.amount;
            availableCommissions -= tx.amount;
          }
        });
      }

      const affiliateWithdrawals = allWithdrawals.filter(w => w.affiliateId.toString() === affiliate._id.toString());
      let totalDeductions = 0;
      affiliateWithdrawals.forEach(w => {
        if (w.status === 'completed' || w.status === 'pending') {
          totalDeductions += w.amount;
        }
      });

      const withdrawableBalance = Math.max(0, availableCommissions - totalDeductions);

      return {
        ...affiliate.toObject(),
        walletBalance: totalEarned,
        withdrawableBalance
      };
    });

    res.json(affiliatesWithBalances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAffiliate = async (req, res) => {
  try {
    const affiliate = await Affiliate.create(req.body);
    res.status(201).json(affiliate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAffiliate = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const affiliate = await Affiliate.findById(req.params.id);
    if (affiliate) {
      Object.assign(affiliate, updateData);
      if (password) {
        affiliate.password = password;
      }
      await affiliate.save();
      res.json(affiliate);
    } else {
      res.status(404).json({ message: 'Affiliate not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAffiliate = async (req, res) => {
  try {
    const affiliate = await Affiliate.findByIdAndDelete(req.params.id);
    if (affiliate) {
      res.json({ message: 'Affiliate removed' });
    } else {
      res.status(404).json({ message: 'Affiliate not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addManualWalletTransaction = async (req, res) => {
  try {
    const { type, amount, notes } = req.body;
    
    if (!['manual_addition', 'manual_deduction'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    const affiliate = await Affiliate.findById(req.params.id);
    if (affiliate) {
      affiliate.walletTransactions.push({ type, amount, notes });
      await affiliate.save();
      res.json(affiliate);
    } else {
      res.status(404).json({ message: 'Affiliate not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addManualAffiliateReferral = async (req, res) => {
  try {
    const { name, email, plan, isPaid, commissionAmount } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required for manual referral' });
    }

    const affiliate = await Affiliate.findById(req.params.id);
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    affiliate.affiliatedUsers.push({
      manualName: name,
      manualEmail: email,
      plan: plan || 'none',
      joinedAt: Date.now()
    });

    if (isPaid === false && Number(commissionAmount) > 0) {
      affiliate.walletTransactions.push({
        type: 'manual_addition',
        amount: Number(commissionAmount),
        notes: `Manual referral commission: ${name}`
      });
    }

    await affiliate.save();
    res.json(affiliate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeAffiliateReferral = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    const referralIndex = affiliate.affiliatedUsers.findIndex(r => r._id.toString() === req.params.referralId);
    if (referralIndex === -1) {
      return res.status(404).json({ message: 'Referral not found in this affiliate' });
    }

    affiliate.affiliatedUsers.splice(referralIndex, 1);
    await affiliate.save();
    res.json(affiliate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWithdrawalRequests = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find().populate('affiliateId', 'name email promoCode').sort({ requestedAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const processWithdrawalRequest = async (req, res) => {
  try {
    const { status, rejectReason } = req.body;
    
    if (!['completed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (status === 'rejected' && !rejectReason) {
      return res.status(400).json({ message: 'Reject reason is required when rejecting a withdrawal request' });
    }

    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal request is already processed' });
    }

    withdrawal.status = status;
    withdrawal.processedAt = Date.now();
    if (status === 'rejected') {
      withdrawal.rejectReason = rejectReason;
    }

    await withdrawal.save();
    res.json(withdrawal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get news scroll settings
// @route   GET /api/admin/news-scroll
// @access  Public
export const getNewsScrollSettings = async (req, res) => {
  try {
    let settings = await NewsScroll.findOne();
    if (!settings) {
      settings = await NewsScroll.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching news scroll settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update news scroll settings
// @route   PUT /api/admin/news-scroll
// @access  Private/Admin
export const updateNewsScrollSettings = async (req, res) => {
  const { enabled, items, resetOnly } = req.body;
  try {
    let settings = await NewsScroll.findOne();
    if (!settings) {
      settings = new NewsScroll({});
    }

    if (resetOnly) {
      settings.updatedAt = Date.now();
    } else {
      if (enabled !== undefined) {
        settings.enabled = enabled;
      }
      if (items !== undefined) {
        if (!Array.isArray(items)) {
          return res.status(400).json({ message: 'Items must be an array of strings' });
        }
        if (items.length > 5) {
          return res.status(400).json({ message: 'News scroller can display a maximum of 5 items' });
        }
        for (let item of items) {
          if (typeof item !== 'string') {
            return res.status(400).json({ message: 'Each item must be a string' });
          }
          if (item.length > 80) {
            return res.status(400).json({ message: 'Each news item must be 80 characters or less' });
          }
        }
        settings.items = items;
      }
      settings.updatedAt = Date.now();
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating news scroll settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
