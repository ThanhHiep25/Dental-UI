'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OAuth2CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        if (error) {
          console.error('OAuth2 error:', error);
          router.push('/');
          return;
        }

        if (code) {
          console.log('OAuth2 callback received code:', code, 'state:', state);
          router.push('/auth/oauth-success');
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('OAuth2 callback error:', err);
        router.push('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-4 text-gray-600'>Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}

