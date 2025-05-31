"use client";

import type { NextPage } from "next";
import { MarketplaceDashboard } from "~~/components/k-marketplace";

const MarketplacePage: NextPage = () => {
  return (
    <>
      <div className="min-h-screen bg-base-200">
        <MarketplaceDashboard />
      </div>
    </>
  );
};

export default MarketplacePage;
