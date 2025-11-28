import React from 'react';
import { Clapperboard } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center animate-fade-out-delay">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 rounded-full animate-pulse"></div>
        <div className="bg-gradient-to-br from-neutral-900 to-black p-6 rounded-2xl border border-neutral-800 shadow-2xl relative z-10 animate-bounce-slow">
          <Clapperboard size={64} className="text-red-600" />
        </div>
      </div>
      <h1 className="text-3xl font-bold tracking-tighter text-white animate-slide-up">
        CINEMA<span className="text-red-600">TIX</span>
      </h1>
      <p className="text-neutral-500 text-sm mt-2 tracking-widest uppercase animate-slide-up delay-100">Your Movie Companion</p>
      
      <div className="mt-8 w-32 h-1 bg-neutral-900 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 animate-loading-bar"></div>
      </div>
    </div>
  );
}