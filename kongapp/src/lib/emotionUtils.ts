/**
 * 감정에 따른 이모지를 반환하는 함수
 * @param emotion 감정 문자열
 * @returns 해당 감정을 나타내는 이모지
 */
export const getEmotionEmoji = (emotion: string): string => {
  const emotionMap: Record<string, string> = {
    happy: '😸',
    sad: '😿',
    angry: '😾',
    neutral: '😽',
    excited: '😻',
    calm: '😌',
    anxious: '🙀',
    tired: '💤',
    bored: '🥱',
    confused: '🤨',
    hopeful: '🌟',
    lonely: '💔',
    surprised: '😮',
    peaceful: '🌿'
  };

  // 감정 문자열을 소문자로 변환
  const lowerEmotion = emotion.toLowerCase();
  
  // 해당 감정에 대한 이모지 반환
  return emotionMap[lowerEmotion] || '🐱';
};

/**
 * 감정에 따른 색상 코드를 반환하는 함수
 * @param emotion 감정 문자열
 * @returns 해당 감정을 나타내는 색상 코드
 */
export const getEmotionColor = (emotion: string): string => {
  const colorMap: Record<string, string> = {
    happy: '#FFD166',      // 행복 - 밝은 노랑
    sad: '#8EBBFF',        // 슬픔 - 하늘색
    angry: '#FF7B7B',      // 화남 - 선명한 빨강
    anxious: '#C8A4FF',    // 불안 - 보라
    tired: '#C4C4C4',      // 피곤 - 회색
    peaceful: '#8EDFD0',   // 평화 - 청록색
    excited: '#FF9F66',    // 신남 - 생생한 주황
    neutral: '#C2E4B8'     // 중립 - 연한 녹색
  };

  return colorMap[emotion.toLowerCase()] || '#C2E4B8';
};

/**
 * 감정에 따른 설명 텍스트를 반환하는 함수
 * @param emotion 감정 문자열
 * @returns 해당 감정에 대한 설명 텍스트
 */
export const getEmotionDescription = (emotion: string): string => {
  const descriptionMap: Record<string, string> = {
    happy: '오늘은 행복한 하루였네요! 좋은 일이 있었나봐요.',
    sad: '오늘은 조금 슬픈 하루였군요. 내일은 더 좋은 일이 있을 거예요.',
    angry: '화가 나는 일이 있었나봐요. 깊게 숨을 쉬고 마음을 진정시켜보세요.',
    anxious: '불안한 마음이 느껴져요. 걱정이 있다면 누군가와 나눠보는 건 어떨까요?',
    tired: '오늘 많이 지치셨나봐요. 충분한 휴식을 취하세요.',
    peaceful: '평온하고 차분한 하루를 보내셨네요. 이 기분을 유지해보세요.',
    excited: '무언가에 설레고 기대되는 일이 있나봐요!',
    neutral: '담담한 하루를 보내셨네요. 때로는 평범한 날도 소중해요.'
  };

  return descriptionMap[emotion.toLowerCase()] || '오늘 하루는 어땠나요?';
};

/**
 * 감정에 따른 그라데이션 배경을 반환하는 함수
 * @param emotion 감정 문자열
 * @returns 해당 감정을 나타내는 그라데이션 CSS
 */
export const getEmotionGradient = (emotion: string): string => {
  const gradientMap: Record<string, string> = {
    happy: 'linear-gradient(135deg, #FFD166, #FFBE99)',
    sad: 'linear-gradient(135deg, #8EBBFF, #C8A4FF)',
    angry: 'linear-gradient(135deg, #FF7B7B, #FF9F66)',
    anxious: 'linear-gradient(135deg, #C8A4FF, #D7C0FF)',
    tired: 'linear-gradient(135deg, #C4C4C4, #E0E0E0)',
    peaceful: 'linear-gradient(135deg, #8EDFD0, #C2E4B8)',
    excited: 'linear-gradient(135deg, #FF9F66, #FFD166)',
    neutral: 'linear-gradient(135deg, #C2E4B8, #D8E4C2)'
  };

  return gradientMap[emotion.toLowerCase()] || 'linear-gradient(135deg, #C2E4B8, #D8E4C2)';
};
