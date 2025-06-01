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
  const [currentJoke, setCurrentJoke] = useState("");

  // Handle mounting state to avoid hydration issues
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
                <div>
                  <h3 className="font-medium mb-2">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Service Finder (Smart Matching)</li>
                    <li>Offer Summarizer</li>
                    <li>Offer Comparison</li>
                    <li>Offer Creation</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handleModeSelect("service-finder")}
                    className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Smart Service Finder
                  </button>
                  <button
                    onClick={() => handleModeSelect("listing")}
                    className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Create Offer
                  </button>
                  <button
                    onClick={() => handleModeSelect("summarize")}
                    className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Summarize Offer
                  </button>
                  <button
                    onClick={() => handleModeSelect("compare")}
                    className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Compare Offers
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