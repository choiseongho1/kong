'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, signup as apiSignup, refreshToken, logout as apiLogout } from '@/lib/authApi';
import { UserLoginDto, UserSaveDto, LoginResponseDto } from '@/lib/authApi';
import { useToast } from '@/components/ui/use-toast';

interface AuthUser {
  id: number;
  email: string;
  nickname: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLoginDto) => Promise<boolean>;
  signup: (userData: UserSaveDto) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 불러오기
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedData = JSON.parse(storedUser);
        console.log('AuthContext - localStorage에서 불러온 데이터:', parsedData);
        
        // 사용자 정보가 user 객체 안에 있는 경우
        let userData;
        if (parsedData.user && parsedData.user.id) {
          userData = parsedData.user;
          console.log('AuthContext - user 객체 내부에서 사용자 정보 추출:', userData);
        } else if (parsedData.id) {
          userData = parsedData;
          console.log('AuthContext - 최상위에서 사용자 정보 추출:', userData);
        } else {
          console.error('AuthContext - 사용자 정보 구조가 올바르지 않습니다:', parsedData);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          return;
        }
        
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: UserLoginDto): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiLogin(credentials);
      
      // API 응답 구조에 맞게 데이터 추출
      console.log('로그인 응답 전체:', response);
      
      // 백엔드 API 응답 구조가 다를 수 있으므로 확인
      let userData;
      let accessToken;
      let refreshToken;
      
      if (response.data) {
        // 응답이 data 필드 안에 있는 경우
        const responseData = response.data;
        console.log('응답 데이터:', responseData);
        
        if (responseData.user) {
          // { data: { user: {...}, accessToken: '...', refreshToken: '...' } }
          userData = responseData.user;
          accessToken = responseData.accessToken;
          refreshToken = responseData.refreshToken;
        } else if (responseData.data && responseData.data.user) {
          // { data: { data: { user: {...}, accessToken: '...', refreshToken: '...' } } }
          userData = responseData.data.user;
          accessToken = responseData.data.accessToken;
          refreshToken = responseData.data.refreshToken;
        } else {
          // 다른 구조인 경우 직접 확인
          console.error('예상치 못한 응답 구조:', responseData);
          toast({
            title: "로그인 오류",
            description: "응답 구조가 예상과 다릅니다. 관리자에게 문의하세요.",
            variant: "destructive",
          });
          return false;
        }
      } else {
        console.error('응답에 data 필드가 없습니다:', response);
        toast({
          title: "로그인 오류",
          description: "응답 구조가 예상과 다릅니다. 관리자에게 문의하세요.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('추출된 사용자 정보:', userData);
      console.log('추출된 토큰:', { accessToken, refreshToken });
      
      // 사용자 정보 검증
      if (!userData || !userData.id) {
        console.error('사용자 정보가 올바르지 않습니다:', userData);
        toast({
          title: "로그인 오류",
          description: "사용자 정보가 올바르지 않습니다. 관리자에게 문의하세요.",
          variant: "destructive",
        });
        return false;
      }
      
      // 토큰 검증
      if (!accessToken) {
        console.error('액세스 토큰이 없습니다:', { accessToken, refreshToken });
        toast({
          title: "로그인 오류",
          description: "인증 토큰이 없습니다. 관리자에게 문의하세요.",
          variant: "destructive",
        });
        return false;
      }
      
      // 사용자 정보 및 토큰 저장
      setUser(userData);
      
      // localStorage에 직접 사용자 정보 저장 (중첩 구조 제거)
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      
      // 디버깅을 위한 로그 추가
      console.log('localStorage에 저장된 사용자 정보:', JSON.parse(localStorage.getItem('user') || '{}'));
      console.log('localStorage에 저장된 토큰:', localStorage.getItem('token'));
      
      toast({
        title: "로그인 성공",
        description: `${userData.nickname}님 환영합니다!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "로그인 실패",
        description: "이메일 또는 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: UserSaveDto): Promise<boolean> => {
    try {
      setIsLoading(true);
      await apiSignup(userData);
      
      toast({
        title: "회원가입 성공",
        description: "로그인해주세요.",
      });
      
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      toast({
        title: "회원가입 실패",
        description: "이미 사용 중인 이메일이거나 입력 정보가 올바르지 않습니다.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await apiLogout(user.email);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 로컬 상태 초기화
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      toast({
        title: "로그아웃",
        description: "성공적으로 로그아웃되었습니다.",
      });
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
