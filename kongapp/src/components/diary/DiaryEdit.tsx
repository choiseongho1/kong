'use client';

import { useState, useEffect } from 'react';
import { useUpdateDiary, useMonthlyDiaries } from '../../hooks/useDiary';
import type { DiarySaveDto } from '../../lib/diaryApi';
import { analyzeSentiment } from '@/lib/sentimentApi';
import { getEmotionEmoji, getEmotionColor } from '@/lib/emotionUtils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';

interface DiaryEditProps {
  userId: number;
  diaryId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DiaryEdit({ userId, diaryId, onSuccess, onCancel }: DiaryEditProps) {
  const { toast } = useToast();
  const [diary, setDiary] = useState<DiarySaveDto>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    mood: '',
    weather: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 현재 월 가져오기
  const currentYearMonth = format(new Date(), 'yyyyMM');
  const { data: diaries } = useMonthlyDiaries(userId, currentYearMonth);
  const updateDiaryMutation = useUpdateDiary();

  // 다이어리 데이터 로드
  useEffect(() => {
    if (diaries) {
      const foundDiary = diaries.find(d => d.id === diaryId);
      if (foundDiary) {
        setDiary({
          title: foundDiary.title,
          content: foundDiary.content,
          date: foundDiary.date,
          mood: foundDiary.mood || '',
          weather: foundDiary.weather || '',
          sentiment: foundDiary.sentiment,
          emoji: foundDiary.emoji,
          sentimentText: foundDiary.sentimentText,
        });
        setIsLoading(false);
      }
    }
  }, [diaries, diaryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDiary((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnalyzeSentiment = async () => {
    if (diary.content.trim() === '') {
      toast({
        title: "오류",
        description: "일기 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const sentiment = await analyzeSentiment({ diaryEntry: diary.content });
      setDiary(prev => ({
        ...prev,
        sentiment: sentiment.sentiment,
        emoji: sentiment.emoji,
        sentimentText: sentiment.text
      }));
      
      toast({
        title: "감정 분석 완료",
        description: `${sentiment.emoji} ${sentiment.text}`,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "감정 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (diary.title.trim() === '' || diary.content.trim() === '') {
      toast({
        title: "오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 감정 분석이 되지 않았다면 자동으로 분석
    if (!diary.sentiment) {
      await handleAnalyzeSentiment();
    }

    // localStorage에서 사용자 ID 가져오기
    let currentUserId = userId;
    if (!currentUserId) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        currentUserId = user.id;
      }
    }
    
    if (!currentUserId) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    updateDiaryMutation.mutate(
      { diaryId, diary },
      {
        onSuccess: (data) => {
          toast({
            title: "성공",
            description: "일기가 수정되었습니다!",
          });
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast({
            title: "오류",
            description: "일기 수정 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (isLoading) return <div className="flex justify-center p-8">로딩 중...</div>;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>일기 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">제목</label>
            <Input
              id="title"
              name="title"
              value={diary.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">날짜</label>
            <Input
              type="date"
              id="date"
              name="date"
              value={diary.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">내용</label>
            <Textarea
              id="content"
              name="content"
              value={diary.content}
              onChange={handleChange}
              rows={6}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="mood" className="text-sm font-medium">기분</label>
              <Input
                id="mood"
                name="mood"
                value={diary.mood || ''}
                onChange={handleChange}
                placeholder="행복, 슬픔, 기쁨 등"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="weather" className="text-sm font-medium">날씨</label>
              <Input
                id="weather"
                name="weather"
                value={diary.weather || ''}
                onChange={handleChange}
                placeholder="맑음, 비, 흐림 등"
              />
            </div>
          </div>
          
          {diary.sentiment && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-lg font-medium">감정 분석 결과</p>
              <p className="text-2xl">{diary.emoji}</p>
              <p>{diary.sentimentText}</p>
            </div>
          )}
          
          <div className="flex justify-between pt-4">
            <div className="space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAnalyzeSentiment}
                disabled={isAnalyzing || updateDiaryMutation.isPending}
              >
                {isAnalyzing ? '분석 중...' : '감정 다시 분석하기'}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancel}
                disabled={updateDiaryMutation.isPending}
              >
                취소
              </Button>
            </div>
            
            <Button 
              type="submit" 
              disabled={updateDiaryMutation.isPending}
            >
              {updateDiaryMutation.isPending ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
