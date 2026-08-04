const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * apiFetch — a contained fetch wrapper for NeetBand API calls only.
 * Handles sliding-session token refresh without touching window.fetch
 * (which would break Supabase and other third-party SDKs).
 *
 * Token refresh rule: only the exact token that was SENT gets refreshed.
 * This prevents user/affiliate/lms tokens from cross-contaminating each other.
 */
const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  try {
    const newToken = response.headers.get('x-new-token');
    if (newToken) {
      const authHeader =
        (options.headers?.['Authorization'] || options.headers?.['authorization'] || '');
      if (authHeader.startsWith('Bearer ')) {
        const sentToken = authHeader.substring(7);
        // Only update the specific token store that was used — no cross-contamination
        if (localStorage.getItem('user_token') === sentToken) {
          localStorage.setItem('user_token', newToken);
        } else if (localStorage.getItem('lms_token') === sentToken) {
          localStorage.setItem('lms_token', newToken);
        } else if (localStorage.getItem('affiliate_token') === sentToken) {
          localStorage.setItem('affiliate_token', newToken);
        }
      }
    }
  } catch (err) {
    // Non-fatal: token refresh failure should not break the actual API response
    console.warn('apiFetch: token refresh error', err);
  }
  return response;
};

const getHeaders = () => {
  const isLms = typeof window !== 'undefined' && window.location.pathname.startsWith('/lms');
  const token = isLms
    ? (localStorage.getItem('lms_token') || localStorage.getItem('user_token'))
    : (localStorage.getItem('user_token') || localStorage.getItem('lms_token'));
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const getLmsHeaders = () => {
  const token = localStorage.getItem('lms_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- AUTH ---
export const login = async (email, password) => {
  const res = await apiFetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const register = async (name, email, password) => {
  const res = await apiFetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const loginWithSupabaseToken = async (accessToken) => {
  const res = await apiFetch(`${API_URL}/auth/supabase-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getUserProfile = async () => {
  const res = await apiFetch(`${API_URL}/auth/profile`, { headers: getHeaders() });
  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(errText);
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const getLmsUserProfile = async () => {
  const res = await apiFetch(`${API_URL}/auth/profile`, { headers: getLmsHeaders() });
  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(errText);
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const getAffiliateUserProfile = async () => {
  const token = localStorage.getItem('affiliate_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await apiFetch(`${API_URL}/affiliates/profile`, { headers });
  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(errText);
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const updateUserProfile = async (userData) => {
  const res = await apiFetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errText = await res.text();
    try {
      const parsed = JSON.parse(errText);
      throw new Error(parsed.message || 'Failed to update profile');
    } catch {
      throw new Error(errText || 'Failed to update profile');
    }
  }
  return res.json();
};

export const updateLmsUserProfile = async (userData) => {
  const res = await apiFetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errText = await res.text();
    try {
      const parsed = JSON.parse(errText);
      throw new Error(parsed.message || 'Failed to update LMS profile');
    } catch {
      throw new Error(errText || 'Failed to update LMS profile');
    }
  }
  return res.json();
};

export const updateAffiliateProfile = async (userData) => {
  const token = localStorage.getItem('affiliate_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await apiFetch(`${API_URL}/affiliates/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errText = await res.text();
    try {
      const parsed = JSON.parse(errText);
      throw new Error(parsed.message || 'Failed to update affiliate profile');
    } catch {
      throw new Error(errText || 'Failed to update affiliate profile');
    }
  }
  return res.json();
};

// --- SONGS ---
export const getSongs = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await apiFetch(`${API_URL}/songs${queryString}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createSong = async (songData) => {
  const res = await apiFetch(`${API_URL}/songs`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(songData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateSong = async (id, songData) => {
  const res = await apiFetch(`${API_URL}/songs/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(songData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteSong = async (id) => {
  const res = await apiFetch(`${API_URL}/songs/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- CATEGORIES ---
export const getCategories = async () => {
  const res = await apiFetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- LMS ---
export const getCourses = async () => {
  const res = await apiFetch(`${API_URL}/lms/courses`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getCourseById = async (id) => {
  const res = await apiFetch(`${API_URL}/lms/courses/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createCourse = async (courseData) => {
  const res = await apiFetch(`${API_URL}/lms/courses`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(courseData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateCourse = async (id, courseData) => {
  const res = await apiFetch(`${API_URL}/lms/courses/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(courseData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteCourse = async (id) => {
  const res = await apiFetch(`${API_URL}/lms/courses/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- LESSON DETAILS ---
export const getLessonContent = async (itemId) => {
  const res = await apiFetch(`${API_URL}/lms/items/${itemId}/content`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Course Progress
export const getCourseProgress = async (courseId) => {
  const res = await apiFetch(`${API_URL}/lms/courses/${courseId}/progress`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const markItemComplete = async (courseId, itemId) => {
  const res = await apiFetch(`${API_URL}/lms/courses/${courseId}/items/${itemId}/complete`, { 
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateLessonContent = async (itemId, content) => {
  const res = await apiFetch(`${API_URL}/lms/items/${itemId}/content`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getLessonQuiz = async (itemId) => {
  const res = await apiFetch(`${API_URL}/lms/items/${itemId}/quiz`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateLessonQuiz = async (itemId, quizPayload) => {
  const body = Array.isArray(quizPayload) ? { questions: quizPayload } : quizPayload;
  const res = await apiFetch(`${API_URL}/lms/items/${itemId}/quiz`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getLessonQa = async (itemId) => {
  const res = await apiFetch(`${API_URL}/lms/items/${itemId}/qa`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateLessonQa = async (itemId, qas) => {
  const res = await apiFetch(`${API_URL}/lms/items/${itemId}/qa`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify({ qas }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getQuizByCourse = async (courseId) => {
  const res = await apiFetch(`${API_URL}/lms/quizzes/course/${courseId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const submitQuiz = async (quizId, answers) => {
  const res = await apiFetch(`${API_URL}/lms/quizzes/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ quizId, answers }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminStats = async () => {
  const res = await apiFetch(`${API_URL}/admin/stats`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminStudents = async () => {
  const res = await apiFetch(`${API_URL}/admin/students`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createAdminStudent = async (studentData) => {
  const res = await apiFetch(`${API_URL}/admin/students`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(studentData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateAdminStudent = async (id, studentData) => {
  const res = await apiFetch(`${API_URL}/admin/students/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(studentData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteAdminStudent = async (id) => {
  const res = await apiFetch(`${API_URL}/admin/students/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- FILE UPLOADS ---
export const uploadFile = (file, type = 'others', onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/upload`);
    
    const token = localStorage.getItem('lms_token') || localStorage.getItem('user_token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          onProgress(percentCompleted);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      } else {
        reject(new Error(xhr.responseText || 'Upload failed'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during upload'));
    };

    xhr.send(formData);
  });
};

export const parseDocumentFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/upload/parse`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('lms_token')}`
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // returns { text: '...' }
};

export const deleteUploadedFile = async (url) => {
  try {
    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) return;
    await apiFetch(`${API_URL}/upload`, {
      method: 'DELETE',
      headers: getLmsHeaders(),
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    console.warn('[Upload] Delete file error:', err);
  }
};

// --- PAYMENTS ---
export const createPaymentOrder = async (plan, discountCode, shippingDetails) => {
  const res = await apiFetch(`${API_URL}/payments/order`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ plan, discountCode, shippingDetails }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const verifyPayment = async (verificationData) => {
  const res = await apiFetch(`${API_URL}/payments/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(verificationData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const verifyPromo = async (discountCode, plan = null) => {
  const res = await apiFetch(`${API_URL}/payments/verify-promo`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ discountCode, plan }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- COUPONS ---
export const getCoupons = async () => {
  const res = await apiFetch(`${API_URL}/admin/coupons`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createCoupon = async (couponData) => {
  const res = await apiFetch(`${API_URL}/admin/coupons`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(couponData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateCoupon = async (id, couponData) => {
  const res = await apiFetch(`${API_URL}/admin/coupons/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(couponData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteCoupon = async (id) => {
  const res = await apiFetch(`${API_URL}/admin/coupons/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const toggleCouponStatus = async (id) => {
  const res = await apiFetch(`${API_URL}/admin/coupons/${id}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const api = {
  get: async (path) => {
    const res = await apiFetch(`${API_URL}${path}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  },
  post: async (path, body = {}) => {
    const res = await apiFetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  },
  put: async (path, body = {}) => {
    const res = await apiFetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  },
  delete: async (path) => {
    const res = await apiFetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  }
};

// --- AFFILIATES ---
export const affiliateLogin = async (email, password) => {
  const res = await apiFetch(`${API_URL}/affiliates/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAffiliateDashboard = async () => {
  const token = localStorage.getItem('affiliate_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await apiFetch(`${API_URL}/affiliates/dashboard`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminAffiliates = async () => {
  const res = await apiFetch(`${API_URL}/admin/affiliates`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createAdminAffiliate = async (affiliateData) => {
  const res = await apiFetch(`${API_URL}/admin/affiliates`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(affiliateData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateAdminAffiliate = async (id, affiliateData) => {
  const res = await apiFetch(`${API_URL}/admin/affiliates/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(affiliateData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteAdminAffiliate = async (id) => {
  const res = await apiFetch(`${API_URL}/admin/affiliates/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const addAdminAffiliateWalletTransaction = async (id, transactionData) => {
  const res = await apiFetch(`${API_URL}/admin/affiliates/${id}/wallet`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(transactionData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const addAdminAffiliateReferral = async (id, referralData) => {
  const res = await apiFetch(`${API_URL}/admin/affiliates/${id}/referrals`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(referralData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const removeAdminAffiliateReferral = async (id, referralId) => {
  const res = await apiFetch(`${API_URL}/admin/affiliates/${id}/referrals/${referralId}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminWithdrawals = async () => {
  const res = await apiFetch(`${API_URL}/admin/withdrawals`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const processAdminWithdrawal = async (id, statusData) => {
  const res = await apiFetch(`${API_URL}/admin/withdrawals/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(statusData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const requestAffiliateWithdrawal = async (withdrawalData) => {
  const token = localStorage.getItem('affiliate_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await apiFetch(`${API_URL}/affiliates/withdrawals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(withdrawalData),
  });
  if (!res.ok) {
    const errText = await res.text();
    try {
      const parsed = JSON.parse(errText);
      throw new Error(parsed.message || 'Failed to request withdrawal');
    } catch {
      throw new Error(errText || 'Failed to request withdrawal');
    }
  }
  return res.json();
};

// --- CONTACT MESSAGES ---
export const createContactMessage = async (messageData) => {
  const res = await apiFetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getContactMessages = async () => {
  const res = await apiFetch(`${API_URL}/contact`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const markContactMessageRead = async (id) => {
  const res = await apiFetch(`${API_URL}/contact/${id}/read`, {
    method: 'PUT',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteContactMessage = async (id) => {
  const res = await apiFetch(`${API_URL}/contact/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- NEWS SCROLLER ---
export const getNewsScrollSettings = async () => {
  const res = await apiFetch(`${API_URL}/admin/news-scroll`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateNewsScrollSettings = async (settingsData) => {
  const res = await apiFetch(`${API_URL}/admin/news-scroll`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(settingsData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- SONG ANALYTICS ---
const idempotencyKeys = new Map();
const makeIdempotencyKey = (id, event) => {
  const cacheKey = `${id}-${event}`;
  const now = Date.now();
  if (idempotencyKeys.has(cacheKey)) {
    const { key, timestamp } = idempotencyKeys.get(cacheKey);
    if (now - timestamp < 10000) { // 10 seconds TTL
      return key;
    }
  }
  const newKey = `${id}-${event}-${now}-${Math.random().toString(36).substring(2, 7)}`;
  idempotencyKeys.set(cacheKey, { key: newKey, timestamp: now });
  return newKey;
};

export const recordSongPlay = async (id) => {
  try {
    await fetch(`${API_URL}/songs/${id}/play`, {
      method: 'POST',
      headers: { 'X-Idempotency-Key': makeIdempotencyKey(id, 'play') }
    });
  } catch (err) {
    console.warn('[Analytics] recordSongPlay error:', err.message || err);
  }
};

export const recordSongComplete = async (id) => {
  try {
    await fetch(`${API_URL}/songs/${id}/complete`, {
      method: 'POST',
      headers: { 'X-Idempotency-Key': makeIdempotencyKey(id, 'complete') }
    });
  } catch (err) {
    console.warn('[Analytics] recordSongComplete error:', err.message || err);
  }
};

export const recordSongShare = async (id) => {
  try {
    await fetch(`${API_URL}/songs/${id}/share`, {
      method: 'POST',
      headers: { 'X-Idempotency-Key': makeIdempotencyKey(id, 'share') }
    });
  } catch (err) {
    console.warn('[Analytics] recordSongShare error:', err.message || err);
  }
};

export const recordSongRepeat = async (id) => {
  try {
    await fetch(`${API_URL}/songs/${id}/repeat`, {
      method: 'POST',
      headers: { 'X-Idempotency-Key': makeIdempotencyKey(id, 'repeat') }
    });
  } catch (err) {
    console.warn('[Analytics] recordSongRepeat error:', err.message || err);
  }
};

export const recordSongDropOff = async (id, segment) => {
  try {
    await fetch(`${API_URL}/songs/${id}/dropoff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': makeIdempotencyKey(id, `dropoff-${segment}`)
      },
      body: JSON.stringify({ segment }),
    });
  } catch (err) {
    console.warn('[Analytics] recordSongDropOff error:', err.message || err);
  }
};

export const getSongAnalytics = async (id) => {
  const res = await fetch(`${API_URL}/songs/${id}/analytics`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAllSongAnalytics = async () => {
  const res = await fetch(`${API_URL}/songs/analytics`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- NEWSLETTER ---
export const subscribeNewsletter = async (email) => {
  const res = await apiFetch(`${API_URL}/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const errText = await res.text();
    try {
      const parsed = JSON.parse(errText);
      throw new Error(parsed.message || 'Subscription failed');
    } catch {
      throw new Error(errText || 'Subscription failed');
    }
  }
  return res.json();
};

export const getNewsletterSubscribers = async () => {
  const res = await apiFetch(`${API_URL}/newsletter/subscribers`, {
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateNewsletterSubscriber = async (id, email) => {
  const res = await apiFetch(`${API_URL}/newsletter/subscribers/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const errText = await res.text();
    try {
      const parsed = JSON.parse(errText);
      throw new Error(parsed.message || 'Update failed');
    } catch {
      throw new Error(errText || 'Update failed');
    }
  }
  return res.json();
};

export const deleteNewsletterSubscriber = async (id) => {
  const res = await apiFetch(`${API_URL}/newsletter/subscribers/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- MEMBER BENEFITS ---
export const getBenefits = async () => {
  const res = await apiFetch(`${API_URL}/benefits`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminBenefits = async () => {
  const res = await apiFetch(`${API_URL}/benefits/admin/all`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createBenefit = async (benefitData) => {
  const res = await apiFetch(`${API_URL}/benefits`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(benefitData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateBenefit = async (id, benefitData) => {
  const res = await apiFetch(`${API_URL}/benefits/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(benefitData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteBenefit = async (id) => {
  const res = await apiFetch(`${API_URL}/benefits/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const toggleBenefitAvailability = async (id) => {
  const res = await apiFetch(`${API_URL}/benefits/${id}/toggle`, {
    method: 'PATCH',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default api;
