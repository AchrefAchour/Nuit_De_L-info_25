const API_BASE = import.meta.env.VITE_API_URL || '/api';
console.log('[API] API_BASE configured as:', API_BASE); // Debug log

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('[API] Token found in localStorage, length:', token.length);
    return { Authorization: `Bearer ${token}` };
  } else {
    console.log('[API] No token found in localStorage');
    return {};
  }
};

const handleResponse = async (response) => {
  // Check if response has content
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  
  // If response is empty, throw a meaningful error
  if (!text || text.trim() === '') {
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: Le serveur n'a pas renvoyé de réponse. Vérifiez que le backend est lancé sur http://localhost:5000`);
    }
    return null;
  }
  
  // Try to parse JSON
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: Réponse invalide du serveur`);
    }
    throw new Error('Réponse invalide du serveur (non-JSON)');
  }
  
  if (!response.ok) {
    // Include validation details if available
    const error = new Error(data.error || data.message || `Erreur ${response.status}: Une erreur est survenue`);
    if (data.details) {
      error.details = data.details;
    }
    if (data.message) {
      error.message = data.message;
    }
    throw error;
  }
  return data;
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  console.log(`[API] Requesting: ${url}`); // Debug log
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  console.log(`[API] Response status: ${response.status} for ${url}`); // Debug log
  return handleResponse(response);
};

// Auth API
export const authApi = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password, role) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  getMe: () => apiRequest('/auth/me'),

  updateMe: (data) =>
    apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword, newPassword) =>
    apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Entities API
export const entitiesApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/entities${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/entities/${id}`),

  create: (data) =>
    apiRequest('/entities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/entities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/entities/${id}`, {
      method: 'DELETE',
    }),

  changeState: (id, stateId, comment) =>
    apiRequest(`/entities/${id}/state`, {
      method: 'PUT',
      body: JSON.stringify({ stateId, comment }),
    }),

  getTimeline: (id) => apiRequest(`/entities/${id}/timeline`),

  addContributor: (id, contributorId, role) =>
    apiRequest(`/entities/${id}/contributors`, {
      method: 'POST',
      body: JSON.stringify({ contributorId, role }),
    }),

  removeContributor: (id, contributorId) =>
    apiRequest(`/entities/${id}/contributors/${contributorId}`, {
      method: 'DELETE',
    }),
};

// States API
export const statesApi = {
  getAll: () => apiRequest('/states'),
  getById: (id) => apiRequest(`/states/${id}`),
};

// Versions API
export const versionsApi = {
  getByEntity: (entityId) => apiRequest(`/versions/entity/${entityId}`),
  getById: (id) => apiRequest(`/versions/${id}`),
  create: (entityId, data) =>
    apiRequest(`/versions/entity/${entityId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  compare: (version1Id, version2Id) =>
    apiRequest(`/versions/compare/${version1Id}/${version2Id}`),
  setCurrent: (id) =>
    apiRequest(`/versions/${id}/current`, { method: 'PUT' }),
};

// Files API
export const filesApi = {
  getByVersion: (versionId) => apiRequest(`/files/version/${versionId}`),
  getInfo: (id) => apiRequest(`/files/${id}`),
  download: async (id, filename) => {
    const response = await fetch(`${API_BASE}/files/${id}/download`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  upload: async (versionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/files/version/${versionId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },
  delete: (id) =>
    apiRequest(`/files/${id}`, { method: 'DELETE' }),
};

// Contributors API
export const contributorsApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/contributors${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/contributors/${id}`),
  getStats: (id) => apiRequest(`/contributors/${id}/stats`),
  create: (data) =>
    apiRequest('/contributors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/contributors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/contributors/${id}`, {
      method: 'DELETE',
    }),
};

// Stats API
export const statsApi = {
  getGlobal: () => apiRequest('/stats'),
  getTimeline: (days = 30) => apiRequest(`/stats/timeline?days=${days}`),
  getTopContributors: (limit = 10) =>
    apiRequest(`/stats/top-contributors?limit=${limit}`),
  getEntityStats: (id) => apiRequest(`/stats/entity/${id}`),
};

// AI API
export const aiApi = {
  chat: (message) =>
    apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  getHistory: () => apiRequest('/ai/history'),
  clearHistory: () =>
    apiRequest('/ai/history', { method: 'DELETE' }),
};

export default {
  auth: authApi,
  entities: entitiesApi,
  states: statesApi,
  versions: versionsApi,
  files: filesApi,
  contributors: contributorsApi,
  stats: statsApi,
  ai: aiApi,
};

