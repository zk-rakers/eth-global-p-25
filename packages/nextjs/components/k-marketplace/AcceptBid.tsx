"use client";

import { useEffect, useState } from "react";
import { encodeFunctionData } from "viem";
import { use4337UserOp } from "~~/hooks/k-marketplace";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface BidDetails {
  bidderCommitment: string;
  encryptedBidMetadataCID: string;
  timestamp: bigint;
  isAccepted: boolean;
  encryptedKey: string;
}

/**
 * Component for accepting bids using ERC-4337 meta-transactions
 * Allows request creators to accept bids in a gasless manner
 */
export const AcceptBid = () => {
  const [requestId, setRequestId] = useState("");
  const [bidIndex, setBidIndex] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [usePaymaster, setUsePaymaster] = useState(true);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [bidDetails, setBidDetails] = useState<BidDetails | null>(null);
  const [encryptedChannelKey, setEncryptedChannelKey] = useState("");

  // Initialize 4337 hook
  const {
    isLoading: is4337Loading,
    isInitialized,
    initializeClients,
    sendUserOperation,
    estimateUserOpGas,
  } = use4337UserOp();

  // Read request details
  const { data: requestData } = useScaffoldReadContract({
    contractName: "PrivacyMarketplace",
    functionName: "getRequest",
    args: requestId ? [BigInt(requestId)] : [BigInt(0)],
  });

  // Read bid details
  const { data: bidData } = useScaffoldReadContract({
    contractName: "PrivacyMarketplace",
    functionName: "getBid",
    args: requestId && bidIndex ? [BigInt(requestId), BigInt(bidIndex)] : [BigInt(0), BigInt(0)],
  });

  // Initialize 4337 clients on mount
  useEffect(() => {
    initializeClients();
  }, [initializeClients]);

  // Update request details when data changes
  useEffect(() => {
    setRequestDetails(requestData);
  }, [requestData]);

  // Update bid details when data changes
  useEffect(() => {
    if (bidData) {
      setBidDetails({
        bidderCommitment: bidData[0],
        encryptedBidMetadataCID: bidData[1],
        timestamp: bidData[2],
        isAccepted: bidData[3],
        encryptedKey: bidData[4],
      });
    }
  }, [bidData]);

  const handleAcceptBid = async () => {
    // Validation
    if (!requestId || !bidIndex) {
      notification.error("Please fill in request ID and bid index");
      return;
    }

    if (!isInitialized) {
      notification.error("Smart account not initialized. Please check your wallet connection.");
      return;
    }

    if (!requestDetails) {
      notification.error("Invalid request ID or request not found");
      return;
    }

    if (!bidDetails) {
      notification.error("Invalid bid index or bid not found");
      return;
    }

    if (bidDetails.isAccepted) {
      notification.error("This bid has already been accepted");
      return;
    }

    if (!requestDetails[3]) {
      // isActive
      notification.error("This request is no longer active");
      return;
    }

    setIsAccepting(true);
    let notificationId: string | null = null;

    try {
      notificationId = notification.loading("Preparing bid acceptance...");

      // Encode the acceptBid function call
      const acceptBidData = encodeFunctionData({
        abi: [
          {
            type: "function",
            name: "acceptBid",
            inputs: [
              { name: "requestId", type: "uint256", internalType: "uint256" },
              { name: "bidIndex", type: "uint256", internalType: "uint256" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "acceptBid",
        args: [BigInt(requestId), BigInt(bidIndex)],
      });

      notification.remove(notificationId);
      notificationId = notification.loading("Estimating transaction costs...");

      // Get contract address
      const contractAddress = "0xa15bb66138824a1c7167f5e85b957d04dd34e468"; // PrivacyMarketplace address

      // Estimate gas before sending
      const gasEstimate = await estimateUserOpGas({
        to: contractAddress,
        data: acceptBidData,
        value: BigInt(0),
        usePaymaster,
      });

      if (gasEstimate) {
        console.log("Gas estimate for bid acceptance:", gasEstimate);
      }

      notification.remove(notificationId);
      notificationId = notification.loading("Accepting bid via meta-transaction...");

      // Accept the bid using 4337 meta-transaction
      const result = await sendUserOperation({
        to: contractAddress,
        data: acceptBidData,
        value: BigInt(0),
        usePaymaster,
      });

      notification.remove(notificationId);

      if (result && result.success) {
        notification.success(
          `Bid accepted successfully! 🎉\nUser Operation Hash: ${result.userOpHash.slice(0, 10)}...`,
          {
            icon: "✅",
            duration: 8000,
          },
        );

        // Refresh bid details
        // Note: In a real app, you might want to refetch the data or use events
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      if (notificationId) {
        notification.remove(notificationId);
      }
      console.error("Failed to accept bid:", error);
      notification.error(`Failed to accept bid: ${error.message || "Unknown error"}`);
    } finally {
      setIsAccepting(false);
    }
  };

  const handlePublishChannelKey = async () => {
    if (!encryptedChannelKey.trim()) {
      notification.error("Please enter an encrypted channel key");
      return;
    }

    if (!bidDetails?.isAccepted) {
      notification.error("Bid must be accepted before publishing channel key");
      return;
    }

    setIsAccepting(true);
    let notificationId: string | null = null;

    try {
      notificationId = notification.loading("Publishing encrypted channel key...");

      // Encode the publishEncryptedKey function call
      const publishKeyData = encodeFunctionData({
        abi: [
          {
            type: "function",
            name: "publishEncryptedKey",
            inputs: [
              { name: "requestId", type: "uint256", internalType: "uint256" },
              { name: "bidIndex", type: "uint256", internalType: "uint256" },
              { name: "encryptedKey", type: "string", internalType: "string" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "publishEncryptedKey",
        args: [BigInt(requestId), BigInt(bidIndex), encryptedChannelKey],
      });

      const contractAddress = "0xa15bb66138824a1c7167f5e85b957d04dd34e468";

      // Publish the key using 4337 meta-transaction
      const result = await sendUserOperation({
        to: contractAddress,
        data: publishKeyData,
        value: BigInt(0),
        usePaymaster,
      });

      notification.remove(notificationId);

      if (result && result.success) {
        notification.success(
          `Channel key published successfully! 🔑\nUser Operation Hash: ${result.userOpHash.slice(0, 10)}...`,
          {
            icon: "✅",
            duration: 8000,
          },
        );
        setEncryptedChannelKey("");
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      if (notificationId) {
        notification.remove(notificationId);
      }
      console.error("Failed to publish channel key:", error);
      notification.error(`Failed to publish channel key: ${error.message || "Unknown error"}`);
    } finally {
      setIsAccepting(false);
    }
  };

  const isLoading = isAccepting || is4337Loading;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto bg-base-100 rounded-box shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Accept Bid</h2>
        <p className="text-base-content/70 mt-2">Accept bids and establish secure communication channels</p>
      </div>

      {/* Connection Status */}
      <div className="alert alert-info">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isInitialized ? "bg-green-500" : "bg-red-500"}`}></div>
          <span>{isInitialized ? "✅ Smart Account Ready" : "❌ Initializing Smart Account..."}</span>
        </div>
      </div>

      {/* Request ID Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Request ID *</span>
          <span className="label-text-alt">The ID of your request</span>
        </label>
        <input
          type="number"
          placeholder="Enter request ID"
          className="input input-bordered"
          value={requestId}
          onChange={e => setRequestId(e.target.value)}
        />
      </div>

      {/* Request Details Display */}
      {requestDetails && (
        <div className="alert alert-success">
          <div className="flex flex-col gap-1">
            <div className="font-semibold">✅ Request Found</div>
            <div className="text-sm">
              <p>
                <strong>Status:</strong> {requestDetails[3] ? "Active" : "Closed"}
              </p>
              <p>
                <strong>Total Bids:</strong> {requestDetails[4]?.toString() || "0"}
              </p>
              <p>
                <strong>Posted:</strong> {new Date(Number(requestDetails[2]) * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bid Index Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Bid Index *</span>
          <span className="label-text-alt">
            The index of the bid to accept (0, 1, 2, etc.)
            {requestDetails && ` - Total bids: ${requestDetails[4]?.toString() || "0"}`}
          </span>
        </label>
        <input
          type="number"
          placeholder="Enter bid index"
          className="input input-bordered"
          value={bidIndex}
          onChange={e => setBidIndex(e.target.value)}
          max={requestDetails ? Number(requestDetails[4]) - 1 : undefined}
          min="0"
        />
      </div>

      {/* Bid Details Display */}
      {bidDetails && (
        <div className={`alert ${bidDetails.isAccepted ? "alert-warning" : "alert-info"}`}>
          <div className="flex flex-col gap-1">
            <div className="font-semibold">{bidDetails.isAccepted ? "⚠️ Bid Already Accepted" : "📋 Bid Details"}</div>
            <div className="text-sm">
              <p>
                <strong>Status:</strong> {bidDetails.isAccepted ? "Accepted" : "Pending"}
              </p>
              <p>
                <strong>Submitted:</strong> {new Date(Number(bidDetails.timestamp) * 1000).toLocaleDateString()}
              </p>
              <p>
                <strong>Metadata CID:</strong> {bidDetails.encryptedBidMetadataCID}
              </p>
              <p>
                <strong>Commitment:</strong> {bidDetails.bidderCommitment.slice(0, 10)}...
              </p>
              {bidDetails.encryptedKey && (
                <p>
                  <strong>Channel Key:</strong> {bidDetails.encryptedKey.slice(0, 20)}...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gasless Transaction Option */}
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text font-semibold">Use Gasless Transaction</span>
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={usePaymaster}
            onChange={e => setUsePaymaster(e.target.checked)}
          />
        </label>
        <div className="label">
          <span className="label-text-alt">
            {usePaymaster ? "✅ Transaction fees will be sponsored (recommended)" : "⚠️ You will pay gas fees directly"}
          </span>
        </div>
      </div>

      {/* Accept Bid Button */}
      <button
        className="btn btn-primary btn-lg"
        onClick={handleAcceptBid}
        disabled={
          isLoading ||
          !isInitialized ||
          !requestId ||
          !bidIndex ||
          !requestDetails ||
          !bidDetails ||
          bidDetails.isAccepted ||
          !requestDetails[3]
        }
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Processing...
          </>
        ) : (
          <>✅ Accept Bid</>
        )}
      </button>

      {/* Channel Key Section */}
      {bidDetails?.isAccepted && (
        <>
          <div className="divider">Secure Communication</div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Encrypted Channel Key</span>
              <span className="label-text-alt">Encrypted key for secure communication with bidder</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-20"
              placeholder="Enter encrypted channel key for secure communication..."
              value={encryptedChannelKey}
              onChange={e => setEncryptedChannelKey(e.target.value)}
            />
          </div>

          <button
            className="btn btn-secondary"
            onClick={handlePublishChannelKey}
            disabled={isLoading || !encryptedChannelKey.trim()}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Publishing...
              </>
            ) : (
              <>🔑 Publish Channel Key</>
            )}
          </button>
        </>
      )}

      {/* Information Section */}
      <div className="divider">Information</div>
      <div className="text-sm text-base-content/70 bg-base-200 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">🔄 Process Flow:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Enter your request ID and the bid index you want to accept</li>
          <li>Review the bid details to ensure it&apos;s the correct one</li>
          <li>Click &quot;Accept Bid&quot; to execute the acceptance via meta-transaction</li>
          <li>After acceptance, publish an encrypted channel key for secure communication</li>
        </ol>

        <h4 className="font-semibold mt-4 mb-2">🔐 Privacy & Security:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Meta-transactions preserve your privacy during bid acceptance</li>
          <li>Channel keys enable secure, encrypted communication</li>
          <li>All sensitive data remains encrypted and private</li>
        </ul>
      </div>
    </div>
  );
};
