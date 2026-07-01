import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import lmsRoutes from './routes/lmsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import affiliateRoutes from './routes/affiliateRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/auth', authRoutes);
app.use('/songs', songRoutes);
app.use('/lms', lmsRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/blogs', blogRoutes);
app.use('/forums', forumRoutes);
app.use('/affiliates', affiliateRoutes);
app.use('/contact', contactRoutes);
app.use('/upload', uploadRoutes);

console.log("Admin routes mounted to /admin");

// Base route
app.get('/', (req, res) => {
  res.send('NeetBand API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
