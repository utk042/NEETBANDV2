import mongoose from 'mongoose';
import Song from './src/models/Song.js';
import { updateSong } from './src/controllers/songController.js';

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.data = data; return res; };
  return res;
};

async function testOCC() {
  await mongoose.connect('mongodb://127.0.0.1:27017/neetband_test_occ');
  await Song.deleteMany({});
  
  const song = await Song.create({ title: 'OCC Test Song', audioUrl: 'http://test.com/audio.mp3', duration: 120 });
  console.log('Created song with __v:', song.__v);

  const req1 = {
    params: { id: song._id },
    body: { title: 'Admin 1 Update', audioUrl: 'http://test.com/audio.mp3', __v: song.__v }
  };
  const res1 = mockRes();
  await updateSong(req1, res1);
  console.log('Admin 1 Response Code:', res1.statusCode || 200);
  console.log('Admin 1 Data __v:', res1.data.__v);

  const req2 = {
    params: { id: song._id },
    body: { title: 'Admin 2 Update', audioUrl: 'http://test.com/audio.mp3', __v: song.__v }
  };
  const res2 = mockRes();
  await updateSong(req2, res2);
  console.log('Admin 2 Response Code:', res2.statusCode); // should be 409
  console.log('Admin 2 Response Message:', res2.data?.message);

  await mongoose.disconnect();
}

testOCC().catch(console.error);
