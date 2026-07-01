import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const uri = "mongodb+srv://B34STX:z1ywiPI6eYaHTjkC@cluster0.h8z24ls.mongodb.net/neetband";
const JWT_SECRET = "your_jwt_secret_key_here";

async function test() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({});
    
    if (!user) {
      console.log("No user found");
      process.exit(1);
    }
    
    console.log("Found user:", user._id);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
    const res = await fetch("http://localhost:5000/api/payments/order", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan: "premium_scholar" })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

test();
