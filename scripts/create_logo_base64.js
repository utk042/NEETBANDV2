import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../frontend/src/assets/logo.png');
const outputPath = path.join(__dirname, '../frontend/src/utils/logoBase64.js');

const base64Logo = fs.readFileSync(logoPath).toString('base64');

const fileContent = `// Auto-generated Base64 Data URI for NEET Band Logo
// Guarantees logo rendering in Razorpay Checkout on localhost, HTTP, and HTTPS environments
export const NEET_BAND_LOGO_BASE64 = "data:image/png;base64,${base64Logo}";

export const getRazorpayLogo = () => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return \`\${window.location.origin}/logo.png\`;
  }
  return NEET_BAND_LOGO_BASE64;
};
`;

fs.writeFileSync(outputPath, fileContent);
console.log('logoBase64.js generated successfully at:', outputPath);
