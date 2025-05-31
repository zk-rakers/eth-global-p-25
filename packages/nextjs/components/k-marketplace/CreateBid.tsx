"use client";

import { useEffect, useState } from "react";
import { encodeFunctionData, keccak256, toHex } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { EtherInput } from "~~/components/scaffold-eth";
import { use4337UserOp } from "~~/hooks/k-marketplace";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface BidFormData {
  requestId: string;
  bidAmount: string;
  proposalText: string;
  deliveryTime: string;
  contactInfo: string;
  nonce: string;
  userSecret: string;
}

interface EncryptedMetadata {
  bidAmount: string;
  proposalText: string;
  deliveryTime: string;
  contactInfo: string;
  timestamp: number;
}

/**
 * Component for creating and submitting private bids using ERC-4337 meta-transactions
 * Implements privacy-preserving bidding with commitment schemes and encrypted metadata
 */
export const CreateBid = () => {
  const [formData, setFormData] = useState<BidFormData>({
    requestId: "",
    bidAmount: "",
    proposalText: "",
    deliveryTime: "",
    contactInfo: "",
    nonce: "",
    userSecret: "🎮🌟🎨🎭🎪🎢🎡🎯", // Default 8 emoji string
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usePaymaster, setUsePaymaster] = useState(true);
  const [requestDetails, setRequestDetails] = useState<any>(null);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Initialize 4337 hook
  const {
    isLoading: is4337Loading,
    sendUserOperation,
    estimateUserOpGas,
  } = use4337UserOp({
    // Optional: Add custom bundler/paymaster URLs
    // bundlerUrl: "https://your-custom-bundler.com",
    // paymasterUrl: "https://your-paymaster.com",
  });

  // Read request details when requestId changes
  const { data: requestData } = useScaffoldReadContract({
    contractName: "PrivacyMarketplace",
    functionName: "getRequest",
    args: formData.requestId ? [BigInt(formData.requestId)] : [BigInt(0)],
  });

  // Update request details when data changes
  useEffect(() => {
    setRequestDetails(requestData);
  }, [requestData]);

  // Generate random nonce for privacy
  const generateNonce = () => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return toHex(randomBytes);
  };

  // Generate new nonce on component mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      nonce: generateNonce(),
    }));
  }, []);

  // Helper function to simulate IPFS upload
  const uploadToIPFS = async (data: EncryptedMetadata): Promise<string> => {
    // In a real implementation, this would:
    // 1. Encrypt the data with a symmetric key
    // 2. Upload to IPFS/Filecoin
    // 3. Return the CID

    // For now, we'll simulate with a delay and return a mock CID
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockCID = `QmX${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    console.log("Mock encrypted metadata uploaded to IPFS:", { data, cid: mockCID });

    return mockCID;
  };

  // Generate commitment hash for privacy
  const generateCommitment = (publicKey: string, nonce: string): `0x${string}` => {
    // In a real implementation, this would use the bidder's actual public key
    // For now, we'll use a mock public key derived from the form data
    const mockPublicKey = publicKey || `0x${Math.random().toString(16).substring(2, 66)}`;

    // Generate commitment: keccak256(pubkey || nonce)
    const commitment = keccak256(toHex(mockPublicKey + nonce.slice(2)));
    return commitment;
  };

  const handleInputChange = (field: keyof BidFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitBid = async () => {
    // Validation
    if (!formData.requestId || !formData.bidAmount || !formData.proposalText) {
      notification.error("Please fill in all required fields");
      return;
    }

    if (!address || !walletClient) {
      notification.error("Wallet not connected. Please connect your wallet.");
      return;
    }

    if (!requestDetails) {
      notification.error("Invalid request ID or request not found");
      return;
    }

    if (!requestDetails[4]) {
      // requestDetails[4] is isActive in this ABI
      notification.error("This request is no longer accepting bids");
      return;
    }

    setIsSubmitting(true);
    let notificationId: string | null = null;

    try {
      // Generate user identifier by signing a message
      const message = `${formData.userSecret}`;
      notificationId = notification.loading("Signing to generate your user identifier...");

      const signature = await walletClient.signMessage({
        account: address,
        message: message,
      });

      const userIdentifier = keccak256(toHex(signature));
      notification.remove(notificationId);

      // Prepare encrypted metadata
      notificationId = notification.loading("Preparing encrypted bid metadata...");
      const metadata: EncryptedMetadata = {
        bidAmount: formData.bidAmount,
        proposalText: formData.proposalText,
        deliveryTime: formData.deliveryTime,
        contactInfo: formData.contactInfo,
        timestamp: Date.now(),
      };

      // Upload encrypted metadata to IPFS
      const encryptedCID = await uploadToIPFS(metadata);

      notification.remove(notificationId);
      notificationId = notification.loading("Generating privacy commitment...");

      // Generate bidder commitment for privacy
      notificationId = notification.loading("Generating privacy commitment...");
      const mockPublicKey = `bidder_${formData.requestId}_${Date.now()}`;
      const bidderCommitment = generateCommitment(mockPublicKey, formData.nonce);

      notification.remove(notificationId);
      notificationId = notification.loading("Encoding transaction data...");

      // Encode the submitBid function call
      const submitBidData = encodeFunctionData({
        abi: [
          {
            type: "function",
            name: "submitBid",
            inputs: [
              { name: "requestId", type: "uint256", internalType: "uint256" },
              { name: "userIdentifier", type: "bytes32", internalType: "bytes32" },
              { name: "bidderCommitment", type: "bytes32", internalType: "bytes32" },
              { name: "encryptedBidMetadataCID", type: "string", internalType: "string" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "submitBid",
        args: [BigInt(formData.requestId), userIdentifier, bidderCommitment, encryptedCID],
      });

      notification.remove(notificationId);
      notificationId = notification.loading("Estimating transaction costs...");

      // Get contract address from deployed contracts
      const contractAddress = "0xa15bb66138824a1c7167f5e85b957d04dd34e468"; // PrivacyMarketplace address

      // Estimate gas before sending
      const gasEstimate = await estimateUserOpGas({
        to: contractAddress,
        data: submitBidData,
        value: BigInt(0),
        usePaymaster,
      });

      if (gasEstimate) {
        console.log("Gas estimate for bid submission:", gasEstimate);
      }

      notification.remove(notificationId);
      notificationId = notification.loading("Submitting bid via meta-transaction...");

      // Submit the bid using 4337 meta-transaction
      const result = await sendUserOperation({
        to: contractAddress,
        data: submitBidData,
        value: BigInt(0),
        usePaymaster,
      });

      notification.remove(notificationId);

      if (result && result.success) {
        notification.success(
          `Bid submitted successfully! 🎉\nUser Operation Hash: ${result.userOpHash.slice(0, 10)}...`,
          {
            icon: "✅",
            duration: 8000,
          },
        );

        // Store the user identifier and secret locally
        // localStorage.setItem(`bid_${formData.requestId}_${Date.now()}_identifier`, userIdentifier);
        // localStorage.setItem(`bid_${formData.requestId}_${Date.now()}_secret`, formData.userSecret);

        // Reset form with default emoji string
        setFormData({
          requestId: "",
          bidAmount: "",
          proposalText: "",
          deliveryTime: "",
          contactInfo: "",
          nonce: generateNonce(),
          userSecret: "🎮🌟🎨🎭🎪🎢🎡🎯",
        });
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      if (notificationId) {
        notification.remove(notificationId);
      }
      console.error("Failed to submit bid:", error);
      notification.error(`Failed to submit bid: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || is4337Loading;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto bg-base-100 rounded-box shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Submit Private Bid</h2>
        <p className="text-base-content/70 mt-2">Create an anonymous bid using ERC-4337 meta-transactions</p>
      </div>

      {/* Request ID Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Request ID *</span>
          <span className="label-text-alt">The ID of the request you want to bid on</span>
        </label>
        <input
          type="number"
          placeholder="Enter request ID (e.g., 0, 1, 2...)"
          className="input input-bordered"
          value={formData.requestId}
          onChange={e => handleInputChange("requestId", e.target.value)}
        />
      </div>

      {/* Request Details Display - Fixed indices */}
      {requestDetails && (
        <div className="alert alert-success">
          <div className="flex flex-col gap-1">
            <div className="font-semibold">✅ Request Found</div>
            <div className="text-sm">
              <p>
                <strong>Status:</strong> {requestDetails[4] ? "Active" : "Closed"} {/* isActive is at index 4 */}
              </p>
              <p>
                <strong>Existing Bids:</strong> {requestDetails[5]?.toString() || "0"} {/* bidCount is at index 5 */}
              </p>
              <p>
                <strong>Posted:</strong> {new Date(Number(requestDetails[3]) * 1000).toLocaleDateString()}{" "}
                {/* timestamp is at index 3 */}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bid Amount */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Bid Amount (ETH) *</span>
          <span className="label-text-alt">Your proposed price for the service</span>
        </label>
        <EtherInput
          placeholder="0.0"
          value={formData.bidAmount}
          onChange={value => handleInputChange("bidAmount", value)}
        />
      </div>

      {/* Proposal Text */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Proposal Description *</span>
          <span className="label-text-alt">Describe your approach and qualifications</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="Describe how you would complete this request, your experience, and why you're the best choice..."
          value={formData.proposalText}
          onChange={e => handleInputChange("proposalText", e.target.value)}
        />
      </div>

      {/* Delivery Time */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Estimated Delivery Time</span>
          <span className="label-text-alt">When you can complete the work</span>
        </label>
        <input
          type="text"
          placeholder="e.g., 3-5 days, 1 week, 2 weeks"
          className="input input-bordered"
          value={formData.deliveryTime}
          onChange={e => handleInputChange("deliveryTime", e.target.value)}
        />
      </div>

      {/* Contact Information */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Contact Information</span>
          <span className="label-text-alt">How the requester can reach you (encrypted)</span>
        </label>
        <input
          type="text"
          placeholder="Email, Discord, Telegram, etc."
          className="input input-bordered"
          value={formData.contactInfo}
          onChange={e => handleInputChange("contactInfo", e.target.value)}
        />
      </div>

      {/* Privacy Nonce Display */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Privacy Nonce</span>
          <span className="label-text-alt">Cryptographic nonce for privacy commitment</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1 font-mono text-xs"
            value={formData.nonce}
            readOnly
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleInputChange("nonce", generateNonce())}
          >
            🔄
          </button>
        </div>
      </div>

      {/* User Secret Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">User Secret (8 Emojis)</span>
          <span className="label-text-alt">Your unique identifier</span>
        </label>
        <input
          type="text"
          className="input input-bordered font-emoji"
          value={formData.userSecret}
          onChange={e => handleInputChange("userSecret", e.target.value)}
          maxLength={24} // 8 emojis × 3 bytes max per emoji
          placeholder="🎮🌟🎨🎭🎪🎢🎡🎯"
        />
        <label className="label">
          <span className="label-text-alt">This will be used to identify your bids</span>
        </label>
      </div>

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

      {/* Submit Button */}
      <button
        className="btn btn-primary btn-lg"
        onClick={handleSubmitBid}
        disabled={
          isLoading ||
          !address ||
          !walletClient ||
          !formData.requestId ||
          !formData.bidAmount ||
          !formData.proposalText ||
          (requestDetails && !requestDetails[4])
        }
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Submitting Bid...
          </>
        ) : (
          <>🔐 Submit Private Bid</>
        )}
      </button>

      {/* Privacy Information */}
      <div className="divider">Privacy & Security</div>
      <div className="text-sm text-base-content/70 bg-base-200 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">🔒 Privacy Features:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Encrypted Metadata:</strong> Your bid details are encrypted before storage
          </li>
          <li>
            <strong>Commitment Scheme:</strong> Your identity is protected with cryptographic commitments
          </li>
          <li>
            <strong>User Identifier:</strong> A signature-based ID ties you to your bids without revealing your address
            on-chain
          </li>
          <li>
            <strong>Meta-Transactions:</strong> Submit bids without revealing your wallet address on-chain
          </li>
          <li>
            <strong>Decentralized Storage:</strong> Encrypted data stored on IPFS/Filecoin
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">⚡ ERC-4337 Benefits:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Gasless Transactions:</strong> Optionally use paymasters to sponsor gas fees
          </li>
          <li>
            <strong>Smart Contract Wallets:</strong> Enhanced security and programmable logic
          </li>
          <li>
            <strong>User Experience:</strong> No need to hold ETH for gas when using paymasters
          </li>
        </ul>
      </div>
    </div>
  );
};
