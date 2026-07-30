const fs = require('fs');
const path = 'c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/contexts/PlayerContext.jsx';
let content = fs.readFileSync(path, 'utf8');

// Remove updatePlayedWatermarks([])
content = content.replace(/[ \t]*updatePlayedWatermarks\(\[\]\);\n?/g, '');

// Remove updatePlayedWatermarks, from dependency arrays
content = content.replace(/ updatePlayedWatermarks,/g, '');
content = content.replace(/updatePlayedWatermarks, /g, '');

// Remove stopWatermark, from dependency arrays
content = content.replace(/ stopWatermark,/g, '');
content = content.replace(/stopWatermark, /g, '');

// Remove the watermark audio element completely
// The string is approximately: <audio\s+ref=\{watermarkAudioRef\}.*?\/>
content = content.replace(/[ \t]*<audio[^>]*ref=\{watermarkAudioRef\}[^>]*\/>\n?/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Cleanup successful');
