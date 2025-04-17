"use client";

import { useState, useEffect } from 'react';
import { getEmotionEmoji, getEmotionColor } from '@/lib/emotionUtils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import Header from '@/components/common/Header';
import { Calendar, ArrowRight, PenLine } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getDiariesByMonth, DiaryDetailDto } from '@/lib/diaryApi';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryDetailDto | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // 현재 연도와 월 가져오기
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

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

  // 월별 다이어리 조회
  const { data: diaries, isLoading: isLoadingDiaries, error } = useQuery({
    queryKey: ['diaries', userId, currentYear, currentMonth],
    queryFn: () => userId ? getDiariesByMonth(userId, currentYear, currentMonth) : Promise.resolve([]),
    enabled: !!userId,
  });

  const handleEntryClick = (entry: DiaryDetailDto) => {
    setSelectedEntry(entry);
    setOpen(true);
  };

  const handleWriteDiary = () => {
    router.push('/diary');
  };

  // 최근 일기 5개만 표시
  const recentEntries = diaries ? [...diaries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5) : [];

  return (
    <main className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 일기 작성 버튼 섹션 */}
        <section className="mb-12">
          <Card className="glass-card cat-paw-bg overflow-hidden border-0 shadow-lg">
            <CardContent className="p-8 sm:p-10">
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl font-handwriting relative mb-6">
                  <span className="relative z-10">콩이의 오늘 한마디</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-3 bg-yellow-200 opacity-50 z-0"></span>
                </h2>
                
                <p className="text-gray-600 font-poorstory mb-8 max-w-lg px-4">
                  오늘 하루는 어땠나요? 당신의 감정을 기록하고 AI가 분석해드릴게요.
                </p>
                
                <Button 
                  onClick={handleWriteDiary}
                  className="bg-primary hover:bg-primary/90 text-white font-handwriting px-8 py-4 rounded-xl text-lg"
                >
                  <PenLine className="mr-3 h-5 w-5" />
                  일기 작성하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* 최근 일기 목록 */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-handwriting relative inline-block">
              <span className="relative z-10">최근 일기</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-pink-200 opacity-50 z-0"></span>
            </h2>
            
            <Link href="/diary">
              <Button variant="outline" className="font-handwriting px-4">
                <Calendar className="mr-2 h-4 w-4" />
                달력으로 보기
              </Button>
            </Link>
          </div>
          
          {isLoadingDiaries ? (
            <div className="text-center py-16">
              <div className="loading-spinner inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-6"></div>
              <p className="font-handwriting text-lg">일기를 불러오고 있어요...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-handwriting text-lg mb-4">일기를 불러오는데 실패했어요 😿</p>
              <p className="text-gray-600 font-poorstory">잠시 후 다시 시도해주세요.</p>
            </div>
          ) : recentEntries.length === 0 ? (
            <Card className="glass-card overflow-hidden border-0 shadow-sm p-10 text-center">
              <div className="text-6xl mb-6">😺</div>
              <p className="font-handwriting text-xl mb-3">아직 일기가 없어요</p>
              <p className="text-gray-600 font-poorstory">첫 번째 일기를 작성해보세요!</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {recentEntries.map((entry) => (
                <Card 
                  key={entry.id} 
                  className="glass-card overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEntryClick(entry)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
                        style={{ 
                          backgroundColor: `${getEmotionColor(entry.mood || entry.emotion || 'neutral')}30`
                        }}
                      >
                        {entry.emoji || getEmotionEmoji(entry.mood || entry.emotion || 'neutral')}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-handwriting text-lg text-gray-900 line-clamp-1">
                            {entry.content}
                          </p>
                          <span className="text-xs text-gray-500 shrink-0 ml-3">
                            {format(new Date(entry.date), 'M월 d일 (EEE)', { locale: ko })}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 font-poorstory">
                          {entry.sentimentText || `이 글에서는 ${entry.mood || entry.emotion || 'neutral'} 감정이 느껴져요`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {diaries && diaries.length > 5 && (
                <div className="text-center pt-4">
                  <Link href="/diary">
                    <Button variant="link" className="font-handwriting text-primary text-lg">
                      더 많은 일기 보기
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* 일기 상세 다이얼로그 */}
      {selectedEntry && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md rounded-xl border-0 shadow-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-handwriting flex items-center gap-2 mb-2">
                <span className="text-2xl">🐾</span>
                {format(new Date(selectedEntry.date), 'yyyy년 M월 d일 (EEE)', { locale: ko })}의 일기
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-2">
              <div 
                className="inline-flex items-center px-5 py-3 rounded-full text-sm font-medium shadow-sm"
                style={{ 
                  backgroundColor: `${getEmotionColor(selectedEntry.mood || selectedEntry.emotion || 'neutral')}30`, 
                  color: getEmotionColor(selectedEntry.mood || selectedEntry.emotion || 'neutral') 
                }}
              >
                <span className="mr-3 text-xl">{selectedEntry.emoji || getEmotionEmoji(selectedEntry.mood || selectedEntry.emotion || 'neutral')}</span>
                {selectedEntry.mood || selectedEntry.emotion || 'neutral'}
              </div>
              
              <p className="text-lg font-poorstory text-gray-900 whitespace-pre-wrap bg-gray-50 p-5 rounded-lg">
                {selectedEntry.content}
              </p>
              
              {selectedEntry.sentimentText && (
                <div className="p-5 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-base font-handwriting text-gray-800">{selectedEntry.sentimentText}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
