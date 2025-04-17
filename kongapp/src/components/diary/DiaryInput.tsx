'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createDiary } from '@/lib/diaryApi';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function DiaryInput() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // 사용자 ID가 중첩된 구조인지 확인
        if (parsedUser.user && parsedUser.user.id) {
          setUserId(parsedUser.user.id);
        } else if (parsedUser.id) {
          setUserId(parsedUser.id);
        } else {
          console.error('사용자 ID를 찾을 수 없습니다:', parsedUser);
        }
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "내용을 입력해주세요 😿",
        description: "일기 내용을 작성해야 저장할 수 있어요.",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "로그인이 필요합니다 😿",
        description: "일기를 저장하려면 로그인이 필요해요.",
        variant: "destructive",
      });
      router.push('/auth');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 다이어리 생성 요청
      const result = await createDiary(userId, {
        content: content,
        title: content.substring(0, 20) + (content.length > 20 ? '...' : ''),
        emotion: 'neutral',
        emoji: '😽',
        sentimentText: '오늘의 일기를 기록했어요',
      });
      
      setContent('');
      
      toast({
        title: "일기가 저장되었어요! 😺",
        description: "오늘의 한 줄 일기가 성공적으로 저장되었습니다.",
        variant: "default",
      });
      
      // 현재 연도와 월 가져오기
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      // React Query 캐시 갱신
      queryClient.invalidateQueries({
        queryKey: ['diaries', userId, currentYear, currentMonth],
      });
      
    } catch (error) {
      console.error('일기 저장 오류:', error);
      toast({
        title: "일기 저장에 실패했어요 😿",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full mb-6">
      <div className="flex-grow mb-6">
        <textarea
          ref={textareaRef}
          className="w-full h-full min-h-[200px] resize-none p-6 text-lg font-medium border-gray-200 focus:border-primary focus:ring-primary rounded-xl shadow-sm"
          placeholder="오늘 어떤 일이 있었나요? 콩이에게 이야기해주세요..."
          value={content}
          onChange={handleContentChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex justify-end">
        <button 
          type="submit"
          className="bg-primary hover:bg-primary/90 text-white font-handwriting px-6 py-3 rounded-xl text-lg"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              저장 중...
            </div>
          ) : (
            <>저장하기</>
          )}
        </button>
      </div>
    </div>
  );
}
