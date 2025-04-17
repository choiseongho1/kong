'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Home, Cat } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleAuthSuccess = () => {
    if (isLogin) {
      // 로그인 성공 시 다이어리 페이지로 이동
      router.push('/diary');
    } else {
      // 회원가입 성공 시 로그인 폼으로 전환
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* 헤더 */}
      <header className="py-4 px-6 flex items-center justify-between bg-white/80 backdrop-blur-sm shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Cat className="h-6 w-6 text-primary" />
          <span className="font-handwriting text-lg">콩이의 일기장</span>
        </Link>
        <Link 
          href="/" 
          className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Home className="h-5 w-5" />
          <span className="font-poorstory">홈으로</span>
        </Link>
      </header>

      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-handwriting mb-4 relative inline-block">
              <span className="relative z-10">나의 다이어리</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-yellow-200 opacity-50 z-0"></span>
            </h1>
            <p className="text-lg font-poorstory text-gray-600 mt-4">
              {isLogin ? '로그인하여 다이어리를 작성해보세요.' : '회원가입하고 다이어리를 시작해보세요.'}
            </p>
          </div>

          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            {isLogin ? (
              <LoginForm 
                onSuccess={handleAuthSuccess} 
                onRegisterClick={() => setIsLogin(false)} 
              />
            ) : (
              <RegisterForm 
                onSuccess={handleAuthSuccess} 
                onLoginClick={() => setIsLogin(true)} 
              />
            )}
          </div>
        </div>
      </div>
      
      {/* 고양이 발자국 배경 */}
      <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none opacity-5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-full h-full text-gray-900">
          <path fill="currentColor" d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3v-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z" />
        </svg>
      </div>
    </div>
  );
}
