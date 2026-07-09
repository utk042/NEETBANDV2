import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { supabase } from '../config/supabaseClient.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
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

      // Manage active tokens (Max 3)
      const token = generateToken(user._id);
      if (!user.activeTokens) user.activeTokens = [];
      user.activeTokens.push(token);
      if (user.activeTokens.length > 3) {
        user.activeTokens = user.activeTokens.slice(-3);
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

export const updateUserProfile = async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (name) {
        user.name = name;
      }
      if (password) {
        user.password = password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        membershipPlan: updatedUser.membershipPlan,
        isPremium: updatedUser.isPremium,
        streak: updatedUser.streak,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const supabaseLoginUser = async (req, res) => {
  const { accessToken } = req.body;
  
  if (!accessToken) {
    return res.status(400).json({ message: 'Supabase Access Token is required' });
  }

  try {
    // 1. Verify token with Supabase Auth API
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !supabaseUser) {
      return res.status(401).json({ message: 'Invalid or expired Supabase token', error: error?.message });
    }

    const email = supabaseUser.email;
    const name = supabaseUser.user_metadata?.full_name || 
                 supabaseUser.user_metadata?.name || 
                 (supabaseUser.user_metadata?.given_name 
                    ? `${supabaseUser.user_metadata.given_name} ${supabaseUser.user_metadata.family_name || ''}`.trim() 
                    : '') ||
                 email.split('@')[0];

    // 2. Find or create user in MongoDB
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create user with a random dummy password to satisfy mongoose schema validation
      const dummyPassword = 'sb-auth-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      user = await User.create({
        name,
        email,
        password: dummyPassword,
        role: 'student',
        membershipPlan: 'none',
        isPremium: false,
        streak: 1,
        lastLoginDate: new Date()
      });
    } else {
      // Update name to match Google/provider metadata if present
      if (name) {
        user.name = name;
      }
      
      // Update streak and last login
      const now = new Date();
      const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
      let newStreak = user.streak || 0;

      if (lastLogin) {
        const diffTime = Math.abs(now - lastLogin);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      user.streak = newStreak;
      user.lastLoginDate = now;
    }

    // 3. Generate backend JWT
    const token = generateToken(user._id);
    if (!user.activeTokens) user.activeTokens = [];
    user.activeTokens.push(token);
    
    if (user.activeTokens.length > 3) {
      user.activeTokens = user.activeTokens.slice(-3);
    }
    
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      membershipPlan: user.membershipPlan,
      isPremium: user.isPremium,
      streak: user.streak,
      token,
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
