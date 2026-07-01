// Force HMR 1
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('user_token');
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
  
  const res = await fetch(`${API_URL}/auth/profile`, { headers });
  if (!res.ok) throw new Error(await res.text());
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
  const res = await fetch(`${API_URL}/lms/lessons/item/${itemId}/content`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateLessonContent = async (itemId, content) => {
  const res = await fetch(`${API_URL}/lms/lessons/item/${itemId}/content`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getLessonQuiz = async (itemId) => {
  const res = await fetch(`${API_URL}/lms/lessons/item/${itemId}/quiz`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateLessonQuiz = async (itemId, questions) => {
  const res = await fetch(`${API_URL}/lms/lessons/item/${itemId}/quiz`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify({ questions }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getLessonQa = async (itemId) => {
  const res = await fetch(`${API_URL}/lms/lessons/item/${itemId}/qa`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateLessonQa = async (itemId, qas) => {
  const res = await fetch(`${API_URL}/lms/lessons/item/${itemId}/qa`, {
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
export const uploadFile = async (file, type = 'others') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('lms_token')}`
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // returns { url: '/uploads/...' }
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

export const addAdminAffiliateSettlement = async (id, settlementData) => {
  const res = await fetch(`${API_URL}/admin/affiliates/${id}/settlements`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(settlementData),
  });
  if (!res.ok) throw new Error(await res.text());
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

export default api;
