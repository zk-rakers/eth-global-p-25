"use client";

import dynamic from "next/dynamic";

const AIAssistant = dynamic(() => import("./AIAssistant"), { ssr: false });

export default function AIAssistantClientWrapper() {
  return <AIAssistant />;
}
