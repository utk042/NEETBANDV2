const fs = require('fs');
const lines = fs.readFileSync('src/services/api.js', 'utf8').split('\n');
const cleanLines = lines.slice(0, 1158); // Up to export default api;

const faqBlock = `

// --- FAQS ---
export const getFaqs = async (page) => {
  const url = page ? \`\${API_URL}/api/faqs?page=\${page}\` : \`\${API_URL}/api/faqs\`;
  const res = await apiFetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAllFaqs = async () => {
  const res = await apiFetch(\`\${API_URL}/api/faqs/all\`, { headers: getLmsHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createFaq = async (faqData) => {
  const res = await apiFetch(\`\${API_URL}/api/faqs\`, {
    method: 'POST',
    headers: getLmsHeaders(),
    body: JSON.stringify(faqData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateFaq = async (id, faqData) => {
  const res = await apiFetch(\`\${API_URL}/api/faqs/\${id}\`, {
    method: 'PUT',
    headers: getLmsHeaders(),
    body: JSON.stringify(faqData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteFaq = async (id) => {
  const res = await apiFetch(\`\${API_URL}/api/faqs/\${id}\`, {
    method: 'DELETE',
    headers: getLmsHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
`;

fs.writeFileSync('src/services/api.js', cleanLines.join('\n') + faqBlock);
console.log('Fixed api.js corruption');
