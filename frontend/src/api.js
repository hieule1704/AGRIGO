// src/api.js
// Wrapper goi API backend, tu dong gan Bearer token neu da dang nhap

const BASE = '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const t = token || localStorage.getItem('agrigo_token');
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  let data = {};
  try { data = await res.json(); } catch (_) { /* no body */ }

  if (!res.ok) {
    throw new Error(data.error || `Lỗi ${res.status}`);
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
