'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Assistant component to avoid SSR issues with WebGPU
const AI_child = dynamic(() => import('./AI_child'), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading AI Assistant...</div>
});

// List of jokes to show during model loading
const LOADING_JOKES = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my computer I needed a break, and now it won't stop sending me vacation ads.",
  "Why did the AI assistant go to therapy? It had too many processing issues!",
  "What do you call a computer that sings? A Dell!",
  "Why was the math book sad? Because it had too many problems!",
  "I asked my AI to help me write a joke, but it said it was too artificial for that.",
  "Why did the programmer quit their job? Because they didn't get arrays!",
  "What do you call a fake noodle? An impasta!",
  "Why did the AI cross the road? To get to the other side of the algorithm!",
  "I tried to make a joke about AI, but it was too machine-ical!"
];

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

  // Select a random joke when mode is selected
  useEffect(() => {
    if (selectedMode && !showIntro) {
      const randomJoke = LOADING_JOKES[Math.floor(Math.random() * LOADING_JOKES.length)];
      setCurrentJoke(randomJoke);
    }
  }, [selectedMode, showIntro]);

  if (!isMounted) return null;

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowIntro(false);
    // Select a random joke when mode is selected
    const randomJoke = LOADING_JOKES[Math.floor(Math.random() * LOADING_JOKES.length)];
    setCurrentJoke(randomJoke);
  };

  const handleBack = () => {
    setShowIntro(true);
    setSelectedMode(null);
  };

  return (
    <>
      {/* Floating button to toggle assistant */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
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
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Privacy First:</strong> The AI model will be installed locally in your browser. 
                    This may take a few moments and requires some storage space, but ensures your data stays private.
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleModeSelect("service-finder")}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Smart Service Finder
                  </button>
                  <button
                    onClick={() => handleModeSelect("listing")}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Create Offer
                  </button>
                  <button
                    onClick={() => handleModeSelect("summarize")}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                  >
                    Summarize Offer
                  </button>
                  <button
                    onClick={() => handleModeSelect("compare")}
                    className="w-full bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
                  >
                    Compare Offers
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <AI_child
              initialMode={selectedMode}
              initialJoke={currentJoke}
              onBack={handleBack}
            />
          )}
        </div>
      )}
    </>
  );
};

export default AI_parent; 