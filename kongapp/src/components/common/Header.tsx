'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Home, BookOpen, PieChart, Cat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setIsLoggedIn(true);
        
        // 사용자 이름 설정 (중첩된 구조 처리)
        if (parsedUser.user && parsedUser.user.nickname) {
          setUserName(parsedUser.user.nickname);
        } else if (parsedUser.nickname) {
          setUserName(parsedUser.nickname);
        } else if (parsedUser.user && parsedUser.user.email) {
          setUserName(parsedUser.user.email.split('@')[0]);
        } else if (parsedUser.email) {
          setUserName(parsedUser.email.split('@')[0]);
        } else {
          setUserName('사용자');
        }
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    
    toast({
      title: '로그아웃 되었습니다',
      description: '다음에 또 만나요!',
      variant: 'default',
    });
    
    router.push('/auth');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Cat className="h-6 w-6 text-primary" />
          <span className="font-handwriting text-lg sm:text-xl">콩이의 일기장</span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            href="/" 
            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors font-poorstory ${
              pathname === '/' 
                ? 'text-primary bg-primary/10' 
                : 'text-gray-600 hover:text-primary hover:bg-gray-100'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>홈</span>
          </Link>
          <Link 
            href="/diary" 
            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors font-poorstory ${
              pathname === '/diary' 
                ? 'text-primary bg-primary/10' 
                : 'text-gray-600 hover:text-primary hover:bg-gray-100'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>일기장</span>
          </Link>
          <Link 
            href="/analysis" 
            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors font-poorstory ${
              pathname === '/analysis' 
                ? 'text-primary bg-primary/10' 
                : 'text-gray-600 hover:text-primary hover:bg-gray-100'
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>감정분석</span>
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center ml-4 gap-2">
              <span className="font-poorstory text-gray-600">
                안녕하세요, <span className="text-primary font-medium">{userName}</span>님!
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 font-poorstory"
              >
                <LogOut className="h-4 w-4 mr-1" />
                로그아웃
              </Button>
            </div>
          ) : (
            <Link href="/auth" className="ml-4">
              <Button variant="outline" className="font-poorstory">
                로그인
              </Button>
            </Link>
          )}
        </nav>

        {/* 모바일 메뉴 토글 버튼 */}
        <button 
          className="md:hidden text-gray-600 hover:text-primary p-2 rounded-lg hover:bg-gray-100" 
          onClick={toggleMobileMenu}
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t shadow-md">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link 
              href="/" 
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-poorstory ${
                pathname === '/' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>홈</span>
            </Link>
            <Link 
              href="/diary" 
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-poorstory ${
                pathname === '/diary' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5" />
              <span>일기장</span>
            </Link>
            <Link 
              href="/analysis" 
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-poorstory ${
                pathname === '/analysis' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <PieChart className="h-5 w-5" />
              <span>감정분석</span>
            </Link>
            
            {isLoggedIn ? (
              <div className="flex flex-col space-y-3 pt-3 border-t mt-2">
                <span className="font-poorstory text-gray-600 px-4">
                  안녕하세요, <span className="text-primary font-medium">{userName}</span>님!
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 justify-start font-poorstory"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <Link 
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="pt-3 border-t mt-2"
              >
                <Button variant="outline" className="w-full font-poorstory">
                  로그인
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
