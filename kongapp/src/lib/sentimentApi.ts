import { apiClient } from './api';

interface SentimentResult {
  emotion: string;
  score: number;
}

/**
 * 텍스트의 감정을 분석하는 함수
 * @param text 분석할 텍스트
 * @returns 감정 분석 결과
 */
export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  try {
    // 실제 API 호출 대신 간단한 감정 분석 로직 구현
    // 실제 프로덕션에서는 이 부분을 백엔드 API 호출로 대체해야 함
    console.log('감정 분석 요청:', text);
    
    // 입력 텍스트가 없거나 빈 문자열인 경우 기본값 반환
    if (!text || typeof text !== 'string') {
      console.log('텍스트가 없거나 유효하지 않습니다. 기본 감정(neutral)을 반환합니다.');
      return {
        emotion: 'neutral',
        score: 1
      };
    }
    
    // 감정 키워드 사전 (간단한 예시)
    const emotionKeywords = {
      happy: ['좋아', '행복', '기쁘', '신나', '즐거', '웃', '신남', '좋았'],
      sad: ['슬프', '우울', '눈물', '아쉽', '그립', '속상', '서운', '우울'],
      angry: ['화나', '짜증', '열받', '분노', '화가', '빡치', '짜증', '싫'],
      anxious: ['걱정', '불안', '초조', '두렵', '무섭', '떨리', '긴장', '조마조마'],
      tired: ['피곤', '지침', '힘들', '졸림', '지친', '피곤', '쉬고', '피곤'],
      peaceful: ['평화', '고요', '차분', '편안', '안정', '여유', '고요', '평온'],
      excited: ['설레', '기대', '흥분', '두근', '기대', '설렘', '떨림', '흥분'],
      neutral: ['보통', '그냥', '평범', '무난', '괜찮', '그저', '그냥', '보통']
    };
    
    // 감정 점수 계산
    const scores: Record<string, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      tired: 0,
      peaceful: 0,
      excited: 0,
      neutral: 1  // 기본값으로 중립 감정에 약간의 점수 부여
    };
    
    // 각 감정 키워드 검색
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        try {
          const regex = new RegExp(keyword, 'gi');
          const matches = text.match(regex);
          if (matches) {
            scores[emotion] += matches.length;
          }
        } catch (err) {
          console.error(`키워드 '${keyword}' 검색 중 오류 발생:`, err);
        }
      });
    });
    
    // 가장 높은 점수의 감정 찾기
    let maxEmotion = 'neutral';
    let maxScore = scores.neutral;
    
    Object.entries(scores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxEmotion = emotion;
        maxScore = score;
      }
    });
    
    // 감정 분석 결과 반환
    console.log('감정 분석 결과:', { emotion: maxEmotion, score: maxScore });
    
    // 1초 지연 (실제 API 호출 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      emotion: maxEmotion,
      score: maxScore
    };
  } catch (error) {
    console.error('감정 분석 오류:', error);
    throw new Error('감정 분석에 실패했습니다.');
  }
};
