"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const AIAssistant = dynamic(() => import("./AI_parent"), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading AI Assistant...</div>,
});

export default function AIAssistantClientWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading AI Assistant...</div>}>
      <AIAssistant />
    </Suspense>
  );
}
