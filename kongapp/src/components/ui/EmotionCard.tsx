'use client';

import React from 'react';
import { theme } from '@/styles/theme';

interface EmotionCardProps {
  emotion: string;
  emoji: string;
  text: string;
  date: string;
  content: string;
  onClick?: () => void;
}

export function EmotionCard({ emotion = 'neutral', emoji = '📝', text, date, content, onClick }: EmotionCardProps) {
  // 감정에 따른 배경색 설정
  const getEmotionColor = (emotion: string) => {
    if (!emotion) return theme.colors.emotions.neutral;
    const emotionKey = emotion.toLowerCase() as keyof typeof theme.colors.emotions;
    return theme.colors.emotions[emotionKey] || theme.colors.emotions.neutral;
  };

  const backgroundColor = getEmotionColor(emotion);
  
  return (
    <div 
      className="glass-card mb-5 transition-all duration-300 cursor-pointer emotion-card-enter"
      onClick={onClick}
    >
      <div 
        className="p-6 rounded-xl relative overflow-hidden"
        style={{ 
          borderLeft: `4px solid ${backgroundColor}`,
        }}
      >
        {/* 배경 장식 효과 */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor }}
        ></div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="text-base font-medium text-gray-800">{date}</div>
          <div className="flex items-center emotion-tag" style={{ backgroundColor: `${backgroundColor}20` }}>
            <span className="text-2xl mr-2 emotion-icon">{emoji}</span>
            <span className="text-base font-medium" style={{ color: backgroundColor }}>{emotion}</span>
          </div>
        </div>
        
        <div className="text-xl font-medium mb-3 leading-relaxed relative z-10 text-gray-900">{content}</div>
        
        <div className="text-base font-medium text-gray-800 italic mt-2 relative z-10">
          {text}
        </div>
      </div>
    </div>
  );
}
