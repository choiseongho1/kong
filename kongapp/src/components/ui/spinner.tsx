'use client';

import React from 'react';
import { theme } from '@/styles/theme';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ size = 'md', color }: SpinnerProps) {
  const sizeMap = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem',
  };

  const spinnerSize = sizeMap[size];
  const spinnerColor = color || theme.colors.primary;

  return (
    <div
      className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
      style={{
        width: spinnerSize,
        height: spinnerSize,
        borderColor: `${spinnerColor} transparent ${spinnerColor} transparent`,
      }}
      role="status"
    >
      <span className="sr-only">로딩중...</span>
    </div>
  );
}
