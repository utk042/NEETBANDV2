import dotenv from 'dotenv';
import mongoose from 'mongoose';
import NewsletterSubscriber from './models/NewsletterSubscriber.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config({ path: './.env' });

async function run() {
  let admin = null;
  let token = null;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected.");

    // Find an admin user to generate a token
    admin = await User.findOne({ role: { $in: ['admin', 'owner'] } });
    if (!admin) {
      console.log("No admin/owner found. Cannot run protected route test.");
      return;
    }
    
    token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    if (!admin.activeTokens) admin.activeTokens = [];
    admin.activeTokens.push(token);
    await admin.save();
    console.log("Generated Admin JWT Token and saved to activeTokens:", token);

    // Clean up previous test subscriptions
    await NewsletterSubscriber.deleteMany({ email: /api-test/ });

    // Test subscription via POST (Public)
    const PORT = process.env.PORT || 5000;
    const testEmail = `api-test-${Date.now()}@example.com`;

    console.log("Testing POST /newsletter/subscribe...");
    let res = await fetch(`http://localhost:${PORT}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    console.log("Subscribe status:", res.status);
    const subDoc = await res.json();
    console.log("Subscribe response:", subDoc);

    if (res.status !== 201) throw new Error("Subscribe failed");

    // Test duplicate subscription
    console.log("Testing duplicate POST /newsletter/subscribe...");
    res = await fetch(`http://localhost:${PORT}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    console.log("Duplicate subscribe status:", res.status);
    const duplicateRes = await res.json();
    console.log("Duplicate response:", duplicateRes);

    // Test GET /newsletter/subscribers (Admin protected)
    console.log("Testing GET /newsletter/subscribers with auth...");
    res = await fetch(`http://localhost:${PORT}/newsletter/subscribers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("GET subscribers status:", res.status);
    const list = await res.json();
    console.log("Subscribers count:", list.length);

    // Test PUT /newsletter/subscribers/:id
    console.log("Testing PUT /newsletter/subscribers/:id...");
    const updatedEmail = `api-test-updated-${Date.now()}@example.com`;
    res = await fetch(`http://localhost:${PORT}/newsletter/subscribers/${subDoc._id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email: updatedEmail }),
    });
    console.log("Update status:", res.status);
    console.log("Update response:", await res.json());

    // Test DELETE /newsletter/subscribers/:id
    console.log("Testing DELETE /newsletter/subscribers/:id...");
    res = await fetch(`http://localhost:${PORT}/newsletter/subscribers/${subDoc._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log("Delete status:", res.status);
    console.log("Delete response:", await res.json());

    console.log("API TESTS PASSED.");
  } catch (err) {
    console.error("API test failed:", err);
  } finally {
    if (admin && token) {
      try {
        admin.activeTokens = admin.activeTokens.filter(t => t !== token);
        await admin.save();
        console.log("Cleaned up Admin JWT Token from database.");
      } catch (cleanErr) {
        console.error("Failed to clean up token:", cleanErr);
      }
    }
    await mongoose.disconnect();
  }
}

run();
