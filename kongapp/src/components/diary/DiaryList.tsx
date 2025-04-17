'use client';

import { useState, useMemo } from 'react';
import { useMonthlyDiaries, useDeleteDiary } from '../../hooks/useDiary';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Trash2, Edit, Calendar, List } from 'lucide-react';
import { getEmotionEmoji, getEmotionColor } from '@/lib/emotionUtils';

interface DiaryListProps {
  userId: number;
  onEdit?: (diaryId: number) => void;
}

export default function DiaryList({ userId, onEdit }: DiaryListProps) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(format(currentDate, 'yyyyMM'));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDiaryId, setSelectedDiaryId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar'); 
  const [selectedDiary, setSelectedDiary] = useState<any | null>(null);
  
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
    setSelectedMonth(format(prevMonth, 'yyyyMM'));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
    setSelectedMonth(format(nextMonth, 'yyyyMM'));
  };

  const handleDeleteClick = (diaryId: number) => {
    setSelectedDiaryId(diaryId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDiaryId) {
      deleteDiaryMutation.mutate(selectedDiaryId, {
        onSuccess: () => {
          toast({
            title: "삭제 완료",
            description: "일기가 삭제되었습니다.",
          });
          setSelectedDiary(null);
        },
        onError: () => {
          toast({
            title: "오류",
            description: "일기 삭제 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      });
    }
    setDeleteDialogOpen(false);
  };

  // userId가 없을 경우 localStorage에서 사용자 정보 가져오기
  let currentUserId = userId;
  if (!currentUserId) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // 사용자 ID가 중첩된 구조인지 확인
        if (user.user && user.user.id) {
          currentUserId = user.user.id;
        } else if (user.id) {
          currentUserId = user.id;
        } else {
          console.error('사용자 ID를 찾을 수 없습니다:', user);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }

  const { data: diaries, isLoading, error } = useMonthlyDiaries(currentUserId, selectedMonth);
  const deleteDiaryMutation = useDeleteDiary();

  // 달력 데이터 생성
  const calendarDays = useMemo(() => {
    if (!currentDate) return [];
    
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // 첫 주의 시작 부분에 이전 달의 날짜 채우기
    const startDay = getDay(monthStart);
    const prevMonthDays = [];
    for (let i = 0; i < startDay; i++) {
      const prevDay = new Date(monthStart);
      prevDay.setDate(prevDay.getDate() - (startDay - i));
      prevMonthDays.push({ date: prevDay, isCurrentMonth: false });
    }
    
    // 현재 달의 날짜 채우기
    const currentMonthDays = days.map(day => {
      // 해당 날짜의 다이어리 찾기
      const dayDiaries = diaries?.filter(diary => 
        isSameDay(new Date(diary.date), day)
      ) || [];
      
      // 다이어리에 이모지와 색상 정보 추가
      const diariesWithEmoji = dayDiaries.map(diary => ({
        ...diary,
        emoji: getEmotionEmoji(diary.emotion),
        color: getEmotionColor(diary.emotion)
      }));
      
      return {
        date: day,
        isCurrentMonth: true,
        isToday: isToday(day),
        diaries: diariesWithEmoji
      };
    });
    
    // 마지막 주의 끝 부분에 다음 달의 날짜 채우기
    const endDay = getDay(monthEnd);
    const nextMonthDays = [];
    for (let i = 1; i < 7 - endDay; i++) {
      const nextDay = new Date(monthEnd);
      nextDay.setDate(nextDay.getDate() + i);
      nextMonthDays.push({ date: nextDay, isCurrentMonth: false });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentDate, diaries]);

  const formattedMonth = format(
    parse(selectedMonth, 'yyyyMM', new Date()),
    'yyyy년 M월',
    { locale: ko }
  );

  const handleDiaryClick = (diary: any) => {
    setSelectedDiary(diary);
  };

  const handleDayClick = (day: any) => {
    if (day.diaries && day.diaries.length > 0) {
      setSelectedDiary(day.diaries[0]);
    }
  };

  const closeSelectedDiary = () => {
    setSelectedDiary(null);
  };

  if (isLoading) return <div className="flex justify-center p-8 text-lg font-medium text-gray-900">로딩 중...</div>;
  if (error) return <div className="text-red-600 p-4 text-lg font-medium">에러가 발생했습니다.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 gradient-text">{formattedMonth}</h2>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1.5 mr-3 shadow-sm">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2.5 rounded-md flex items-center ${viewMode === 'calendar' ? 'bg-white shadow-sm font-medium text-primary' : 'text-gray-600 hover:text-gray-800'}`}
              aria-label="달력 보기"
            >
              <Calendar className="h-5 w-5 mr-1.5" />
              <span>달력</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-md flex items-center ${viewMode === 'list' ? 'bg-white shadow-sm font-medium text-primary' : 'text-gray-600 hover:text-gray-800'}`}
              aria-label="목록 보기"
            >
              <List className="h-5 w-5 mr-1.5" />
              <span>목록</span>
            </button>
          </div>
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-10 w-10 text-gray-900">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-10 w-10 text-gray-900">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {diaries && diaries.length > 0 ? (
            Object.entries(
              diaries.reduce((groups: Record<string, any[]>, diary) => {
                const date = format(new Date(diary.date), 'yyyy-MM-dd');
                if (!groups[date]) {
                  groups[date] = [];
                }
                // 이모지와 색상 정보 추가
                groups[date].push({
                  ...diary,
                  emoji: getEmotionEmoji(diary.emotion),
                  color: getEmotionColor(diary.emotion)
                });
                return groups;
              }, {})
            ).map(([date, diariesForDate]) => (
              <div key={date} className="glass-card p-4 mb-4">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {format(new Date(date), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                  </h3>
                  <div className="flex space-x-1">
                    {diariesForDate.map(diary => (
                      <span 
                        key={diary.id} 
                        className="text-2xl"
                        title={diary.emotion}
                      >
                        {diary.emoji}
                      </span>
                    ))}
                  </div>
                </div>
                
                {diariesForDate.map(diary => (
                  <div 
                    key={diary.id} 
                    className="p-3 mb-3 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => handleDiaryClick(diary)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-lg font-medium text-gray-900">{diary.title}</p>
                      <div 
                        className="px-2 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: `${diary.color}30`, color: diary.color }}
                      >
                        {diary.emotion}
                      </div>
                    </div>
                    <p className="text-base text-gray-800 line-clamp-2">{diary.content}</p>
                    <div className="flex justify-end mt-2 space-x-2">
                      {onEdit && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-sm font-medium text-gray-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(diary.id);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-sm font-medium text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(diary.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center p-10 glass-card rounded-xl">
              <p className="text-xl font-medium text-gray-900 mb-2">이 달에 작성된 일기가 없습니다.</p>
              <p className="text-lg font-medium text-gray-800">새로운 일기를 작성해보세요!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div key={day} className={`text-center py-2 font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isWeekend = getDay(day.date) === 0 || getDay(day.date) === 6;
              const hasDiary = day.diaries && day.diaries.length > 0;
              
              return (
                <div 
                  key={index}
                  onClick={() => day.isCurrentMonth && handleDayClick(day)}
                  className={`
                    min-h-24 p-2 border rounded-lg relative overflow-hidden
                    ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                    ${day.isToday ? 'border-primary border-2' : 'border-gray-200'}
                    ${hasDiary && day.isCurrentMonth ? 'cursor-pointer hover:border-primary' : ''}
                  `}
                >
                  {/* 날짜 표시 */}
                  <div className={`
                    text-right font-medium mb-1 z-10 relative
                    ${getDay(day.date) === 0 ? 'text-red-500' : getDay(day.date) === 6 ? 'text-blue-500' : 'text-gray-700'}
                    ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                  `}>
                    {format(day.date, 'd')}
                  </div>
                  
                  {/* 감정 이모지 표시 */}
                  {day.isCurrentMonth && hasDiary && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className={`
                          w-16 h-16 rounded-full flex items-center justify-center
                          ${day.diaries.length === 1 ? 'opacity-90' : 'opacity-0'}
                        `}
                        style={{ 
                          backgroundColor: day.diaries[0].color || '#C2E4B8',
                          zIndex: 0
                        }}
                      >
                        {day.diaries.length === 1 && (
                          <span className="text-3xl">{day.diaries[0].emoji}</span>
                        )}
                      </div>
                      
                      {/* 여러 일기가 있는 경우 이모지 그리드로 표시 */}
                      {day.diaries.length > 1 && (
                        <div className="grid grid-cols-2 gap-1 z-10">
                          {day.diaries.slice(0, 4).map((diary, i) => (
                            <div 
                              key={diary.id}
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: diary.color || '#C2E4B8' }}
                            >
                              <span className="text-base">{diary.emoji}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 4개 이상의 일기가 있는 경우 더 있음 표시 */}
                      {day.diaries.length > 4 && (
                        <div className="absolute bottom-1 right-2 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center z-10">
                          +{day.diaries.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 선택된 일기 상세 보기 */}
      {selectedDiary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6 relative">
            <button 
              onClick={closeSelectedDiary}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{selectedDiary.title}</h3>
              {selectedDiary.emoji && (
                <span className="text-4xl">{selectedDiary.emoji}</span>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-base font-medium text-gray-800 mb-2">
                {format(new Date(selectedDiary.date), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
              </p>
              {selectedDiary.emotion && (
                <div 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${getEmotionColor(selectedDiary.emotion)}30`, color: getEmotionColor(selectedDiary.emotion) }}
                >
                  {selectedDiary.emotion}
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <p className="text-lg font-medium text-gray-900 whitespace-pre-wrap">{selectedDiary.content}</p>
            </div>
            
            {selectedDiary.sentimentText && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-base font-medium text-gray-800">{selectedDiary.sentimentText}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-base font-medium text-gray-900"
                  onClick={() => {
                    onEdit(selectedDiary.id);
                    closeSelectedDiary();
                  }}
                >
                  <Edit className="h-5 w-5 mr-2" />
                  수정
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 text-base font-medium"
                onClick={() => {
                  handleDeleteClick(selectedDiary.id);
                  closeSelectedDiary();
                }}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-effect">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">일기 삭제</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium text-gray-800">
              정말로 이 일기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base font-medium text-gray-900">취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-base font-medium">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
