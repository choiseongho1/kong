'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Header from '@/components/common/Header';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <Header />

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto glass-card cat-paw-bg overflow-hidden border-0 shadow-lg">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="mb-6 relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl">🐱</span>
              </div>
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-full h-full text-gray-900">
                  <path fill="currentColor" d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3v-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-handwriting mb-4 relative inline-block">
              <span className="relative z-10">감정분석 페이지 준비 중</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-yellow-200 opacity-50 z-0"></span>
            </h1>
            
            <p className="text-lg font-poorstory mb-6 max-w-lg">
              고양이가 열심히 감정분석 페이지를 개발하고 있어요! 
              더 멋진 기능으로 곧 찾아올 예정이니 조금만 기다려주세요.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mb-8 w-full max-w-md">
              <h2 className="text-xl font-handwriting mb-3 text-primary">개발 예정 기능</h2>
              <ul className="text-left font-poorstory space-y-2">
                <li className="flex items-start">
                  <span className="text-lg mr-2">✨</span>
                  <span>월별/주별 감정 통계 그래프</span>
                </li>
                <li className="flex items-start">
                  <span className="text-lg mr-2">✨</span>
                  <span>감정 변화 추적 및 인사이트 제공</span>
                </li>
                <li className="flex items-start">
                  <span className="text-lg mr-2">✨</span>
                  <span>AI 기반 맞춤형 감정 분석 리포트</span>
                </li>
                <li className="flex items-start">
                  <span className="text-lg mr-2">✨</span>
                  <span>감정에 따른 음악/활동 추천</span>
                </li>
              </ul>
            </div>

            <Link href="/">
              <Button className="flex items-center space-x-2">
                <Home size={18} />
                <span>홈으로 돌아가기</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
