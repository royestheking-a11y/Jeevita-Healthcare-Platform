const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to handle API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Users API
export const usersAPI = {
  getAll: () => apiCall<any[]>('/users'),
  getById: (id: string) => apiCall<any>(`/users/${id}`),
  getByEmail: (email: string) => apiCall<any>(`/users/email/${email}`),
  create: (data: any) => apiCall<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/users/${id}`, { method: 'DELETE' }),
  login: (email: string, password: string) => apiCall<any>('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

// Doctors API
export const doctorsAPI = {
  getAll: () => apiCall<any[]>('/doctors'),
  getById: (id: string) => apiCall<any>(`/doctors/${id}`),
  create: (data: any) => apiCall<any>('/doctors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/doctors/${id}`, { method: 'DELETE' }),
};

// Medicines API
export const medicinesAPI = {
  getAll: () => apiCall<any[]>('/medicines'),
  getById: (id: string) => apiCall<any>(`/medicines/${id}`),
  create: (data: any) => apiCall<any>('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/medicines/${id}`, { method: 'DELETE' }),
};

// Hospitals API
export const hospitalsAPI = {
  getAll: () => apiCall<any[]>('/hospitals'),
  getById: (id: string) => apiCall<any>(`/hospitals/${id}`),
  create: (data: any) => apiCall<any>('/hospitals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/hospitals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/hospitals/${id}`, { method: 'DELETE' }),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => apiCall<any[]>('/appointments'),
  getById: (id: string) => apiCall<any>(`/appointments/${id}`),
  create: (data: any) => apiCall<any>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/appointments/${id}`, { method: 'DELETE' }),
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: () => apiCall<any[]>('/prescriptions'),
  getById: (id: string) => apiCall<any>(`/prescriptions/${id}`),
  getByUserId: (userId: string) => apiCall<any[]>(`/prescriptions/user/${userId}`),
  create: (data: any) => apiCall<any>('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/prescriptions/${id}`, { method: 'DELETE' }),
};

// Payments API
export const paymentsAPI = {
  getAll: () => apiCall<any[]>('/payments'),
  getById: (id: string) => apiCall<any>(`/payments/${id}`),
  create: (data: any) => apiCall<any>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/payments/${id}`, { method: 'DELETE' }),
};

// Carousel API
export const carouselAPI = {
  getAll: () => apiCall<any[]>('/carousel'),
  getById: (id: string) => apiCall<any>(`/carousel/${id}`),
  create: (data: any) => apiCall<any>('/carousel', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/carousel/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/carousel/${id}`, { method: 'DELETE' }),
};

// Activities API
export const activitiesAPI = {
  getAll: () => apiCall<any[]>('/activities'),
  create: (data: any) => apiCall<any>('/activities', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/activities/${id}`, { method: 'DELETE' }),
};

// Messages API
export const messagesAPI = {
  getAll: () => apiCall<any[]>('/messages'),
  getById: (id: string) => apiCall<any>(`/messages/${id}`),
  create: (data: any) => apiCall<any>('/messages', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/messages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addReply: (id: string, reply: any) => apiCall<any>(`/messages/${id}/reply`, { method: 'POST', body: JSON.stringify(reply) }),
  delete: (id: string) => apiCall<any>(`/messages/${id}`, { method: 'DELETE' }),
};

// Refunds API
export const refundsAPI = {
  getAll: () => apiCall<any[]>('/refunds'),
  getById: (id: string) => apiCall<any>(`/refunds/${id}`),
  create: (data: any) => apiCall<any>('/refunds', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/refunds/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/refunds/${id}`, { method: 'DELETE' }),
};

// Carts API
export const cartsAPI = {
  getByUserId: (userId: string) => apiCall<any>(`/carts/${userId}`),
  update: (userId: string, items: any[]) => apiCall<any>(`/carts/${userId}`, { method: 'PUT', body: JSON.stringify({ items }) }),
  clear: (userId: string) => apiCall<any>(`/carts/${userId}`, { method: 'DELETE' }),
};

// Settings API
export const settingsAPI = {
  get: (key: string) => apiCall<any>(`/settings/${key}`),
  set: (key: string, value: any) => apiCall<any>(`/settings/${key}`, { method: 'POST', body: JSON.stringify({ value }) }),
  getAll: () => apiCall<any[]>('/settings'),
};

