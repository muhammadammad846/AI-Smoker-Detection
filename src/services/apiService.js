// API service - URLs from src/config/api.js (env-aware for production)
import { API_BASE_URL } from '../config/api';

export const apiRequest = async (endpoint, options = {}) => {
  const { headers, ...restOptions } = options;
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...restOptions,
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.error('API Error:', error.message || error);
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      console.warn(
        '[Network] Request failed to',
        url,
        '— check backend is running and DEV_API in src/config/api.js matches your machine (use 10.0.2.2:3000 for Android emulator).'
      );
    }
    if (error.message) {
      throw error;
    }
    throw new Error(error.message || 'Network error occurred');
  }
};

// Detection API
export const startDetection = async (cameraId) => {
  return apiRequest('/detection/start', {
    method: 'POST',
    body: JSON.stringify({ cameraId }),
  });
};

export const stopDetection = async (cameraId) => {
  return apiRequest('/detection/stop', {
    method: 'POST',
    body: JSON.stringify({ cameraId }),
  });
};

export const getDetectionStatus = async (cameraId) => {
  return apiRequest(`/detection/status/${cameraId}`);
};

export const processImage = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });

  const response = await fetch(`${API_BASE_URL}/detection/process`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }
  return data;
};

// Challan API
export const getChallansAPI = async (studentId = null) => {
  const query = studentId ? `?studentId=${studentId}` : '';
  return apiRequest(`/challans${query}`);
};

export const createChallanAPI = async (challanData) => {
  return apiRequest('/challans', {
    method: 'POST',
    body: JSON.stringify(challanData),
  });
};

export const updateChallanAPI = async (challanId, updates) => {
  return apiRequest(`/challans/${challanId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteChallanAPI = async (challanId) => {
  return apiRequest(`/challans/${challanId}`, {
    method: 'DELETE',
  });
};

// User API
export const getUsersAPI = async (role = null) => {
  const query = role ? `?role=${role}` : '';
  return apiRequest(`/users${query}`);
};

export const createUserAPI = async (userData, authToken = null) => {
  const headers = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return apiRequest('/users', {
    method: 'POST',
    headers,
    body: JSON.stringify(userData),
  });
};

// Guards Activity API
export const getGuardsActivityAPI = async () => {
  return apiRequest('/guards/activity');
};

// Live Detections API
export const getLiveDetectionsAPI = async () => {
  return apiRequest('/detections/live');
};

// Camera API
export const getCamerasAPI = async () => {
  return apiRequest('/cameras');
};

export const addCameraAPI = async (cameraData) => {
  return apiRequest('/cameras', {
    method: 'POST',
    body: JSON.stringify(cameraData),
  });
};


