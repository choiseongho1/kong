'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DiaryInput from '@/components/diary/DiaryInput';
import { useAuth } from '@/contexts/AuthContext';
import { getDiariesByMonth } from '@/lib/diaryApi';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getEmotionEmoji, getEmotionColor } from '@/lib/emotionUtils';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/common/Header';

export default function DiaryPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedDiary, setSelectedDiary] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // 현재 연도와 월 가져오기
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
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
          toast({
            title: "로그인이 필요합니다",
            description: "일기를 보려면 로그인이 필요해요.",
            variant: "destructive",
          });
          router.push('/auth');
        }
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        toast({
          title: "로그인이 필요합니다",
          description: "일기를 보려면 로그인이 필요해요.",
          variant: "destructive",
        });
        router.push('/auth');
      }
    } else {
      toast({
        title: "로그인이 필요합니다",
        description: "일기를 보려면 로그인이 필요해요.",
        variant: "destructive",
      });
      router.push('/auth');
    }
  }, [router, toast]);

  // 월별 다이어리 조회
  const { data: diaries, isLoading, error } = useQuery({
    queryKey: ['diaries', userId, currentYear, currentMonth],
    queryFn: () => userId ? getDiariesByMonth(userId, currentYear, currentMonth) : Promise.resolve([]),
    enabled: !!userId,
  });

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleResetToCurrentMonth = () => {
    setCurrentDate(new Date());
    toast({
      title: "현재 달로 이동했어요 🐱",
      description: `${format(new Date(), 'yyyy년 M월')}로 돌아왔어요!`,
      variant: "default",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'M월 d일 (EEE)', { locale: ko });
  };

  // 달력 데이터 생성
  const calendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    // 요일 계산을 위해 첫 주의 시작 부분에 이전 달의 날짜 채우기
    const startDay = getDay(monthStart);
    const prevMonthDays = [];
    
    if (startDay !== 0) { // 일요일(0)이 아닌 경우에만 이전 달 날짜 추가
      for (let i = 0; i < startDay; i++) {
        const prevDay = new Date(monthStart);
        prevDay.setDate(prevDay.getDate() - (startDay - i));
        prevMonthDays.push(prevDay);
      }
    }
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // 마지막 주의 남은 부분을 다음 달의 날짜로 채우기
    const lastDay = getDay(monthEnd);
    const nextMonthDays = [];
    
    if (lastDay !== 6) { // 토요일(6)이 아닌 경우에만 다음 달 날짜 추가
      for (let i = 1; i < 7 - lastDay; i++) {
        const nextDay = new Date(monthEnd);
        nextDay.setDate(nextDay.getDate() + i);
        nextMonthDays.push(nextDay);
      }
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  };

  // 특정 날짜의 일기 이모지와 감정 가져오기
  const getDiaryInfo = (day: Date): { emoji: string | null; emotion: string | null } => {
    if (!diaries) return { emoji: null, emotion: null };
    
    const diaryForDay = diaries.find(diary => {
      const diaryDate = new Date(diary.date);
      return isSameDay(diaryDate, day);
    });
    
    if (!diaryForDay) return { emoji: null, emotion: null };
    
    // 감정 정보 추출 (다양한 필드 이름 지원)
    let emotion = null;
    
    // 1. mood 필드 확인 (기본 감정 필드)
    if (diaryForDay.mood) {
      emotion = diaryForDay.mood;
    } 
    // 2. sentiment 필드가 문자열인 경우
    else if (diaryForDay.sentiment && typeof diaryForDay.sentiment === 'string') {
      emotion = diaryForDay.sentiment;
    } 
    // 3. sentiment 필드가 객체인 경우
    else if (diaryForDay.sentiment && typeof diaryForDay.sentiment === 'object') {
      if (diaryForDay.sentiment.sentiment) {
        emotion = diaryForDay.sentiment.sentiment;
      }
    } 
    // 4. emotion 필드 확인
    else if (diaryForDay.emotion) {
      emotion = diaryForDay.emotion;
    }
    // 5. 기본값
    else {
      emotion = 'neutral';
    }
    
    // 이모지 추출 (직접 저장된 이모지가 있으면 사용, 없으면 감정에 따라 생성)
    const emoji = diaryForDay.emoji || getEmotionEmoji(emotion);
    
    return { emoji, emotion };
  };

  const handleDayClick = (day: Date) => {
    if (!diaries) return;
    
    const diaryForDay = diaries.find(diary => {
      const diaryDate = new Date(diary.date);
      return isSameDay(diaryDate, day);
    });
    
    if (diaryForDay) {
      setSelectedDiary(diaryForDay);
      setIsDialogOpen(true);
    } else {
      // 일기가 없는 날짜 클릭 시
      toast({
        title: "일기가 없어요",
        description: "이 날짜에는 작성된 일기가 없어요.",
        variant: "default",
      });
    }
  };

  // 요일 헤더 생성
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="font-handwriting text-lg">로그인 정보를 확인하고 있어요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 달력 섹션 */}
          <div className="md:w-1/2">
            <Card className="glass-card cat-paw-bg overflow-hidden border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <button 
                    onClick={handlePrevMonth}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h2 
                    className="text-2xl font-handwriting relative cursor-pointer hover:text-primary transition-colors"
                    onClick={handleResetToCurrentMonth}
                  >
                    <span className="relative z-10">{format(currentDate, 'yyyy년 M월', { locale: ko })}</span>
                    <span className="absolute -bottom-1 left-0 right-0 h-3 bg-yellow-200 opacity-50 z-0"></span>
                  </h2>
                  <button 
                    onClick={handleNextMonth}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
                
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 mb-4">
                  {weekDays.map((day, index) => (
                    <div 
                      key={index} 
                      className={`text-center font-handwriting py-2 text-sm
                        ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* 달력 그리드 */}
                <div className="grid grid-cols-7 gap-2 px-1">
                  {calendarDays().map((day, index) => {
                    const { emoji, emotion } = getDiaryInfo(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);
                    const isSunday = getDay(day) === 0;
                    const isSaturday = getDay(day) === 6;
                    const hasEntry = emoji !== null;
                    const bgColor = emotion ? getEmotionColor(emotion) : '#E2E8F0';
                    
                    return (
                      <div 
                        key={index}
                        onClick={() => handleDayClick(day)}
                        className={`
                          min-h-[80px] p-1 rounded-xl cursor-pointer relative overflow-hidden transition-all duration-300
                          ${isCurrentDay ? 'ring-2 ring-primary ring-offset-2' : ''}
                          ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                          ${hasEntry ? 'shadow-sm hover:shadow-md' : 'hover:bg-gray-100'}
                          ${!isCurrentMonth ? 'opacity-40' : ''}
                        `}
                      >
                        {/* 고양이 발자국 배경 (일기가 있는 날에만) */}
                        {hasEntry && isCurrentMonth && (
                          <div className="absolute inset-0 opacity-5 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-full h-full text-gray-900">
                              <path fill="currentColor" d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3v-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z" />
                            </svg>
                          </div>
                        )}
                        
                        <div 
                          className={`
                            text-lg font-medium pl-2 pt-1 font-handwriting
                            ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700'}
                          `}
                        >
                          {format(day, 'd')}
                        </div>
                        
                        {hasEntry && (
                          <div className="flex justify-center items-center h-12 mt-1">
                            <div 
                              style={{ backgroundColor: `${bgColor}40` }}
                              className={`
                                w-12 h-12 rounded-full flex items-center justify-center
                                text-xl transition-all duration-300 hover:scale-110 shadow-sm
                              `}
                            >
                              <span className="text-2xl">{emoji}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 일기 입력 섹션 */}
          <div className="md:w-1/2">
            <Card className="glass-card overflow-hidden border-0 shadow-lg h-full">
              <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                <h2 className="text-2xl font-handwriting mb-6 relative inline-block">
                  <span className="relative z-10">오늘의 일기</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-3 bg-yellow-200 opacity-50 z-0"></span>
                </h2>
                
                <DiaryInput />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 다이어리 상세 다이얼로그 */}
      {selectedDiary && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-xl border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-handwriting flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                {format(new Date(selectedDiary.date), 'yyyy년 M월 d일 (EEE)', { locale: ko })}의 일기
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(selectedDiary.emotion || selectedDiary.mood || (selectedDiary.sentiment && typeof selectedDiary.sentiment === 'string')) && (
                <div 
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  style={{ 
                    backgroundColor: `${getEmotionColor(
                      selectedDiary.mood || 
                      (typeof selectedDiary.sentiment === 'string' 
                        ? selectedDiary.sentiment 
                        : selectedDiary.emotion || 'neutral')
                    )}30`, 
                    color: getEmotionColor(
                      selectedDiary.mood || 
                      (typeof selectedDiary.sentiment === 'string' 
                        ? selectedDiary.sentiment 
                        : selectedDiary.emotion || 'neutral')
                    ) 
                  }}
                >
                  <span className="mr-2 text-xl">
                    {selectedDiary.emoji || getEmotionEmoji(
                      selectedDiary.mood || 
                      (typeof selectedDiary.sentiment === 'string' 
                        ? selectedDiary.sentiment 
                        : selectedDiary.emotion || 'neutral')
                    )}
                  </span>
                  {selectedDiary.mood || 
                   (typeof selectedDiary.sentiment === 'string' 
                    ? selectedDiary.sentiment 
                    : selectedDiary.emotion || 'neutral')}
                </div>
              )}
              
              <p className="text-lg font-poorstory text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {selectedDiary.content || ''}
              </p>
              
              {selectedDiary.sentimentText && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-base font-handwriting text-gray-800">{selectedDiary.sentimentText}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
