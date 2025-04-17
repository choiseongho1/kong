"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/common/Header';
import { getEmotionEmoji, getEmotionColor } from '@/lib/emotionUtils';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useMonthlyDiaries } from '@/hooks/useDiary';
import { DiaryDetailDto } from '@/lib/diaryApi';

interface DiaryEntry extends DiaryDetailDto {
  content?: string;
  text?: string;
  sentiment?: {
    sentiment: string;
    emoji: string;
    text: string;
  };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // 현재 날짜에서 연도와 월 추출
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript의 월은 0부터 시작하므로 +1
  
  // 사용자 ID 가져오기
  const [userId, setUserId] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // 사용자 ID가 중첩된 구조인지 확인
        if (user.user && user.user.id) {
          setUserId(Number(user.user.id));
        } else if (user.id) {
          setUserId(Number(user.id));
        } else {
          console.error('사용자 ID를 찾을 수 없습니다:', user);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }, []);
  
  // useMonthlyDiaries 훅을 사용하여 API에서 월별 다이어리 데이터 가져오기
  const { data: diaryEntries, isLoading, error } = useMonthlyDiaries(userId, currentYear, currentMonth);
  
  // 날짜별 일기 데이터를 저장할 맵
  const diaryDateMap = new Map<string, DiaryEntry[]>();
  
  // 다이어리 데이터가 있으면 날짜별로 정리
  useEffect(() => {
    if (diaryEntries && diaryEntries.length > 0) {
      const newMap = new Map<string, DiaryEntry[]>();
      
      diaryEntries.forEach((entry: DiaryEntry) => {
        const dateStr = entry.date.split('T')[0]; // ISO 형식에서 날짜 부분만 추출
        if (!newMap.has(dateStr)) {
          newMap.set(dateStr, []);
        }
        newMap.get(dateStr)?.push(entry);
      });
      
      // 디버깅용 로그
      console.log('날짜별 다이어리 데이터:', Object.fromEntries(newMap));
    }
  }, [diaryEntries]);

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    if (diaryEntries) {
      // 선택한 날짜의 다이어리 찾기
      const entriesForDate = diaryEntries.filter(entry => 
        entry.date.startsWith(dateStr)
      );
      
      if (entriesForDate.length > 0) {
        setSelectedDiary(entriesForDate[0]);
        setIsDialogOpen(true);
      } else {
        toast({
          title: "알림",
          description: "선택한 날짜에 작성된 일기가 없습니다.",
        });
      }
    }
  };

  // 달력 데이터 생성
  const calendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // 요일 계산을 위해 첫 주의 시작 부분에 이전 달의 날짜 채우기
    const startDay = getDay(monthStart);
    const prevMonthDays = [];
    
    for (let i = 0; i < startDay; i++) {
      const prevDay = new Date(monthStart);
      prevDay.setDate(prevDay.getDate() - (startDay - i));
      prevMonthDays.push(prevDay);
    }
    
    // 마지막 주의 남은 부분을 다음 달의 날짜로 채우기
    const lastDay = getDay(monthEnd);
    const nextMonthDays = [];
    
    for (let i = 1; i < 7 - lastDay; i++) {
      const nextDay = new Date(monthEnd);
      nextDay.setDate(nextDay.getDate() + i);
      nextMonthDays.push(nextDay);
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  };

  // 특정 날짜의 일기 이모지와 감정 가져오기
  const getDiaryInfo = (day: Date): { emoji: string | null; emotion: string | null } => {
    if (!diaryEntries) return { emoji: null, emotion: null };
    
    const dateStr = format(day, 'yyyy-MM-dd');
    
    // 해당 날짜의 다이어리 찾기
    const entriesForDate = diaryEntries.filter(entry => 
      entry.date.startsWith(dateStr)
    );
    
    if (entriesForDate.length > 0) {
      const entry = entriesForDate[0];
      let emoji = null;
      let emotion = null;
      
      // mood 필드가 있으면 우선적으로 사용
      if (entry.mood) {
        emotion = entry.mood;
        emoji = getEmotionEmoji(entry.mood);
        return { emoji, emotion };
      }
      
      // 기존 로직은 fallback으로 유지
      if (entry.emoji) {
        emoji = entry.emoji;
      } else if (entry.emotion) {
        emoji = getEmotionEmoji(entry.emotion);
        emotion = entry.emotion;
      } else if (entry.sentiment) {
        if (typeof entry.sentiment === 'string') {
          emoji = getEmotionEmoji(entry.sentiment);
          emotion = entry.sentiment;
        } else if (entry.sentiment.emoji) {
          emoji = entry.sentiment.emoji;
          emotion = entry.sentiment.sentiment;
        } else if (entry.sentiment.sentiment) {
          emoji = getEmotionEmoji(entry.sentiment.sentiment);
          emotion = entry.sentiment.sentiment;
        }
      }
      
      // 기본 이모지 반환
      if (!emoji) emoji = '🐱';
      if (!emotion) emotion = 'neutral';
      
      return { emoji, emotion };
    }
    
    return { emoji: null, emotion: null };
  };

  // 요일 헤더 생성
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Header />
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-500 mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-700">다이어리 데이터를 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Header />
      
      <div className="mb-8 flex items-center">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h2 className="text-3xl font-handwriting">
          <span className="text-primary">달력</span>으로 일기 보기
        </h2>
      </div>
      
      <Card className="glass-card cat-paw-bg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-2xl font-bold flex items-center">
            <span className="gradient-text">{format(currentDate, 'yyyy. MM', { locale: ko })}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`text-center py-2 text-sm font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'}`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays().map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday_ = isToday(day);
              const { emoji, emotion } = getDiaryInfo(day);
              const hasEntry = !!emoji;
              
              // 요일에 따른 텍스트 색상
              const dayOfWeek = getDay(day);
              const isSunday = dayOfWeek === 0;
              const isSaturday = dayOfWeek === 6;
              
              // 감정에 따른 배경색 설정
              const bgColor = emotion ? getEmotionColor(emotion) : '#FFD166';
              
              return (
                <div 
                  key={index}
                  onClick={() => isCurrentMonth && handleDayClick(day)}
                  className={`
                    relative h-16 p-1 rounded-lg transition-all duration-200
                    ${isCurrentMonth ? 'cursor-pointer hover:bg-gray-100' : 'opacity-40'}
                    ${isToday_ ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <div 
                    className={`
                      text-xs font-medium mb-1
                      ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700'}
                      ${!isCurrentMonth ? 'opacity-50' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </div>
                  
                  {hasEntry && (
                    <div className="flex justify-center items-center h-10">
                      <div 
                        style={{ backgroundColor: isCurrentMonth ? bgColor : '#E2E8F0' }}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          text-lg transition-transform duration-200 hover:scale-110
                        `}
                      >
                        <span className="text-xl">{emoji}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {selectedDiary && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {format(new Date(selectedDiary.date), 'yyyy년 M월 d일 (EEE)', { locale: ko })}의 일기
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(selectedDiary.emotion || (selectedDiary.sentiment && typeof selectedDiary.sentiment === 'string')) && (
                <div 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${getEmotionColor(
                      typeof selectedDiary.sentiment === 'string' 
                        ? selectedDiary.sentiment 
                        : selectedDiary.emotion || 'neutral'
                    )}30`, 
                    color: getEmotionColor(
                      typeof selectedDiary.sentiment === 'string' 
                        ? selectedDiary.sentiment 
                        : selectedDiary.emotion || 'neutral'
                    ) 
                  }}
                >
                  <span className="mr-2">
                    {selectedDiary.emoji || getEmotionEmoji(
                      typeof selectedDiary.sentiment === 'string' 
                        ? selectedDiary.sentiment 
                        : selectedDiary.emotion || 'neutral'
                    )}
                  </span>
                  {typeof selectedDiary.sentiment === 'string' 
                    ? selectedDiary.sentiment 
                    : selectedDiary.emotion || 'neutral'}
                </div>
              )}
              
              <p className="text-lg font-medium text-gray-900 whitespace-pre-wrap">
                {selectedDiary.content || ''}
              </p>
              
              {selectedDiary.sentimentText && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-base font-medium text-gray-800">{selectedDiary.sentimentText}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
