import axios from 'axios';
import type { AuthResponse, User, Patient, Appointment, ClinicalRecord, Notification } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export type LoginStep1Response =
  | { needs_otp: true; user_id: number; masked_email: string }
  | { token: string; user: import('@/types').User };

export interface RegisterStep1Response {
  needs_verification: true;
  user_id: number;
  masked_email: string;
}

// Auth
export const authApi = {
  // Step 1: validate credentials → backend sends OTP email
  login: (username: string, password: string) =>
    api.post<LoginStep1Response>('/auth/login', { username, password }),
  // Step 2: verify OTP → receive token
  verifyLoginOtp: (user_id: number, otp: string) =>
    api.post<AuthResponse>('/auth/login/verify-otp', { user_id, otp }),

  // Step 1: create account → backend sends verification email
  register: (data: Partial<User> & { password: string }) =>
    api.post<RegisterStep1Response>('/auth/register', data),
  // Step 2: verify email code → receive token
  verifyEmailCode: (user_id: number, code: string) =>
    api.post<AuthResponse>('/auth/email/verify-code', { user_id, code }),
  // Resend verification code
  resendEmailVerification: (user_id: number) =>
    api.post('/auth/email/resend', { user_id }),

  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  changePassword: (current_password: string, new_password: string, new_password_confirmation: string) =>
    api.put('/auth/change-password', { current_password, new_password, new_password_confirmation }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (email: string, code: string, new_password: string, new_password_confirmation: string) =>
    api.post('/auth/reset-password', { email, code, new_password, new_password_confirmation }),
};

// Patients
export const patientsApi = {
  list: (search?: string) =>
    api.get<Patient[]>('/patients', { params: { search } }),
  get: (id: number) => api.get<Patient>(`/patients/${id}`),
  create: (data: Partial<Patient> & { password: string }) =>
    api.post<Patient>('/patients', data),
  update: (id: number, data: Partial<Patient>) =>
    api.put<Patient>(`/patients/${id}`, data),
  delete: (id: number) => api.delete(`/patients/${id}`),
};

// Appointments
export const appointmentsApi = {
  list: (params?: { date?: string; patient_id?: number }) =>
    api.get<Appointment[]>('/appointments', { params }),
  get: (id: number) => api.get<Appointment>(`/appointments/${id}`),
  create: (data: Partial<Appointment>) =>
    api.post<Appointment>('/appointments', data),
  update: (id: number, data: Partial<Appointment>) =>
    api.put<Appointment>(`/appointments/${id}`, data),
  delete: (id: number) => api.delete(`/appointments/${id}`),
  remind: (id: number) => api.post(`/appointments/${id}/remind`),
};

// Clinical records
export const recordsApi = {
  list: (patientId: number) =>
    api.get<ClinicalRecord[]>(`/patients/${patientId}/records`),
  get: (patientId: number, recordId: number) =>
    api.get<ClinicalRecord>(`/patients/${patientId}/records/${recordId}`),
  create: (patientId: number, data: Partial<ClinicalRecord>) =>
    api.post<ClinicalRecord>(`/patients/${patientId}/records`, data),
  update: (patientId: number, recordId: number, data: Partial<ClinicalRecord>) =>
    api.put<ClinicalRecord>(`/patients/${patientId}/records/${recordId}`, data),
};

// Notifications
export const notificationsApi = {
  list: () => api.get<Notification[]>('/notifications'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

// My associated doctors (for patients booking)
export const myDoctorsApi = {
  list: () => api.get<DoctorSummary[]>('/my-doctors'),
};

// Web Push subscriptions
export const pushApi = {
  getPublicKey: () => api.get<{ public_key: string }>('/push/public-key'),
  subscribe:   (data: { endpoint: string; public_key: string; auth_token: string }) =>
    api.post('/push/subscribe', data),
  unsubscribe: (endpoint: string) => api.post('/push/unsubscribe', { endpoint }),
};

export interface DoctorSummary {
  id: number;
  name: string;
  speciality?: string;
  email?: string;
  phone?: string;
}

// Admin
export const adminApi = {
  stats: () =>
    api.get<{
      doctor_count: number; patient_count: number;
      today_count: number;  month_count: number;
      today_list: import('@/types').Appointment[];
    }>('/admin/stats'),

  listDoctors: () => api.get<import('@/types').User[]>('/admin/doctors'),
  createDoctor: (data: Partial<import('@/types').User> & { password: string }) =>
    api.post<import('@/types').User>('/admin/doctors', data),
  updateDoctor: (id: number, data: Partial<import('@/types').User>) =>
    api.put<import('@/types').User>(`/admin/doctors/${id}`, data),
  deleteDoctor: (id: number) => api.delete(`/admin/doctors/${id}`),

  // Doctor ↔ patient associations
  getDoctorPatients: (doctorId: number) =>
    api.get<import('@/types').User[]>(`/admin/doctors/${doctorId}/patients`),
  associatePatient: (doctorId: number, patientId: number) =>
    api.post(`/admin/doctors/${doctorId}/patients`, { patient_id: patientId }),
  deassociatePatient: (doctorId: number, patientId: number) =>
    api.delete(`/admin/doctors/${doctorId}/patients/${patientId}`),
  getPatientDoctors: (patientId: number) =>
    api.get<DoctorSummary[]>(`/admin/patients/${patientId}/doctors`),

  listPatients: (search?: string) =>
    api.get<import('@/types').User[]>('/admin/patients', { params: { search } }),

  listAppointments: (params?: { date?: string; doctor_id?: number; status?: string }) =>
    api.get<import('@/types').Appointment[]>('/admin/appointments', { params }),
};

// Reports
export const reportsApi = {
  patients: () => api.get('/reports/patients'),
  calendar: (month?: string) => api.get('/reports/calendar', { params: { month } }),
  history: (patientId: number) => api.get(`/reports/history/${patientId}`),
};

export default api;
