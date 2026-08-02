// src/api.js
// Wrapper goi API backend, tu dong gan Bearer token neu da dang nhap

function sanitizeBaseUrl(url) {
  if (!url) return '/api';
  let cleaned = url.trim();
  if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
  if (cleaned.startsWith('http') && !cleaned.endsWith('/api')) {
    cleaned += '/api';
  }
  return cleaned;
}

const BASE = sanitizeBaseUrl(import.meta.env.VITE_API_URL);

export function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  let origin = BASE;
  if (origin.endsWith('/api')) origin = origin.replace(/\/api$/, '');
  if (origin.endsWith('/')) origin = origin.slice(0, -1);
  
  return origin + (url.startsWith('/') ? url : '/' + url);
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const t = token || localStorage.getItem('agrigo_token');
  if (t) headers.Authorization = `Bearer ${t}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  } catch (err) {
    console.error('Lỗi kết nối API Backend:', err);
    throw new Error('🔌 Không thể kết nối tới Backend server. Nếu đang dùng Render (Free-Tier), máy chủ có thể đang khởi động lại (Cold Start). Vui lòng chờ 15 - 30 giây rồi thử lại!');
  }

  let data = {};
  try { data = await res.json(); } catch (_) { /* no body */ }

  if (!res.ok) {
    throw new Error(data.error || `Lỗi ${res.status}: ${res.statusText}`);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),

  upload: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const headers = {};
    const t = localStorage.getItem('agrigo_token');
    if (t) headers.Authorization = `Bearer ${t}`;

    const res = await fetch(BASE + '/upload', {
      method: 'POST',
      headers,
      body: formData,
    });

    let data = {};
    try { data = await res.json(); } catch (_) { /* no body */ }

    if (!res.ok) {
      throw new Error(data.error || `Lỗi upload ${res.status}`);
    }
    return data;
  },
};
