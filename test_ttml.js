const { DOMParser } = require('xmldom');
const fs = require('fs');

const files = [
  "C:\\Users\\UTKARSH\\Downloads\\OldSyncLyrics.ttml",
  "C:\\Users\\UTKARSH\\Downloads\\New2.ttml",
  "C:\\Users\\UTKARSH\\Downloads\\NewSyncLyrics.ttml"
];

const parseTTML = (text) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const pTags = doc.getElementsByTagName('p');
  return pTags.length;
};

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  try {
    const len = parseTTML(text);
    console.log(file, '-> found', len, 'tags');
  } catch(e) {
    console.error(file, '-> Error', e.message);
  }
}
