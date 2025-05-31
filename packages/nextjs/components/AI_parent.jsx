'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Assistant component to avoid SSR issues with WebGPU
const AI_child = dynamic(() => import('./AI_child'), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading AI Assistant...</div>
});


const AI_parent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowIntro(false);
  };

  if (!isMounted) return null;

  const handleBack = () => {
    setShowIntro(true);
    setSelectedMode(null);
  };

  return (
    <>
      {/* Floating button to toggle assistant */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors z-50"
      >
        AI Assistant
      </button>

      {/* Assistant panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 w-[350px] max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl z-50">
          {showIntro ? (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Welcome to AI Assistant</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <button
                    onClick={() => handleModeSelect("request")}
                    className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Create request
                  </button>
                  <button
                    onClick={() => handleModeSelect("bid")}
                    className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Create bid
                  </button>
                  <button
                    onClick={() => handleModeSelect("intro")}
                    className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    What is A-proof?
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <AI_child
                initialMode={selectedMode}
                onBack={handleBack}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AI_parent; 