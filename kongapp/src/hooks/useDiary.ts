import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDiary, updateDiary, deleteDiary, getDiariesByMonth, DiarySaveDto, DiaryDetailDto } from '@/lib/diaryApi';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

// 월별 다이어리 조회 훅
export const useMonthlyDiaries = (userId?: number, year?: number, month?: number) => {
  let currentUserId = userId;
  
  // 클라이언트 측에서만 localStorage에 접근
  const [storedUserId, setStoredUserId] = useState<number | null>(null);
  
  useEffect(() => {
    if (!currentUserId) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedData = JSON.parse(storedUser);
          console.log('useMonthlyDiaries - localStorage 데이터:', parsedData);
          
          if (parsedData.user && parsedData.user.id) {
            setStoredUserId(parsedData.user.id);
            console.log('useMonthlyDiaries - user 객체 내부에서 ID 추출:', parsedData.user.id);
          } else if (parsedData.id) {
            setStoredUserId(parsedData.id);
            console.log('useMonthlyDiaries - 최상위에서 ID 추출:', parsedData.id);
          }
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }, [currentUserId]);
  
  // userId가 없으면 localStorage에서 가져온 값 사용
  if (!currentUserId) {
    currentUserId = storedUserId || undefined;
  }
  
  return useQuery({
    queryKey: ['diaries', 'monthly', currentUserId, year, month],
    queryFn: async () => {
      if (!currentUserId) {
        throw new Error('사용자 ID가 필요합니다.');
      }
      
      if (!year || !month) {
        const now = new Date();
        year = year || now.getFullYear();
        month = month || now.getMonth() + 1;
      }
      
      console.log('다이어리 조회 요청:', { userId: currentUserId, year, month });
      return getDiariesByMonth(currentUserId, year, month);
    },
    enabled: !!currentUserId && !!year && !!month,
  });
};

// 주간 다이어리 조회 훅
export const useWeeklyDiaries = (userId: number | undefined, startDate: Date) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  const startYearMonth = format(startDate, 'yyyyMM');
  const endYearMonth = format(endDate, 'yyyyMM');
  
  // 같은 월이면 하나의 쿼리만 사용
  if (startYearMonth === endYearMonth) {
    return useMonthlyDiaries(userId, startDate.getFullYear(), startDate.getMonth() + 1);
  }
  
  // 다른 월에 걸쳐 있으면 두 개의 쿼리 결과를 합침
  const startMonthQuery = useMonthlyDiaries(userId, startDate.getFullYear(), startDate.getMonth() + 1);
  const endMonthQuery = useMonthlyDiaries(userId, endDate.getFullYear(), endDate.getMonth() + 1);
  
  const isLoading = startMonthQuery.isLoading || endMonthQuery.isLoading;
  const error = startMonthQuery.error || endMonthQuery.error;
  const data = [...(startMonthQuery.data || []), ...(endMonthQuery.data || [])];
  
  return { data, isLoading, error };
};

// 다이어리 생성 훅
export const useCreateDiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, diary }: { userId: number, diary: DiarySaveDto }) => {
      // localStorage에서 사용자 ID 확인
      let currentUserId = userId;
      if (!currentUserId) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedData = JSON.parse(storedUser);
            console.log('useCreateDiary - localStorage 데이터:', parsedData);
            
            // 사용자 정보가 user 객체 안에 있는 경우
            if (parsedData.user && parsedData.user.id) {
              currentUserId = parsedData.user.id;
              console.log('useCreateDiary - user 객체 내부에서 ID 추출:', currentUserId);
            } else if (parsedData.id) {
              currentUserId = parsedData.id;
              console.log('useCreateDiary - 최상위에서 ID 추출:', currentUserId);
            } else {
              console.error('useCreateDiary - 사용자 정보 구조가 올바르지 않습니다:', parsedData);
            }
          }
        } catch (error) {
          console.error('사용자 정보 파싱 오류:', error);
        }
      }
      
      if (!currentUserId) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }
      
      console.log('다이어리 생성 요청:', { userId: currentUserId, diary });
      return createDiary(currentUserId, diary);
    },
    onSuccess: (data, variables) => {
      // 성공 시 캐시 업데이트
      const yearMonth = variables.diary.date.substring(0, 7).replace('-', '');
      queryClient.invalidateQueries({ queryKey: ['diaries', variables.userId, yearMonth] });
    },
  });
};

// 다이어리 수정 훅
export const useUpdateDiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ diaryId, diary }: { diaryId: number, diary: DiarySaveDto }) => {
      return updateDiary(diaryId, diary);
    },
    onSuccess: (data) => {
      // 성공 시 캐시 업데이트
      const yearMonth = data.date.substring(0, 7).replace('-', '');
      queryClient.invalidateQueries({ queryKey: ['diaries', data.userId, yearMonth] });
    },
  });
};

// 다이어리 삭제 훅
export const useDeleteDiary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (diaryId: number) => {
      return deleteDiary(diaryId);
    },
    onSuccess: (_, diaryId) => {
      // 성공 시 캐시 업데이트 (여기서는 모든 다이어리 쿼리를 무효화)
      queryClient.invalidateQueries({ queryKey: ['diaries'] });
    },
  });
};
