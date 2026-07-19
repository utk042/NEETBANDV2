// Force HMR 1
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Global Fetch Interceptor for sliding session token refresh
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    try {
      const newToken = response.headers.get('x-new-token');
      if (newToken) {
        let sentToken = null;
        const options = args[1];
        if (options && options.headers) {
          let authHeader = null;
          if (typeof options.headers.get === 'function') {
            authHeader = options.headers.get('Authorization') || options.headers.get('authorization');
          } else {
            authHeader = options.headers['Authorization'] || options.headers['authorization'];
          }
          if (authHeader && authHeader.startsWith('Bearer ')) {
            sentToken = authHeader.substring(7);
          }
        }
        
        if (sentToken) {
          if (localStorage.getItem('user_token') === sentToken) {
            localStorage.setItem('user_token', newToken);
          }
          if (localStorage.getItem('lms_token') === sentToken) {
            localStorage.setItem('lms_token', newToken);
          }
          if (localStorage.getItem('affiliate_token') === sentToken) {
            localStorage.setItem('affiliate_token', newToken);
          }
        }
      }
    } catch (err) {
      console.error('Error updating token from header:', err);
    }
    return response;
  };
}

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
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const register = async (name, email, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const loginWithSupabaseToken = async (accessToken) => {
  const res = await fetch(`${API_URL}/auth/supabase-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getUserProfile = async () => {
  const res = await fetch(`${API_URL}/auth/profile`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getLmsUserProfile = async () => {
  const res = await fetch(`${API_URL}/auth/profile`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAffiliateUserProfile = async () => {
  const token = localStorage.getItem('affiliate_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_URL}/affiliates/profile`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateUserProfile = async (userData) => {
  const res = await fetch(`${API_URL}/auth/profile`, {
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
  const res = await fetch(`${API_URL}/auth/profile`, {
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
  
  const res = await fetch(`${API_URL}/affiliates/profile`, {
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
export const getSongs = async () => {
  const res = await fetch(`${API_URL}/songs`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createSong = async (songData) => {
  const res = await fetch(`${API_URL}/songs`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(songData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateSong = async (id, songData) => {
  const res = await fetch(`${API_URL}/songs/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(songData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteSong = async (id) => {
  const res = await fetch(`${API_URL}/songs/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- LMS ---
export const getCourses = async () => {
  const res = await fetch(`${API_URL}/lms/courses`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getCourseById = async (id) => {
  const res = await fetch(`${API_URL}/lms/courses/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createCourse = async (courseData) => {
  const res = await fetch(`${API_URL}/lms/courses`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(courseData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateCourse = async (id, courseData) => {
  const res = await fetch(`${API_URL}/lms/courses/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(courseData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteCourse = async (id) => {
  const res = await fetch(`${API_URL}/lms/courses/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- LESSON DETAILS ---
export const getLessonContent = async (itemId) => {
  const res = await fetch(`${API_URL}/lms/items/${itemId}/content`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Course Progress
export const getCourseProgress = async (courseId) => {
  const res = await fetch(`${API_URL}/lms/courses/${courseId}/progress`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const markItemComplete = async (courseId, itemId) => {
  const res = await fetch(`${API_URL}/lms/courses/${courseId}/items/${itemId}/complete`, { 
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateLessonContent = async (itemId, content) => {
  const res = await fetch(`${API_URL}/lms/items/${itemId}/content`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getLessonQuiz = async (itemId) => {
  const res = await fetch(`${API_URL}/lms/items/${itemId}/quiz`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateLessonQuiz = async (itemId, questions) => {
  const res = await fetch(`${API_URL}/lms/items/${itemId}/quiz`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify({ questions }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getLessonQa = async (itemId) => {
  const res = await fetch(`${API_URL}/lms/items/${itemId}/qa`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateLessonQa = async (itemId, qas) => {
  const res = await fetch(`${API_URL}/lms/items/${itemId}/qa`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify({ qas }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getQuizByCourse = async (courseId) => {
  const res = await fetch(`${API_URL}/lms/quizzes/course/${courseId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const submitQuiz = async (quizId, answers) => {
  const res = await fetch(`${API_URL}/lms/quizzes/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ quizId, answers }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminStats = async () => {
  const res = await fetch(`${API_URL}/admin/stats`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminStudents = async () => {
  const res = await fetch(`${API_URL}/admin/students`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createAdminStudent = async (studentData) => {
  const res = await fetch(`${API_URL}/admin/students`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(studentData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateAdminStudent = async (id, studentData) => {
  const res = await fetch(`${API_URL}/admin/students/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(studentData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteAdminStudent = async (id) => {
  const res = await fetch(`${API_URL}/admin/students/${id}`, {
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

// --- PAYMENTS ---
export const createPaymentOrder = async (plan, discountCode) => {
  const res = await fetch(`${API_URL}/payments/order`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ plan, discountCode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const verifyPayment = async (verificationData) => {
  const res = await fetch(`${API_URL}/payments/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(verificationData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const verifyPromo = async (discountCode) => {
  const res = await fetch(`${API_URL}/payments/verify-promo`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ discountCode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const api = {
  get: async (path) => {
    const res = await fetch(`${API_URL}${path}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  },
  post: async (path, body = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  },
  put: async (path, body = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  },
  delete: async (path) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  }
};

// --- AFFILIATES ---
export const affiliateLogin = async (email, password) => {
  const res = await fetch(`${API_URL}/affiliates/login`, {
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
  const res = await fetch(`${API_URL}/affiliates/dashboard`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminAffiliates = async () => {
  const res = await fetch(`${API_URL}/admin/affiliates`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createAdminAffiliate = async (affiliateData) => {
  const res = await fetch(`${API_URL}/admin/affiliates`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(affiliateData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateAdminAffiliate = async (id, affiliateData) => {
  const res = await fetch(`${API_URL}/admin/affiliates/${id}`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(affiliateData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteAdminAffiliate = async (id) => {
  const res = await fetch(`${API_URL}/admin/affiliates/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const addAdminAffiliateWalletTransaction = async (id, transactionData) => {
  const res = await fetch(`${API_URL}/admin/affiliates/${id}/wallet`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(transactionData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const addAdminAffiliateReferral = async (id, referralData) => {
  const res = await fetch(`${API_URL}/admin/affiliates/${id}/referrals`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(referralData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const removeAdminAffiliateReferral = async (id, referralId) => {
  const res = await fetch(`${API_URL}/admin/affiliates/${id}/referrals/${referralId}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminWithdrawals = async () => {
  const res = await fetch(`${API_URL}/admin/withdrawals`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const processAdminWithdrawal = async (id, statusData) => {
  const res = await fetch(`${API_URL}/admin/withdrawals/${id}`, {
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
  
  const res = await fetch(`${API_URL}/affiliates/withdrawals`, {
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
  const res = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getContactMessages = async () => {
  const res = await fetch(`${API_URL}/contact`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const markContactMessageRead = async (id) => {
  const res = await fetch(`${API_URL}/contact/${id}/read`, {
    method: 'PUT',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteContactMessage = async (id) => {
  const res = await fetch(`${API_URL}/contact/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- NEWS SCROLLER ---
export const getNewsScrollSettings = async () => {
  const res = await fetch(`${API_URL}/admin/news-scroll`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateNewsScrollSettings = async (settingsData) => {
  const res = await fetch(`${API_URL}/admin/news-scroll`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(settingsData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- SONG ANALYTICS ---
export const recordSongPlay = async (id) => {
  await fetch(`${API_URL}/songs/${id}/play`, { method: 'POST' }).catch(() => {});
};

export const recordSongComplete = async (id) => {
  await fetch(`${API_URL}/songs/${id}/complete`, { method: 'POST' }).catch(() => {});
};

export const recordSongShare = async (id) => {
  await fetch(`${API_URL}/songs/${id}/share`, { method: 'POST' }).catch(() => {});
};

export const recordSongRepeat = async (id) => {
  await fetch(`${API_URL}/songs/${id}/repeat`, { method: 'POST' }).catch(() => {});
};

export const recordSongDropOff = async (id, segment) => {
  await fetch(`${API_URL}/songs/${id}/dropoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segment }),
  }).catch(() => {});
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
  const res = await fetch(`${API_URL}/newsletter/subscribe`, {
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
  const res = await fetch(`${API_URL}/newsletter/subscribers`, {
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateNewsletterSubscriber = async (id, email) => {
  const res = await fetch(`${API_URL}/newsletter/subscribers/${id}`, {
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
  const res = await fetch(`${API_URL}/newsletter/subscribers/${id}`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default api;
