'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSaveDto } from '@/lib/authApi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export default function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserSaveDto>({
    email: '',
    password: '',
    nickname: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!userData.email || !userData.password || !userData.nickname) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (userData.password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    const success = await signup(userData);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-handwriting mb-6 relative inline-block">
        <span className="relative z-10">회원가입</span>
        <span className="absolute -bottom-1 left-0 right-0 h-3 bg-yellow-200 opacity-50 z-0"></span>
      </h2>
      <p className="text-base font-poorstory text-gray-600 mb-6">새 계정을 만들어보세요.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-base font-medium">이메일 *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="example@email.com"
            value={userData.email}
            onChange={handleChange}
            required
            className="h-12 px-4 text-base"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="nickname" className="text-base font-medium">닉네임 *</Label>
          <Input
            id="nickname"
            name="nickname"
            placeholder="사용할 닉네임을 입력하세요"
            value={userData.nickname}
            onChange={handleChange}
            required
            className="h-12 px-4 text-base"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="password" className="text-base font-medium">비밀번호 *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="안전한 비밀번호를 입력하세요"
            value={userData.password}
            onChange={handleChange}
            required
            className="h-12 px-4 text-base"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="confirmPassword" className="text-base font-medium">비밀번호 확인 *</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
            className="h-12 px-4 text-base"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-handwriting bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              가입 중...
            </div>
          ) : (
            <>
              <UserPlus className="mr-2 h-5 w-5" />
              회원가입
            </>
          )}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <Button 
          variant="link" 
          onClick={onLoginClick}
          className="text-base font-poorstory text-primary"
        >
          이미 계정이 있으신가요? 로그인
        </Button>
      </div>
    </div>
  );
}
