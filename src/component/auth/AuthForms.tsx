'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { AuthAPI } from '../../services/auth';
import { UserObject } from '../../type/user';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { toast } from 'react-toastify';

// Local type for login response data to avoid importing from services and keep types explicit
interface LoginData {
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserObject) => void;
}

const RegisterForm: React.FC<{ onSubmit: (captchaToken: string) => void, email: string, setEmail: (v: string) => void, userName: string, setUserName: (v: string) => void, password: string, setPassword: (v: string) => void, loading: boolean }> = ({ onSubmit, email, setEmail, userName, setUserName, password, setPassword, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      alert('Recaptcha not ready');
      return;
    }
    const token = await executeRecaptcha('register');
    onSubmit(token);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-purple-700">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-3 border-b-2 border-b-yellow-600 border-gray-300 focus:outline-none" required disabled={loading} />
      </div>
      <div>
        <label className="block text-purple-700">Username</label>
        <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full mt-1 p-3 border-b-2 border-b-yellow-600 border-gray-300 focus:outline-none" required disabled={loading} />
      </div>
      <div>
        <label className="block text-purple-700">Password</label>
        <div className="relative">
          <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 p-3 pr-12 border-b-2 border-b-yellow-600 border-gray-300 focus:outline-none" required disabled={loading} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" disabled={loading}>
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <motion.button whileHover={{ scale: loading ? 1 : 1.05 }} whileTap={{ scale: loading ? 1 : 0.95 }} type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-semibold py-3 rounded-md transition duration-300 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </motion.button>
    </form>
  );
};

const ForgotPasswordForm: React.FC<{ onSubmit: (email: string) => void, email: string, setEmail: (v: string) => void, loading: boolean }> = ({ onSubmit, email, setEmail, loading }) => (
  <form onSubmit={e => { e.preventDefault(); onSubmit(email); }} className="space-y-4">
    <div>
      <label className="block text-purple-700">Email</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-3 border-b-2 border-b-yellow-600 border-gray-300 focus:outline-none" required />
    </div>
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-semibold py-3 rounded-md transition duration-300 hover:bg-purple-700">
      {loading ? 'Đang gửi...' : 'Gửi yêu cầu đặt lại mật khẩu'}
    </motion.button>
  </form>
);

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const payload = { usernameOrEmail: email, password };
      const res = await AuthAPI.login(payload, { saveCookies: rememberMe });
      if (res.success) {
        try { localStorage.setItem('rememberMe', String(rememberMe)); } catch {}
        const data: LoginData | undefined = res.data as LoginData | undefined;
        if (data && data.access_token) {
          try { localStorage.setItem('accessToken', data.access_token as string); } catch {}
          if (data.refresh_token && data.cookies_set !== true && data.cookies_set !== 'true') {
            try { localStorage.setItem('refreshToken', data.refresh_token as string); } catch {}
          }
          // Standardize user object format to match OAuth
          const userObj: UserObject = {
            username: (data.username as string) || email,
            email: (data.email as string) || email,
            role: (data.role as string) || 'USER',
            avatar_url: (data.avatar_url as string) || '/images/default-avatar.jpg',
          };
          try { localStorage.setItem('user', JSON.stringify(userObj)); } catch {}
          //console.log('Saved user to localStorage:', userObj); // Debug log
          onSuccess?.(userObj);
          onClose();
        } else {
          try {
            const who = await AuthAPI.whoami();
            if (who.success) {
              // Standardize user object format to match OAuth
              const userObj: UserObject = {
                username: who.data.username || who.data.name || email,
                email: who.data.email || email,
                role: who.data.role || 'USER',
                avatar_url: who.data.avatar_url || who.data.avatarUrl || '/images/default-avatar.jpg',
              };
              try { localStorage.setItem('user', JSON.stringify(userObj)); } catch {}
              onSuccess?.(userObj);
            } else {
              const fallback: UserObject = {
                username: email,
                email: email,
                role: 'USER',
                avatar_url: '/images/default-avatar.jpg'
              };
              try { localStorage.setItem('user', JSON.stringify(fallback)); } catch {}
              onSuccess?.(fallback);
            }
          } catch {
            const fallback: UserObject = {
              username: email,
              email: email,
              role: 'USER',
              avatar_url: '/images/default-avatar.jpg'
            };
            try { localStorage.setItem('user', JSON.stringify(fallback)); } catch {}
            onSuccess?.(fallback);
          }
        }
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err) {
      const unknownErr: unknown = err;
      let serverMsg: string | undefined;
      if (typeof unknownErr === 'object' && unknownErr !== null) {
        const e = unknownErr as { response?: { data?: { message?: string } }; message?: string };
        serverMsg = e.response?.data?.message || e.message;
      } else if (typeof unknownErr === 'string') {
        serverMsg = unknownErr;
      }
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin của bạn.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (captchaToken: string) => {
    setRegisterLoading(true);
    try {
      const payload = { username: userName, email, password, captchaToken };
      const res = await AuthAPI.register(payload);
      if (res.success) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsRegistering(false);
      } else {
        toast.error(res.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      const unknownErr: unknown = err;
      let serverMsg: string | undefined;
      if (typeof unknownErr === 'object' && unknownErr !== null) {
        const e = unknownErr as { response?: { data?: { message?: string } }; message?: string };
        serverMsg = e.response?.data?.message || e.message;
      } else if (typeof unknownErr === 'string') {
        serverMsg = unknownErr;
      }
      toast.error(serverMsg || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');
    try {
      const res = await AuthAPI.forgotPassword({ email });
      if (res.success) {
        setForgotPasswordMessage('Vui lòng kiểm tra email để xác thực và lập mật khẩu mới.');
      } else {
        setForgotPasswordMessage(res.message || 'Gửi yêu cầu thất bại.');
      }
    } catch (err) {
      setForgotPasswordMessage('Gửi yêu cầu thất bại.');
    }
    setForgotPasswordLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      try { localStorage.setItem('rememberMe', String(rememberMe)); } catch {}
      window.location.href = await AuthAPI.oauth2GoogleUrl({ rememberMe, saveCookies: rememberMe });
    } catch {
      alert('Unable to start Google sign-in.');
      setGoogleLoading(false);
    }
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { y: '-100vh', opacity: 0 },
    visible: { y: '0', opacity: 1, transition: { duration: 0.5, damping: 25, stiffness: 500 } },
    exit: { y: '100vh', opacity: 0 },
  };

  if (!isOpen) return null;
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KE || ''}>
      <motion.div className="fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-3xl" variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" onClick={onClose}>
        <motion.div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl mx-4 md:mx-0 relative" variants={modalVariants} onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            {isForgotPassword ? (
              <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Image hidden src="/LOGO/Logo_Horizontal_Light_1-1024x237.png.webp" alt="Logo" width={200} height={100} className="mb-8 mx-auto" />
                <ForgotPasswordForm onSubmit={handleForgotPasswordSubmit} email={email} setEmail={setEmail} loading={forgotPasswordLoading} />
                {forgotPasswordMessage && <div className="mt-4 text-green-600 text-center font-semibold">{forgotPasswordMessage}</div>}
                <button onClick={() => { setIsForgotPassword(false); setForgotPasswordMessage(''); }} className="w-full mt-4 text-center text-purple-600 font-medium hover:underline">Quay lại đăng nhập</button>
              </motion.div>
            ) : isRegistering ? (
              <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Image hidden src="/LOGO/Logo_Horizontal_Light_1-1024x237.png.webp" alt="Logo" width={200} height={100} className="mb-8 mx-auto" />
                <RegisterForm onSubmit={handleRegisterSubmit} email={email} setEmail={setEmail} userName={userName} setUserName={setUserName} password={password} setPassword={setPassword} loading={registerLoading} />
                <button onClick={() => setIsRegistering(false)} disabled={registerLoading} className="w-full mt-4 text-center text-purple-600 font-medium hover:underline disabled:opacity-50">Bạn đã có tài khoản? Đăng nhập ngay</button>
              </motion.div>
            ) : (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Image hidden src="/LOGO/Logo_Horizontal_Light_1-1024x237.png.webp" alt="Logo" width={200} height={100} className="mb-4 mx-auto" />
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-purple-700">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-3 border-b-2 border-b-yellow-600 border-gray-300 focus:outline-none" required disabled={loginLoading} />
                  </div>
                  <div>
                    <label className="block text-purple-700">Mật khẩu</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 p-3 pr-12 border-b-2 border-b-yellow-600 border-gray-300 focus:outline-none" required disabled={loginLoading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" disabled={loginLoading}>
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={loginLoading} />
                    <label htmlFor="remember" className="text-sm text-gray-600">{t('remember')}</label>
                  </div>

                  <motion.button whileHover={{ scale: loginLoading ? 1 : 1.05 }} whileTap={{ scale: loginLoading ? 1 : 0.95 }} type="submit" disabled={loginLoading} className="w-full bg-gradient-to-bl from-purple-500 hover:from-yellow-600 hover:to-purple-600 to-yellow-600 text-white font-semibold py-3 rounded-md transition duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loginLoading && (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loginLoading ? 'Đang đăng nhập...' : t('login')}
                  </motion.button>

                  <motion.button type="button" onClick={handleGoogleLogin} aria-label="Sign in with Google" whileHover={{ scale: googleLoading ? 1 : 1.02 }} whileTap={{ scale: googleLoading ? 1 : 0.98 }} disabled={googleLoading || loginLoading} className="w-full mt-2 border border-gray-300 flex items-center justify-center gap-3 py-2 rounded-md bg-white text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                    {googleLoading ? (
                      <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="inline-block">
                        <path fill="#EA4335" d="M24 9.5c3.9 0 7.3 1.4 10 3.9l7.4-7.4C36.1 2.7 30.4 0 24 0 14 0 5.3 5.7 1.6 14.1l8.9 6.9C12.5 15 17.8 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3.5-2.4 6.4-5 8.4l8 6.2C43.7 38 46.5 31.7 46.5 24.5z"/>
                        <path fill="#FBBC05" d="M10.5 28.9c-.6-1.8-.6-3.6 0-5.4L1.6 16.6C.6 18.8 0 21.3 0 24c0 2.7.6 5.2 1.6 7.4l8.9-6.5z"/>
                        <path fill="#34A853" d="M24 48c6.5 0 12.2-2.1 16.3-5.7l-8-6.3c-2.3 1.5-5.2 2.4-8.3 2.4-6.2 0-11.5-4.5-12.9-10.5L1.6 31.1C5.3 39.5 14 45.2 24 45.2z"/>
                      </svg>
                    )}
                    <span>{googleLoading ? 'Đang xử lý...' : 'Sign in with Google'}</span>
                  </motion.button>
                </form>
                <button onClick={() => setIsRegistering(true)} disabled={loginLoading || googleLoading} className="w-full mt-4 text-center text-blue-600 font-medium hover:underline disabled:opacity-50">Bạn chưa có tài khoản? Đăng ký ngay</button>
                <button onClick={() => setIsForgotPassword(true)} disabled={loginLoading || googleLoading} className="w-full mt-2 text-center text-purple-600 font-medium hover:underline disabled:opacity-50">Quên mật khẩu?</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </GoogleReCaptchaProvider>
  );
};

export default AuthModal;
