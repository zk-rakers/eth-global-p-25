'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AIAssistantClientWrapper from "~~/components/AIAssistantClientWrapper";

// Dynamically import the Assistant component to avoid SSR issues with WebGPU
const Assistant = dynamic(() => import('./Assistant'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white border border-gray-300 rounded shadow">
      <div className="text-sm text-gray-500 mb-3">
        <span className="animate-pulse">🤖 Loading AI Assistant...</span>
      </div>
    </div>
  ),
});

const AIAssistant = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting state to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Floating button to toggle assistant */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        {isVisible ? '✕' : '🤖'}
      </button>

      {/* Assistant panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 w-[400px] z-50 transition-all duration-300 ease-in-out">
          <Assistant />
        </div>
      )}
    </>
  );
};

export default AIAssistant; 