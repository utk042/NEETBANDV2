const data = {
  audioRollPositions: [20, 50, 90],
  audioRollUrl: '/uploads/NB_Audio_Roll.mp3',
  popupPositions: [20, 50, 90],
  popupHtml: '<div style="text-align: center; font-family: sans-serif; padding: 10px;"><h2 style="color: #ecc246; margin-bottom: 10px; font-size: 24px;">Love this song?</h2><p style="color: #e2e8f0; margin-bottom: 24px; font-size: 15px; line-height: 1.5;">Share it with your friends on WhatsApp and help us spread the word!</p><a href="https://api.whatsapp.com/send?text=Check%20out%20this%20awesome%20song%20on%20NeetBand!%20https://neetband.com" target="_blank" style="display: inline-flex; align-items: center; justify-content: center; background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; transition: opacity 0.2s; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>Share to WhatsApp</a></div>',
  guestAdUrl: '/uploads/guest_ad.mp3'
};
fetch('http://localhost:5000/api/ad-config', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(r => r.json()).then(console.log).catch(console.error);
