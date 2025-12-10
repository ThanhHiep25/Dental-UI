import http from '@/services/http';

// Types mirrored from the assist response and booking request
export type AssistSuggestedService = {
  id: number;
  name: string;
  price?: number;
  description?: string;
  durationMinutes?: number;
  unit?: string;
};

export type AssistSuggestedDentist = {
  id: number;
  name: string;
  specialization?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  bio?: string;
};

export type AssistQuickBookingTemplate = {
  date: string; // MM/dd/yyyy | dd/MM/yyyy | yyyy-MM-dd
  time: string; // HH:mm (24h)
  serviceId: number;
  serviceName?: string;
  price?: number;
  preferredDentistId?: number; // server field
  notes?: string;
};

export type MLRecommendation = {
  id: number;
  score: number;
};

export type AssistResponse = {
  type?: 'chitchat' | 'booking';
  intent?: string;
  reply?: string;
  suggestedServices?: AssistSuggestedService[];
  suggestedDentists?: AssistSuggestedDentist[];
  suggestedDates?: string[];
  suggestedTimes?: string[];
  quickBookingTemplates?: AssistQuickBookingTemplate[];
  mlRecommendations?: MLRecommendation[];
  messageSummary?: string;
  rawUserMessage?: string;
};

export type QuickBookingRequest = {
  fullName: string;
  email: string;
  phone: string;
  serviceId: number;
  date: string; // MM/dd/yyyy | dd/MM/yyyy | yyyy-MM-dd
  time: string; // HH:mm
  dentistId?: number;
  notes?: string;
};

function getAccessToken(): string {
  try {
    const match = typeof document !== 'undefined'
      ? document.cookie.match(/(?:^|; )access_token=([^;]*)/)
      : null;
    if (match) return decodeURIComponent(match[1]);
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('accessToken') || '';
    }
    return '';
  } catch {
    return '';
  }
}

export const ChatAPI = {
  assist: async (message: string, system = ''): Promise<AssistResponse> => {
    const token = getAccessToken();
    const res = await http.post<{ success: boolean; message?: string; data: AssistResponse }>(
      '/api/chat/assist',
      { message, system },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    // Backend trả về { success: true, data: { type, intent, ... } }
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    // Fallback nếu format khác
    return (res.data as unknown as AssistResponse) || {} as AssistResponse;
  },

  generate: async (
    message: string,
    system = ''
  ): Promise<{ reply?: string; intent?: string; type?: 'chitchat' | 'booking' }> => {
    const token = getAccessToken();
    const res = await http.post<{
      success?: boolean;
      data?: { reply?: string; intent?: string; type?: 'chitchat' | 'booking' };
      reply?: string;
      intent?: string;
      type?: 'chitchat' | 'booking';
    }>(
      '/api/chat/generate',
      { message, system },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    // Check if wrapped response
    if (res.data && typeof res.data === 'object') {
      if ('data' in res.data && res.data.data) {
        return res.data.data as { reply?: string; intent?: string; type?: 'chitchat' | 'booking' };
      }
      if ('reply' in res.data) {
        return { reply: res.data.reply, intent: res.data.intent, type: res.data.type };
      }
    }
    return {};
  },

  book: async (payload: QuickBookingRequest): Promise<{ success?: boolean; message?: string } | unknown> => {
    const token = getAccessToken();
    const res = await http.post(
      '/api/chat/book',
      payload,
      {
        headers: {
          'X-CHAT-CONFIRMED': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return res.data;
  },

  debug: async (message = 'preview', system = ''): Promise<unknown> => {
    const token = getAccessToken();
    const res = await http.post(
      '/api/chat/debug',
      { message, system },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return res.data;
  },
};

export default ChatAPI;
