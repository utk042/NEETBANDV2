import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    if (user) {
      const token = generateToken(user._id);
      user.activeTokens = [token];
      await user.save();
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      // Calculate streak
      const now = new Date();
      const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
      let newStreak = user.streak || 0;

      if (lastLogin) {
        const diffTime = Math.abs(now - lastLogin);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays === 1) {
          // Logged in yesterday, increment streak
          newStreak += 1;
        } else if (diffDays > 1) {
          // Streak broken
          newStreak = 1;
        }
        // If diffDays === 0, same day, do not change streak
      } else {
        // First login
        newStreak = 1;
      }

      // Manage active tokens (Max 2)
      const token = generateToken(user._id);
      if (!user.activeTokens) user.activeTokens = [];
      user.activeTokens.push(token);
      if (user.activeTokens.length > 2) {
        user.activeTokens = user.activeTokens.slice(-2);
      }

      user.streak = newStreak;
      user.lastLoginDate = now;
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipPlan: user.membershipPlan,
        streak: user.streak,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('progress.courseId');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
