export type Role = 'medico' | 'paciente' | 'admin';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  age?: number;
  sex?: 'M' | 'F' | 'X';
  speciality?: string;
  notif_email?: boolean;
  notif_push?: boolean;
}

export interface Patient {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  sex: 'M' | 'F' | 'X';
  address: string;
  username: string;
  created_at: string;
  updated_at: string;
  last_visit?: string;
  notes_count?: number;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'locked' | 'completed';

export interface Appointment {
  id: number;
  patient_id: number | null;
  doctor_id: number;
  appointment_date: string;
  duration: number;
  status: AppointmentStatus;
  reason: string;
  locked_by?: string;
  patient?: Patient;
  created_at: string;
  updated_at: string;
}

export interface Vitals {
  temperature: number;
  weight: number;
  height: number;
  systolic: number;
  diastolic: number;
  heart_rate: number;
}

export interface ClinicalRecord {
  id: number;
  appointment_id: number;
  patient_id: number;
  vitals: Vitals;
  diagnosis: string;
  prescriptions: string;
  analysis_results: string;
  created_at: string;
  updated_at: string;
  appointment?: Appointment;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
