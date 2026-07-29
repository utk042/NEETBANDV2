import mongoose from 'mongoose';
import { updateAdConfig, getAdConfig } from './src/controllers/adConfigController.js';
import AdConfig from './src/models/AdConfig.js';

async function run() {
  await mongoose.connect('mongodb+srv://B34STX:z1ywiPI6eYaHTjkC@cluster0.h8z24ls.mongodb.net/neetbanb_test_race');
  await AdConfig.deleteMany({});
  
  // Mock req/res
  const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    return res;
  };
  
  // Create initial config
  const initRes = mockRes();
  await getAdConfig({}, initRes);
  const version = initRes.body.__v;
  console.log('Initial version:', version);

  // Simulate two concurrent requests with the SAME version
  const req1 = { body: { version, adBannerText: 'Req1 text' } };
  const req2 = { body: { version, adBannerText: 'Req2 text' } };
  
  const res1 = mockRes();
  const res2 = mockRes();
  
  const p1 = updateAdConfig(req1, res1);
  const p2 = updateAdConfig(req2, res2);
  
  await Promise.all([p1, p2]);
  
  console.log('Req 1 status:', res1.statusCode || 200, res1.body.error || res1.body.adBannerText);
  console.log('Req 2 status:', res2.statusCode || 200, res2.body.error || res2.body.adBannerText);
  
  const final = await AdConfig.findOne();
  console.log('Final text in DB:', final.adBannerText, 'Version:', final.__v);
  
  await mongoose.disconnect();
}
run().catch(console.error);
