"use client";

import dynamic from "next/dynamic";

const AIAssistant = dynamic(() => import("./AI_parent"), { ssr: false });

export default function AIAssistantClientWrapper() {
  return <AIAssistant />;
}
