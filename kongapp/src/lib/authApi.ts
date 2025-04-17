import apiClient from './api';

// 로그인 요청 DTO
export interface UserLoginDto {
  email: string;
  password: string;
}

// 회원가입 요청 DTO
export interface UserSaveDto {
  email: string;
  password: string;
  nickname: string;
}

// 로그인 응답 DTO
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

// 토큰 응답
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// API 응답 형식
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  _links?: any;
}

// 회원가입 API
export const signup = async (userSaveDto: UserSaveDto): Promise<ApiResponse<any>> => {
  try {
    // CORS 문제 해결을 위한 명시적 헤더 설정
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:9002'
    };
    
    const response = await apiClient.post('/api/v1/user/signup', userSaveDto, { headers });
    console.log('회원가입 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('회원가입 API 오류:', error);
    throw error;
  }
};

// 로그인 API
export const login = async (userLoginDto: UserLoginDto): Promise<ApiResponse<LoginResponseDto>> => {
  try {
    // CORS 문제 해결을 위한 명시적 헤더 설정
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:9002'
    };
    
    const response = await apiClient.post('/api/v1/auth/login', userLoginDto, { headers });
    console.log('로그인 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('로그인 API 오류:', error);
    throw error;
  }
};

// 토큰 갱신 API
export const refreshToken = async (refreshToken: string): Promise<ApiResponse<TokenResponse>> => {
  try {
    // CORS 문제 해결을 위한 명시적 헤더 설정
    const headers = {
      'Content-Type': 'text/plain',  // 문자열 그대로 전송하기 위해 text/plain으로 변경
      'Access-Control-Allow-Origin': 'http://localhost:9002'
    };
    
    const response = await apiClient.post('/api/v1/auth/refresh', refreshToken, { 
      headers,
      transformRequest: [(data) => data]  // 기본 변환 방지 (JSON.stringify 방지)
    });
    console.log('토큰 갱신 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('토큰 갱신 API 오류:', error);
    throw error;
  }
};

// 로그아웃 API
export const logout = async (email: string): Promise<ApiResponse<any>> => {
  try {
    // CORS 문제 해결을 위한 명시적 헤더 설정
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Access-Control-Allow-Origin': 'http://localhost:9002'
    };
    
    const response = await apiClient.post('/api/v1/auth/logout', { email }, { headers });
    console.log('로그아웃 API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('로그아웃 API 오류:', error);
    throw error;
  }
};
