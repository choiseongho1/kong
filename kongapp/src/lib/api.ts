import axios from 'axios';

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 서버 URL을 여기에 입력하세요
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CORS 요청 시 쿠키 포함
});

// 디버깅을 위한 인터셉터 추가
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('token');
    
    if (token) {
      // Authorization 헤더에 Bearer 토큰 추가
      if (!config.headers) config.headers = {};
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('토큰 추가됨:', token);
      console.log('헤더 설정됨:', config.headers);
    } else {
      console.warn('토큰이 없습니다. 로컬 스토리지 확인:', localStorage);
    }
    
    console.log('API 요청 전송:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
apiClient.interceptors.response.use(
  (response) => {
    console.log('API 응답:', response.status, response.data);
    return response;
  },
  async (error) => {
    console.log('리프레시 토큰으로 재발급 요청 시작');
    console.error('API 응답 오류:', error.response?.status, error.response?.data || error.message);
    
    // 401 Unauthorized 에러 처리 (토큰 만료)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        // 로컬 스토리지에서 리프레시 토큰 가져오기
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          console.log('액세스 토큰 만료됨, 리프레시 토큰으로 재발급 시도');
          
          // 원래 요청 설정 저장
          const originalRequest = error.config;
          
          // 토큰 재발급 요청
          const response = await axios.post(
            'http://localhost:8080/api/v1/auth/refresh',
            refreshToken,
            { 
              headers: { 
                'Content-Type': 'text/plain'  // 문자열 그대로 전송하기 위해 text/plain으로 변경
              },
              transformRequest: [(data) => data],  // 기본 변환 방지 (JSON.stringify 방지)
              withCredentials: true
            }
          );
          
          if (response.data && response.data.data) {
            const newTokens = response.data.data;
            console.log('새 토큰 발급 성공:', newTokens);
            
            // 새 토큰 저장
            localStorage.setItem('token', newTokens.accessToken);
            if (newTokens.refreshToken) {
              localStorage.setItem('refreshToken', newTokens.refreshToken);
            }
            
            // 원래 요청의 헤더에 새 토큰 설정
            originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
            
            // 원래 요청 재시도
            return apiClient(originalRequest);
          }
        }
        
        // 리프레시 토큰이 없거나 토큰 갱신에 실패한 경우
        console.warn('토큰 갱신 실패 또는 리프레시 토큰 없음, 로그아웃 처리');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // 로그인 페이지로 리다이렉트
        window.location.href = '/auth';
      } catch (refreshError) {
        console.error('토큰 갱신 중 오류 발생:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // 로그인 페이지로 리다이렉트
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
