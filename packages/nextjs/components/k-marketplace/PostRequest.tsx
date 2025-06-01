"use client";

import { useEffect, useState } from "react";
import { encodeFunctionData, keccak256, toHex } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { EtherInput } from "~~/components/scaffold-eth";
import { use4337UserOp } from "~~/hooks/k-marketplace";
import { usePubkeyProof } from "~~/hooks/k-marketplace/usePubkeyProof";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface RequestFormData {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  requirements: string;
  contactPreferences: string;
  salt: string;
  userSecret: string;
}

interface EncryptedRequestMetadata {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  requirements: string;
  contactPreferences: string;
  timestamp: number;
  requesterInfo: string;
}

/**
 * Component for creating and posting service requests using ERC-4337 meta-transactions
 * Implements privacy-preserving request posting with commitment schemes and encrypted metadata
 */
export const PostRequest = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [formData, setFormData] = useState<RequestFormData>({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    category: "",
    requirements: "",
    contactPreferences: "",
    salt: "",
    userSecret: "🎮🌟🎨🎭🎪🎢🎡🎯", // Default 8 emoji string
  });

  const [isPosting, setIsPosting] = useState(false);
  const [usePaymaster, setUsePaymaster] = useState(true);

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

  // Read total requests for display
  const { data: totalRequests } = useScaffoldReadContract({
    contractName: "PrivacyMarketplace",
    functionName: "getTotalRequests",
  });

  // Generate random salt for privacy
  const generateSalt = () => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return toHex(randomBytes);
  };

  // Generate new salt on component mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      salt: generateSalt(),
    }));
  }, []);

  // Helper function to simulate IPFS upload
  const uploadToIPFS = async (data: EncryptedRequestMetadata): Promise<string> => {
    // In a real implementation, this would:
    // 1. Encrypt the data with a symmetric key
    // 2. Upload to IPFS/Filecoin
    // 3. Return the CID

    // For now, we'll simulate with a delay and return a mock CID
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockCID = `QmR${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    console.log("Mock encrypted request metadata uploaded to IPFS:", { data, cid: mockCID });

    return mockCID;
  };

  // Generate commitment hash for privacy
  const generateCommitment = (encryptedCID: string, salt: string): `0x${string}` => {
    // Generate commitment: keccak256(encryptedCID || salt)
    const commitment = keccak256(toHex(encryptedCID + salt.slice(2)));
    return commitment;
  };

  const handleInputChange = (field: keyof RequestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const { handleSignAndGetProof } = usePubkeyProof();

  const handlePostRequest = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.budget) {
      notification.error("Please fill in all required fields");
      return;
    }

    if (!address || !walletClient) {
      notification.error("Wallet not connected. Please connect your wallet.");
      return;
    }

    setIsPosting(true);
    let notificationId: string | null = null;

    let proof: string | null = null;

    try {
      proof = await handleSignAndGetProof();
      console.log("proof", proof);
    } catch (error) {
      console.error("Failed to sign and get proof:", error);
      notification.error("Failed to sign and get proof");
      return;
    }

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
      notificationId = notification.loading("Preparing encrypted request metadata...");
      const metadata: EncryptedRequestMetadata = {
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        deadline: formData.deadline,
        category: formData.category,
        requirements: formData.requirements,
        contactPreferences: formData.contactPreferences,
        timestamp: Date.now(),
        requesterInfo: `Request posted via privacy marketplace at ${new Date().toISOString()}`,
      };

      // Upload encrypted metadata to IPFS
      const encryptedCID = await uploadToIPFS(metadata);

      notification.remove(notificationId);
      notificationId = notification.loading("Generating privacy commitment...");

      // Generate commitment for privacy
      const commitment = generateCommitment(encryptedCID, formData.salt);

      notification.remove(notificationId);
      notificationId = notification.loading("Encoding transaction data...");

      // Encode the postRequest function call with userIdentifier
      const postRequestData = encodeFunctionData({
        abi: [
          {
            type: "function",
            name: "postRequest",
            inputs: [
              { name: "userIdentifier", type: "bytes32", internalType: "bytes32" },
              { name: "commitment", type: "bytes32", internalType: "bytes32" },
              { name: "encryptedCID", type: "string", internalType: "string" },
              { name: "title", type: "string", internalType: "string" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "postRequest",
        args: [userIdentifier, commitment, encryptedCID, formData.title],
      });

      notification.remove(notificationId);
      notificationId = notification.loading("Estimating transaction costs...");

      // Get contract address from deployed contracts
      const contractAddress = "0xa15bb66138824a1c7167f5e85b957d04dd34e468"; // PrivacyMarketplace address

      // Estimate gas before sending
      const gasEstimate = await estimateUserOpGas({
        to: contractAddress,
        data: postRequestData,
        value: BigInt(0),
        usePaymaster,
      });

      if (gasEstimate) {
        console.log("Gas estimate for request posting:", gasEstimate);
      }

      notification.remove(notificationId);
      notificationId = notification.loading("Posting request via meta-transaction...");

      // Post the request using 4337 meta-transaction
      const result = await sendUserOperation({
        to: contractAddress,
        data: postRequestData,
        value: BigInt(0),
        usePaymaster,
      });

      notification.remove(notificationId);

      if (result && result.success) {
        // Store the user identifier and secret locally
        // localStorage.setItem(`request_${totalRequests}_identifier`, userIdentifier);
        // localStorage.setItem(`request_${totalRequests}_secret`, formData.userSecret);

        notification.success(
          `Request posted successfully! 🎉\nUser Operation Hash: ${result.userOpHash.slice(0, 10)}...\nYour request will have ID: ${totalRequests?.toString() || "N/A"}`,
          {
            icon: "✅",
            duration: 10000,
          },
        );

        // Reset form
        setFormData({
          title: "",
          description: "",
          budget: "",
          deadline: "",
          category: "",
          requirements: "",
          contactPreferences: "",
          salt: generateSalt(),
          userSecret: "🎮🌟🎨🎭🎪🎢🎡🎯", // Reset to default emoji string
        });
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      if (notificationId) {
        notification.remove(notificationId);
      }
      console.error("Failed to post request:", error);
      notification.error(`Failed to post request: ${error.message || "Unknown error"}`);
    } finally {
      setIsPosting(false);
    }
  };

  const isLoading = isPosting || is4337Loading;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto bg-base-100 rounded-box shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Post Service Request</h2>
        <p className="text-base-content/70 mt-2">Create a private service request using ERC-4337 meta-transactions</p>
        {totalRequests !== undefined && (
          <div className="badge badge-info mt-2">Total Requests: {totalRequests.toString()}</div>
        )}
      </div>

      {/* Request Title */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Request Title *</span>
          <span className="label-text-alt">Brief description of what you need</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Build a React component, Design a logo, Write smart contract"
          className="input input-bordered"
          value={formData.title}
          onChange={e => handleInputChange("title", e.target.value)}
        />
      </div>

      {/* Request Description */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Detailed Description *</span>
          <span className="label-text-alt">Comprehensive description of your requirements</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-32"
          placeholder="Describe your project in detail, including scope, deliverables, technical requirements, and any specific preferences or constraints..."
          value={formData.description}
          onChange={e => handleInputChange("description", e.target.value)}
        />
      </div>

      {/* Budget */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Budget (ETH) *</span>
          <span className="label-text-alt">Your budget for this project</span>
        </label>
        <EtherInput placeholder="0.0" value={formData.budget} onChange={value => handleInputChange("budget", value)} />
      </div>

      {/* Category */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Category</span>
          <span className="label-text-alt">Type of service you&apos;re looking for</span>
        </label>
        <select
          className="select select-bordered"
          value={formData.category}
          onChange={e => handleInputChange("category", e.target.value)}
        >
          <option value="">Select a category</option>
          <option value="development">Development</option>
          <option value="design">Design</option>
          <option value="writing">Writing</option>
          <option value="marketing">Marketing</option>
          <option value="consulting">Consulting</option>
          <option value="research">Research</option>
          <option value="smart-contracts">Smart Contracts</option>
          <option value="defi">DeFi</option>
          <option value="nft">NFT</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Deadline */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Deadline</span>
          <span className="label-text-alt">When you need this completed</span>
        </label>
        <input
          type="text"
          placeholder="e.g., 1 week, 2 weeks, 1 month, ASAP"
          className="input input-bordered"
          value={formData.deadline}
          onChange={e => handleInputChange("deadline", e.target.value)}
        />
      </div>

      {/* Requirements */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Specific Requirements</span>
          <span className="label-text-alt">Any specific skills, tools, or qualifications needed</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="e.g., Must have experience with React and Web3, Portfolio required, Native English speaker, etc."
          value={formData.requirements}
          onChange={e => handleInputChange("requirements", e.target.value)}
        />
      </div>

      {/* Contact Preferences */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Contact Preferences</span>
          <span className="label-text-alt">How bidders should contact you (encrypted)</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Discord: username#1234, Email: contact@example.com"
          className="input input-bordered"
          value={formData.contactPreferences}
          onChange={e => handleInputChange("contactPreferences", e.target.value)}
        />
      </div>

      {/* Privacy Salt Display */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Privacy Salt</span>
          <span className="label-text-alt">Cryptographic salt for privacy commitment</span>
        </label>
        <div className="flex gap-2">
          <input type="text" className="input input-bordered flex-1 font-mono text-xs" value={formData.salt} readOnly />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleInputChange("salt", generateSalt())}
          >
            🔄
          </button>
        </div>
      </div>

      {/* User Secret */}
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
          <span className="label-text-alt">This will be used to identify your requests</span>
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
        onClick={handlePostRequest}
        disabled={
          isLoading || !address || !walletClient || !formData.title || !formData.description || !formData.budget
        }
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Posting Request...
          </>
        ) : (
          <>🚀 Post Private Request</>
        )}
      </button>

      {/* Privacy Information */}
      <div className="divider">Privacy & Security</div>
      <div className="text-sm text-base-content/70 bg-base-200 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">🔒 Privacy Features:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Encrypted Metadata:</strong> All request details are encrypted before storage
          </li>
          <li>
            <strong>Commitment Scheme:</strong> Your identity is protected with cryptographic commitments
          </li>
          <li>
            <strong>Meta-Transactions:</strong> Post requests without revealing your wallet address on-chain
          </li>
          <li>
            <strong>Decentralized Storage:</strong> Encrypted data stored on IPFS/Filecoin
          </li>
          <li>
            <strong>Salt-based Privacy:</strong> Random salt ensures commitment uniqueness
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
          <li>
            <strong>Batch Operations:</strong> Efficient transaction bundling
          </li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2">📋 Next Steps:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>After posting, bidders can submit encrypted bids on your request</li>
          <li>Review bids and accept the best proposals</li>
          <li>Establish secure communication channels with selected bidders</li>
          <li>Collaborate privately while maintaining anonymity</li>
        </ol>
      </div>
    </div>
  );
};
