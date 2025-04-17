'use client';

import { useState, useEffect } from 'react';
import { useCreateDiary } from '../../hooks/useDiary';
import type { DiarySaveDto } from '../../lib/diaryApi';
import { analyzeSentiment } from '@/lib/sentimentApi';
import { getEmotionEmoji, getEmotionColor } from '@/lib/emotionUtils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface DiaryFormProps {
  userId: number;
  onSuccess?: () => void;
}

export default function DiaryForm({ userId, onSuccess }: DiaryFormProps) {
  const { toast } = useToast();
  const [diary, setDiary] = useState<DiarySaveDto>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0], // yyyy-MM-dd 형식
    mood: '',
    weather: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 컴포넌트 마운트 시 localStorage 디버깅
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      console.log('DiaryForm - localStorage 원본 데이터:', storedUser);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('DiaryForm - 파싱된 사용자 정보:', parsedUser);
        console.log('DiaryForm - 사용자 ID 존재 여부:', !!parsedUser.id);
      } else {
        console.log('DiaryForm - localStorage에 user 정보 없음');
      }
    } catch (error) {
      console.error('DiaryForm - localStorage 파싱 오류:', error);
    }
  }, []);

  const createDiaryMutation = useCreateDiary();

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
    
    // userId가 없거나 undefined인 경우 localStorage에서 가져오기
    if (!currentUserId) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedData = JSON.parse(storedUser);
          console.log('DiaryForm.handleSubmit - localStorage 데이터:', parsedData);
          
          // 사용자 정보가 user 객체 안에 있는 경우
          if (parsedData.user && parsedData.user.id) {
            currentUserId = parsedData.user.id;
            console.log('DiaryForm.handleSubmit - user 객체 내부에서 ID 추출:', currentUserId);
          } else if (parsedData.id) {
            currentUserId = parsedData.id;
            console.log('DiaryForm.handleSubmit - 최상위에서 ID 추출:', currentUserId);
          } else {
            console.error('DiaryForm.handleSubmit - 사용자 정보 구조가 올바르지 않습니다:', parsedData);
          }
        }
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
      }
    }

    console.log('저장 시도:', { userId: currentUserId, diary });
    
    if (!currentUserId) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // 실제 API 호출 시 직접 currentUserId 사용
    try {
      const response = await createDiaryMutation.mutateAsync(
        { userId: currentUserId, diary }
      );
      
      console.log('저장 성공:', response);
      toast({
        title: "성공",
        description: "일기가 저장되었습니다!",
      });
      
      setDiary({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        mood: '',
        weather: '',
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('저장 실패:', error);
      toast({
        title: "오류",
        description: "일기 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>새 일기 작성</CardTitle>
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAnalyzeSentiment}
              disabled={isAnalyzing || createDiaryMutation.isPending}
            >
              {isAnalyzing ? '분석 중...' : '감정 분석하기'}
            </Button>
            
            <Button 
              type="submit" 
              disabled={createDiaryMutation.isPending}
            >
              {createDiaryMutation.isPending ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
