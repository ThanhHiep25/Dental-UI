import { http } from "./http";
import type { AxiosResponse } from "axios";

// Payload interfaces
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  captchaToken?: string;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
  captchaToken?: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface LogoutPayload {
  refreshToken: string;
}

export interface OAuth2UrlResponse {
  url?: string;
  authorizationUrl?: string;
}

export interface OAuth2UrlParams {
  rememberMe?: boolean;
  saveCookies?: boolean;
}

export interface LoginResponseData {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  username?: string;
  email?: string;
  role?: string;
  avatar_url?: string;
  cookies_set?: boolean | string;
  [key: string]: unknown;
}

// Generic API response envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export type WhoamiData = Record<string, string>;
export type TokensData = Record<string, string>;

export interface ForgotPasswordPayload {
  email: string;
}

export interface LazyResetPasswordPayload {
  usernameOrEmail: string;
  newPassword: string;
}

export const AuthAPI = {
  register: (payload: RegisterPayload) =>
    http.post<ApiResponse<string>>("/api/auth/register", payload).then((r: AxiosResponse<ApiResponse<string>>) => r.data),

  verify: (token: string) =>
    http.get<ApiResponse<string>>("/api/auth/verify", { params: { token } }).then((r: AxiosResponse<ApiResponse<string>>) => r.data),

  // Login API call - normalize responses so frontend always gets ApiResponse-like envelope
  login: (payload: LoginPayload, options?: { saveCookies?: boolean }) =>
    http
      .post<ApiResponse<LoginResponseData> | LoginResponseData>('/api/auth/login', payload, {
        withCredentials: !!options?.saveCookies,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then((r: AxiosResponse) => {
        const body = r.data;

        // Handle HTML response (redirect case) - this shouldn't happen with proper headers
        if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
          // Extract data from redirect URL if available
          const urlMatch = body.match(/avatar_url=([^&"]+)/);
          const usernameMatch = body.match(/username=([^&"]+)/);
          const emailMatch = body.match(/email=([^&"]+)/);
          const roleMatch = body.match(/role=([^&"]+)/);
          const tokenMatch = body.match(/access_token=([^&"]+)/);

          if (tokenMatch) {
            const extractedData = {
              access_token: decodeURIComponent(tokenMatch[1]),
              username: usernameMatch ? decodeURIComponent(usernameMatch[1]) : '',
              email: emailMatch ? decodeURIComponent(emailMatch[1]) : '',
              role: roleMatch ? decodeURIComponent(roleMatch[1]) : '',
              avatar_url: urlMatch ? decodeURIComponent(urlMatch[1]) : ''
            };
            return { success: true, message: 'Login successful', data: extractedData } as ApiResponse<LoginResponseData>;
          }
          throw new Error('Login failed: Received HTML redirect instead of JSON response');
        }

        // If backend already returns ApiResponse-like object, forward it
        if (body && typeof body.success !== 'undefined') {
          return body as ApiResponse<LoginResponseData>;
        }
        // Otherwise wrap the plain token map into ApiResponse.data
        return { success: true, message: 'Login successful', data: body } as ApiResponse<LoginResponseData>;
      }),

  refresh: (payload: RefreshPayload) =>
    http.post<ApiResponse<string>>("/api/auth/refresh", payload).then((r: AxiosResponse<ApiResponse<string>>) => r.data),

  logout: (payload: LogoutPayload) =>
    http.post<ApiResponse<string>>("/api/auth/logout", payload).then((r: AxiosResponse<ApiResponse<string>>) => r.data),

  clearCookies: () =>
    http.post<ApiResponse<string>>("/api/auth/clear-cookies", {}).then((r: AxiosResponse<ApiResponse<string>>) => r.data),

  whoami: () =>
    http.get<ApiResponse<WhoamiData>>("/api/auth/whoami").then((r: AxiosResponse<ApiResponse<WhoamiData>>) => r.data),

  tokens: () =>
    http.get<ApiResponse<TokensData>>("/api/auth/tokens").then((r: AxiosResponse<ApiResponse<TokensData>>) => r.data),

  oauth2GoogleUrl: async (p0: { rememberMe: boolean; saveCookies: boolean; }): Promise<string> => {
    try {
      const res = await http.post<OAuth2UrlResponse>("/api/auth/oauth2/google-url");
      const maybe = res.data.url || res.data.authorizationUrl;
      if (maybe) {
        // If backend returns absolute URL, use it. Otherwise prefix with backend baseURL.
        const isAbsolute = /^https?:\/\//i.test(maybe);
        if (isAbsolute) return maybe;
        const base = (http.defaults.baseURL || "").replace(/\/$/, "");
        return base + (maybe.startsWith("/") ? maybe : "/" + maybe);
      }
    } catch {}
    // Fallback to Spring Security default path on BACKEND domain
    const base = (http.defaults.baseURL || "").replace(/\/$/, "");
    return base + "/oauth2/authorization/google";
  },

  forgotPassword: (payload: ForgotPasswordPayload) =>
    http.post<ApiResponse<string>>("/api/auth/forgot-password", payload).then((r: AxiosResponse<ApiResponse<string>>) => r.data),

  lazyResetPassword: (payload: LazyResetPasswordPayload) =>
    http.post<ApiResponse<string>>("/api/auth/lazy/reset-password", payload).then((r: AxiosResponse<ApiResponse<string>>) => r.data),
};

// Utility to clear tokens from localStorage and cookies
export function clearAuthTokens() {
  // Remove from localStorage
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
  } catch {}

  // Remove access_token cookie
  try {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  } catch {}
}
