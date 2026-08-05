import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import JobPosition from './src/models/JobPosition.js';
import JobApplication from './src/models/JobApplication.js';

dotenv.config({ path: path.resolve('./backend/.env') });

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/neetband';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // 1. Create a dummy position
    const dummyPosition = new JobPosition({
      title: 'Video Editor Job in Kanpur | Reels & Social Media Video Editor Hiring',
      jobType: 'FULL-TIME',
      description: 'Video Editor Job in Kanpur (Social Media & Digital Marketing Company) CreaTech Squads is hiring a creative and skilled Video Editor...',
      location: 'Kanpur (Work from Office)',
      experience: '1–2 Years (Freshers with skills can apply) Years',
      salary: '₹10,000 – ₹25,000 + Incentives',
      status: 'active',
      order: 1
    });

    const savedPos = await dummyPosition.save();
    console.log('Saved Position:', savedPos._id, savedPos.title);

    // 2. Query public active positions
    const activePositions = await JobPosition.find({ status: 'active' });
    console.log('Active Positions Count:', activePositions.length);

    // 3. Create dummy application
    const dummyApp = new JobApplication({
      jobId: savedPos._id,
      jobTitle: savedPos.title,
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+91 9876543210',
      resumeUrl: 'https://drive.google.com/file/d/sample/view',
      coverLetter: 'I am an experienced video editor passionate about creating engaging educational reels.'
    });

    const savedApp = await dummyApp.save();
    console.log('Saved Application:', savedApp._id, savedApp.fullName);

    // 4. Query applications
    const apps = await JobApplication.find({ jobId: savedPos._id });
    console.log('Applications for Position:', apps.length);

    // Clean up test data
    await JobPosition.findByIdAndDelete(savedPos._id);
    await JobApplication.findByIdAndDelete(savedApp._id);
    console.log('Cleanup completed successfully.');

    await mongoose.disconnect();
    console.log('Test PASSED.');
    process.exit(0);
  } catch (err) {
    console.error('Test FAILED:', err);
    process.exit(1);
  }
};

runTest();
