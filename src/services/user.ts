import { http } from "./http";
import type { AxiosResponse } from "axios";

// Shared ApiResponse shape used by backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface UserPreferences {
  // flexible key-value map, keep values typed as unknown instead of any
  [key: string]: unknown;
}

export interface UserMe {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  address?: string | null;
  avatarUrl?: string;
  emergencyContact?: string | null;
  // New fields returned/accepted by /api/user-profiles/{id}
  sourceId?: number | null;
  sourceDetail?: string | null;
  branchId?: number | null;
  nationalityId?: number | null;
  occupationId?: number | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  isReturning?: boolean | null;
  referrerId?: number | null;
  customerGroupIds?: number[] | null;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  description?: string;
  durationMinutes?: number;
}

export interface Dentist {
  id: number;
  name: string;
  userId: number;
  specialization?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  bio?: string;
}

export interface AppointmentHistory {
  // Common fields (kept flexible to support multiple backend shapes)
  id: number;
  status: string;
  // scheduledTime may be ISO string
  scheduledTime: string;
  // Backend previously used `notes` or `note`
  notes?: string | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Customer info
  customerId?: number;
  customerUsername?: string;
  customerName?: string | null;

  // Dentist / assistant / receptionist
  dentistId?: number | null;
  dentistUsername?: string | null;
  dentistName?: string | null;
  assistantId?: number | null;
  assistantName?: string | null;
  receptionistId?: number | null;
  receptionistUsername?: string | null;
  receptionistName?: string | null;

  // Service info - some endpoints return nested `service`, others return `serviceId`/`serviceName`
  service?: Service | null;
  serviceId?: number | null;
  serviceName?: string | null;

  // Branch / location
  branchId?: number | null;
  branchName?: string | null;

  // Other fields
  estimatedMinutes?: number | null;
}

export const UserAPI = {
  me: () =>
    http.get<ApiResponse<UserMe>>("/api/users/me").then((r: AxiosResponse<ApiResponse<UserMe>>) => r.data),

  getMe: () => http.get('/api/users/me').then(r => r.data),
  getProfile: (id?: number) => {
    const normalizeProfileResponse = (raw: unknown): ApiResponse => {
      // If backend already returns wrapped ApiResponse, return it as-is
      if (raw && typeof raw === 'object' && 'success' in (raw as Record<string, unknown>)) return raw as ApiResponse;
      // Otherwise wrap the raw profile object into ApiResponse shape
      return { success: true, message: '', data: raw as UserProfile } as ApiResponse;
    };

    const fetchProfileById = (uid: number) =>
      http.get(`/api/user-profiles/${uid}`).then(r => normalizeProfileResponse(r.data));

    if (typeof id === 'number') return fetchProfileById(id);

    return http
      .get('/api/users/me')
      .then(r => r.data)
      .then((meRes) => {
        // meRes may be ApiResponse<UserMe> or raw UserMe
        const uid = meRes?.data?.id ?? meRes?.id;
        if (!uid) {
          return { success: false, message: 'Không tìm thấy user id', data: null } as ApiResponse<null>;
        }
        return fetchProfileById(uid);
      });
  },
 


  getAppointmentHistory: (params?: { userId?: number; page?: number; size?: number }) => {
    // If caller already provided a userId, call directly
    if (params && typeof params.userId === 'number') {
      return http.get('/api/appointments/history', { params }).then(r => r.data);
    }

    
    return http
      .get('/api/users/me')
      .then(r => r.data)
      .then((meRes) => {
        const uid = meRes?.data?.id ?? meRes?.id;
        if (!uid) {
          // return a minimal failure-shaped wrapper so callers can handle it
          return { total: 0, size: params?.size || 0, data: [], success: false, page: params?.page || 0, message: 'Không tìm thấy user id' } as unknown;
        }
        const qp = { ...(params || {}), userId: uid };
        return http.get('/api/appointments/history', { params: qp }).then(r => r.data);
      });
  },
  updateProfile: async (payload: Partial<UserProfile>) => {
    // If the caller included a profile id, use it directly
    const providedId = (payload && typeof payload.id === 'number') ? payload.id : undefined;
    try {
      let profileId = providedId;
      if (!profileId) {
        const profRes = (await UserAPI.getProfile()) as ApiResponse<UserProfile | null>;
        profileId = profRes?.data?.id;
      }
      if (!profileId) {
        return { success: false, message: 'Không tìm thấy profile id', data: null } as ApiResponse<null>;
      }
      // Use PUT to update the full resource at /api/user-profiles/{id}
      const axiosRes = await http.put(`/api/user-profiles/${profileId}`, payload);
      const raw = axiosRes.data;
      // If backend already returns ApiResponse<T>, return it as-is
      if (raw && typeof raw === 'object' && 'success' in (raw as Record<string, unknown>)) {
        return raw as ApiResponse<UserProfile>;
      }
      // Otherwise wrap the raw profile object into ApiResponse shape
      return { success: true, message: '', data: raw as UserProfile } as ApiResponse<UserProfile>;
    } catch (err) {
      // Bubble up a consistent ApiResponse-shaped error
      return { success: false, message: (err as Error)?.message || 'Lỗi khi cập nhật profile', data: null } as ApiResponse<null>;
    }
  },

  // services and dentists
  getServices: () => http.get<ApiResponse<Service[]>>('/api/services').then((r: AxiosResponse<ApiResponse<Service[]>>) => r.data),
  getDentists: () => http.get<ApiResponse<Dentist[]>>('/api/dentists').then((r: AxiosResponse<ApiResponse<Dentist[]>>) => r.data),

  // Update appointment by id (PUT)
  updateAppointment: (id: number, payload: Record<string, unknown>) =>
    http.put<ApiResponse<unknown>>(`/api/appointments/${id}`, payload).then((r: AxiosResponse<ApiResponse<unknown>>) => r.data),

  // Cancel (delete) appointment
  cancelAppointment: (id: number) => http.delete<ApiResponse<unknown>>(`/api/appointments/${id}`).then((r: AxiosResponse<ApiResponse<unknown>>) => r.data),
};
