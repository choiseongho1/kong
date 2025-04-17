import apiClient from './api';

export interface DiarySaveDto {
  title: string;
  content: string;
  date?: string; // yyyy-MM-dd 형식
  mood?: string;
  weather?: string;
  sentiment?: string;
  emotion?: string;
  emoji?: string;
  sentimentText?: string;
}

export interface DiaryDetailDto {
  id: number;
  userId: number;
  title: string;
  content: string;
  date: string;
  mood?: string;
  weather?: string;
  sentiment?: string;
  emotion?: string;
  emoji?: string;
  sentimentText?: string;
  createdAt: string;
  updatedAt: string;
}

// 다이어리 생성
export const createDiary = async (userId: number, diary: DiarySaveDto): Promise<DiaryDetailDto> => {
  if (!userId || isNaN(Number(userId))) {
    // localStorage에서 사용자 정보 가져오기
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedData = JSON.parse(storedUser);
        console.log('diaryApi.createDiary - localStorage 데이터:', parsedData);
        
        // 사용자 정보가 user 객체 안에 있는 경우
        if (parsedData.user && parsedData.user.id) {
          userId = Number(parsedData.user.id);
          console.log('diaryApi.createDiary - user 객체 내부에서 ID 추출:', userId);
        } else if (parsedData.id) {
          userId = Number(parsedData.id);
          console.log('diaryApi.createDiary - 최상위에서 ID 추출:', userId);
        } else {
          throw new Error('사용자 ID가 유효하지 않습니다.');
        }
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }
    } else {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }
  }
  
  // userId가 유효한 숫자인지 확인
  if (isNaN(Number(userId))) {
    throw new Error('유효하지 않은 사용자 ID입니다.');
  }
  
  // userId를 숫자로 변환
  const numericUserId = Number(userId);
  
  console.log('다이어리 생성 요청:', { userId: numericUserId, diary });
  
  // 토큰 확인 및 헤더 설정
  const token = localStorage.getItem('token');
  console.log('다이어리 생성 시 사용할 토큰:', token);
  
  if (!token) {
    console.error('토큰이 없습니다. 로그인 상태를 확인하세요.');
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  try {
    console.log('다이어리 생성 API 요청 직전 헤더:', headers);
    const response = await apiClient.post(`/api/v1/diaries/create?userId=${numericUserId}`, diary, { 
      headers,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('다이어리 생성 오류:', error);
    throw error;
  }
};

// 월별 다이어리 조회
export const getDiariesByMonth = async (userId: number, year: number, month: number): Promise<DiaryDetailDto[]> => {
  if (!userId || isNaN(Number(userId))) {
    throw new Error('사용자 ID가 필요합니다.');
  }
  
  // userId를 숫자로 변환
  const numericUserId = Number(userId);
  
  // yearMonth 형식 생성 (YYYYMM)
  const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
  console.log(`월별 다이어리 조회 - 사용자 ID: ${numericUserId}, yearMonth: ${yearMonth}`);
  
  // 토큰 확인 및 헤더 설정
  const token = localStorage.getItem('token');
  console.log('다이어리 조회 시 사용할 토큰:', token);
  
  if (!token) {
    console.error('토큰이 없습니다. 로그인 상태를 확인하세요.');
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  try {
    console.log('다이어리 조회 API 요청 직전 헤더:', headers);
    const response = await apiClient.get(`/api/v1/diaries/user/${numericUserId}?yearMonth=${yearMonth}`, { 
      headers,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('다이어리 조회 오류:', error);
    throw error;
  }
};

// 다이어리 수정
export const updateDiary = async (diaryId: number, diary: DiarySaveDto): Promise<DiaryDetailDto> => {
  console.log('다이어리 수정 요청:', { diaryId, diary });
  
  // CORS 문제 해결을 위한 명시적 헤더 설정
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'Access-Control-Allow-Origin': 'http://localhost:9002'
  };
  
  try {
    const response = await apiClient.put(`/api/v1/diaries/update/${diaryId}`, diary, { headers });
    return response.data;
  } catch (error) {
    console.error('다이어리 수정 오류:', error);
    throw error;
  }
};

// 다이어리 삭제
export const deleteDiary = async (diaryId: number): Promise<void> => {
  console.log('다이어리 삭제 요청:', { diaryId });
  
  // CORS 문제 해결을 위한 명시적 헤더 설정
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'Access-Control-Allow-Origin': 'http://localhost:9002'
  };
  
  try {
    await apiClient.delete(`/api/v1/diaries/delete/${diaryId}`, { headers });
  } catch (error) {
    console.error('다이어리 삭제 오류:', error);
    throw error;
  }
};
