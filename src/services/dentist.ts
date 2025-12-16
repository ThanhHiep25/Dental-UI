import http from "./http";

export interface Dentist {
  id: number;
  name: string;
  userId: number;
  specialization: string;
  email: string;
  phone: string;
  active: boolean;
  bio: string;
}

export interface DentistAppointment {
  id: number;
  scheduledTime: string;
  endTime: string;
  estimatedMinutes: number;
  serviceId: number;
  status: string;
}

export interface DentistDayData {
  dentistId: number;
  dentistName: string;
  appointments: DentistAppointment[];
  totalAppointments: number;
}

export interface DentistsDayResponse {
  success: boolean;
  date: string;
  totalDentists: number;
  data: DentistDayData[];
}

export interface GetDentistsResponse {
  success: boolean;
  message: string;
  data: Dentist[];
}

export interface AddDentistPayload {
  name: string;
  userId: number;
  specialization: string;
  email: string;
  phone: string;
  active: boolean;
  bio: string;
}

export interface AddDentistResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export const DentistAPI = {
  addDentist: async (payload: AddDentistPayload, accessToken?: string): Promise<AddDentistResponse> => {
    function getAccessTokenFromCookie(): string {
      const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : '';
    }
    const token = accessToken || getAccessTokenFromCookie();
    try {
      const res = await http.post<AddDentistResponse>(
        "/api/dentists",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      return res.data;
    } catch (error: unknown) {
      let message = "Unknown error";
      let data: unknown = undefined;
      if (typeof error === "object" && error !== null) {
        // @ts-expect-error: may have response property
        message = error.response?.data?.message || (error as Error).message || message;
        // @ts-expect-error: may have response property
        data = error.response?.data;
      } else if (typeof error === "string") {
        message = error;
      }
      return {
        success: false,
        message,
        data
      };
    }
  },




  // Get dentists
  getDentists: async (): Promise<GetDentistsResponse> => {
    try {
      const res = await http.get<GetDentistsResponse>("/api/dentists");
      return res.data;
    } catch (error: unknown) {
      let message = "Unknown error";
      let data: Dentist[] = [];
      if (typeof error === "object" && error !== null) {
        // @ts-expect-error: may have response property
        message = error.response?.data?.message || (error as Error).message || message;
        // @ts-expect-error: may have response property
        data = error.response?.data?.data || [];
      } else if (typeof error === "string") {
        message = error;
      }
      return {
        success: false,
        message,
        data
      };
    }
  },

  // Get dentists appointments by day
  getDentistsByDay: async (date: string): Promise<DentistsDayResponse> => {
    try {
      const res = await http.get<DentistsDayResponse>(`/api/appointments/dentists/day?date=${date}`);
      return res.data;
    } catch (error: unknown) {
      let message = "Unknown error";
      if (typeof error === "object" && error !== null) {
        // @ts-expect-error: may have response property
        message = error.response?.data?.message || (error as Error).message || message;
      } else if (typeof error === "string") {
        message = error;
      }
      return {
        success: false,
        date,
        totalDentists: 0,
        data: []
      };
    }
  }
};


