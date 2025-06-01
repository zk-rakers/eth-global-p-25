"use client";

import { useState } from "react";
import { AcceptBid } from "./AcceptBid";
import { CreateBid } from "./CreateBid";
import { PostRequest } from "./PostRequest";
import { UserOpExample } from "./UserOpExample";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type TabType = "post-request" | "create-bid" | "accept-bid" | "user-op-example";

/**
 * Main dashboard component for the Privacy Marketplace
 * Provides navigation between different marketplace functions
 */
export const MarketplaceDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("post-request");

  // Read marketplace stats
  const { data: totalRequests } = useScaffoldReadContract({
    contractName: "PrivacyMarketplace",
    functionName: "getTotalRequests",
  });

  const { data: totalBids } = useScaffoldReadContract({
    contractName: "PrivacyMarketplace",
    functionName: "getTotalBids",
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case "post-request":
        return <PostRequest />;
      case "create-bid":
        return <CreateBid />;
      case "accept-bid":
        return <AcceptBid />;
      case "user-op-example":
        return <UserOpExample />;
      default:
        return <PostRequest />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Marketplace</h1>
        <p className="text-xl text-base-content/70 mb-6">
          A decentralized marketplace for private service requests using ERC-4337 meta-transactions
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="stat bg-base-200 rounded-lg px-4 py-2">
            <div className="stat-title text-sm">Total Requests</div>
            <div className="stat-value text-2xl">{totalRequests?.toString() || "0"}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg px-4 py-2">
            <div className="stat-title text-sm">Total Bids</div>
            <div className="stat-value text-2xl">{totalBids?.toString() || "0"}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed justify-center mb-8">
        <button
          className={`tab tab-lg ${activeTab === "post-request" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("post-request")}
        >
          🚀 Post Request
        </button>
        <button
          className={`tab tab-lg ${activeTab === "create-bid" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("create-bid")}
        >
          🔐 Create Bid
        </button>
        <button
          className={`tab tab-lg ${activeTab === "accept-bid" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("accept-bid")}
        >
          ✅ Accept Bid
        </button>
        <button
          className={`tab tab-lg ${activeTab === "user-op-example" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("user-op-example")}
        >
          ⚡ User Op Demo
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-8">{renderTabContent()}</div>

      {/* Features Overview */}
      <div className="divider">Platform Features</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body text-center">
            <h3 className="card-title justify-center text-lg">🔒 Privacy-First</h3>
            <p className="text-sm">
              All requests and bids are encrypted and stored on IPFS with commitment schemes for maximum privacy.
            </p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body text-center">
            <h3 className="card-title justify-center text-lg">⚡ Gasless</h3>
            <p className="text-sm">
              Use ERC-4337 meta-transactions with paymasters for gasless interactions and better UX.
            </p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body text-center">
            <h3 className="card-title justify-center text-lg">🌐 Decentralized</h3>
            <p className="text-sm">
              Built on Ethereum with decentralized storage on IPFS/Filecoin for censorship resistance.
            </p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body text-center">
            <h3 className="card-title justify-center text-lg">🔐 Secure</h3>
            <p className="text-sm">
              Smart contract wallets with programmable security and encrypted communication channels.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="divider">How It Works</div>
      <div className="steps steps-vertical lg:steps-horizontal mb-8">
        <div className="step step-primary">
          <div className="text-left">
            <h4 className="font-semibold">1. Post Request</h4>
            <p className="text-sm text-base-content/70">
              Create an encrypted service request with your requirements and budget
            </p>
          </div>
        </div>
        <div className="step step-primary">
          <div className="text-left">
            <h4 className="font-semibold">2. Receive Bids</h4>
            <p className="text-sm text-base-content/70">
              Service providers submit private, encrypted bids on your request
            </p>
          </div>
        </div>
        <div className="step step-primary">
          <div className="text-left">
            <h4 className="font-semibold">3. Accept & Collaborate</h4>
            <p className="text-sm text-base-content/70">
              Accept the best bid and establish secure communication channels
            </p>
          </div>
        </div>
        <div className="step step-primary">
          <div className="text-left">
            <h4 className="font-semibold">4. Complete Work</h4>
            <p className="text-sm text-base-content/70">
              Work together privately while maintaining anonymity throughout
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-base-content/60 text-sm">
        <p>Built with Scaffold-ETH 2, ERC-4337 Account Abstraction, and privacy-preserving technologies</p>
      </footer>
    </div>
  );
};
