import jwt from 'jsonwebtoken';
import { MAX_ACTIVE_TOKENS } from './src/config/constants.js';
import {
  filterExpiredTokens,
  isTokenActive
} from './src/utils/tokenUtils.js';

console.log('--- STARTING SIMULTANEOUS DEVICE LOGIN VERIFICATION ---');

// 1. Verify MAX_ACTIVE_TOKENS constant
if (MAX_ACTIVE_TOKENS !== 2) {
  console.error('FAIL: MAX_ACTIVE_TOKENS should be 2, got:', MAX_ACTIVE_TOKENS);
  process.exit(1);
} else {
  console.log('PASS: MAX_ACTIVE_TOKENS is 2');
}

// 2. Verify filterExpiredTokens
const secret = 'testsecret';
const validToken = jwt.sign({ id: 'user1' }, secret, { expiresIn: '1h' });
const expiredToken = jwt.sign({ id: 'user1', exp: Math.floor(Date.now() / 1000) - 100 }, secret);

const tokens = [validToken, expiredToken];
const filtered = filterExpiredTokens(tokens);

if (filtered.length !== 1 || filtered[0] !== validToken) {
  console.error('FAIL: filterExpiredTokens failed to remove expired token');
  process.exit(1);
} else {
  console.log('PASS: filterExpiredTokens correctly pruned expired JWT');
}

// 3. Verify isTokenActive
const activeTokens = ['tokenA', 'tokenB'];

if (!isTokenActive(activeTokens, 'tokenA') || !isTokenActive(activeTokens, 'tokenB')) {
  console.error('FAIL: isTokenActive failed for valid active token');
  process.exit(1);
} else {
  console.log('PASS: isTokenActive validated active tokens');
}

if (isTokenActive(activeTokens, 'tokenC')) {
  console.error('FAIL: isTokenActive returned true for unassociated token');
  process.exit(1);
} else {
  console.log('PASS: isTokenActive correctly rejected unassociated token');
}

// 4. Verify empty array isTokenActive returns false
if (isTokenActive([], 'tokenA')) {
  console.error('FAIL: isTokenActive returned true for empty array');
  process.exit(1);
} else {
  console.log('PASS: isTokenActive correctly rejected token when activeTokens is empty []');
}

console.log('--- ALL SIMULTANEOUS DEVICE LOGIN CHECKS PASSED ---');
