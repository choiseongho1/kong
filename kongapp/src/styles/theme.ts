// 앱 전체 테마 설정
export const theme = {
  colors: {
    // 기본 색상
    primary: '#FF9F66',      // 주황 (주요 색상)
    secondary: '#FFD166',    // 노랑 (보조 색상)
    background: '#FFF9F1',   // 크림색 (배경 색상)
    accent: '#FFA8D2',       // 생생한 핑크 (강조 색상)
    text: '#3A3A3A',         // 텍스트 색상
    textLight: '#8A8A8A',    // 밝은 텍스트 색상
    
    // 감정별 색상
    emotions: {
      happy: '#FFD166',      // 행복 - 밝은 노랑
      sad: '#8EBBFF',        // 슬픔 - 하늘색
      angry: '#FF7B7B',      // 화남 - 선명한 빨강
      neutral: '#C2E4B8',    // 중립 - 연한 녹색
      anxious: '#C8A4FF',    // 불안 - 보라
      excited: '#FF9F66',    // 신남 - 생생한 주황
      tired: '#C4C4C4',      // 피곤 - 회색
      peaceful: '#8EDFD0',   // 평화 - 청록색
    }
  },
  
  // 그림자 스타일
  shadows: {
    small: '0 2px 10px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 20px rgba(0, 0, 0, 0.08)',
    large: '0 8px 30px rgba(0, 0, 0, 0.1)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  },
  
  // 둥근 모서리 스타일
  borderRadius: {
    small: '12px',
    medium: '16px',
    large: '24px',
    round: '50%',
  },
  
  // 폰트 스타일
  typography: {
    fontFamily: {
      primary: "'Noto Sans KR', sans-serif",
      handwriting: "'Noto Sans KR', sans-serif",
      modern: "'Noto Sans KR', sans-serif",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      xxl: '1.5rem',    // 24px
      xxxl: '2rem',     // 32px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // 간격 스타일
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },
  
  // 애니메이션 시간
  animation: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
  },
  
  // 그라데이션
  gradients: {
    primary: 'linear-gradient(135deg, #FF9F66, #FFD166)',
    secondary: 'linear-gradient(135deg, #FFA8D2, #FFBE99)',
    cool: 'linear-gradient(135deg, #8EBBFF, #C8A4FF)',
    warm: 'linear-gradient(135deg, #FFD166, #FF9F66)',
    calm: 'linear-gradient(135deg, #8EDFD0, #C2E4B8)',
  }
};

// 다크 모드 테마
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: '#FF9F66',     // 주황 (주요 색상)
    secondary: '#FFD166',   // 노랑 (보조 색상)
    background: '#2A2A2A',  // 어두운 배경
    accent: '#FFA8D2',      // 생생한 핑크 (강조 색상)
    text: '#F0F0F0',        // 밝은 텍스트
    textLight: '#B0B0B0',   // 중간 밝기 텍스트
    
    // 감정별 색상 (다크모드)
    emotions: {
      happy: '#FFD166',      // 행복 - 밝은 노랑
      sad: '#8EBBFF',        // 슬픔 - 하늘색
      angry: '#FF7B7B',      // 화남 - 선명한 빨강
      neutral: '#C2E4B8',    // 중립 - 연한 녹색
      anxious: '#C8A4FF',    // 불안 - 보라
      excited: '#FF9F66',    // 신남 - 생생한 주황
      tired: '#C4C4C4',      // 피곤 - 회색
      peaceful: '#8EDFD0',   // 평화 - 청록색
    }
  },
};
