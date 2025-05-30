"use client";

import { useEffect, useState } from "react";
import { Address, parseEther } from "viem";
import { AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { SendUserOpParams, use4337UserOp } from "~~/hooks/k-marketplace";

/**
 * Example component demonstrating EIP-4337 user operations
 * Shows how to sign and send user operations using the bundler
 */
export const UserOpExample = () => {
  const [targetAddress, setTargetAddress] = useState<Address>("0x");
  const [value, setValue] = useState("");
  const [callData, setCallData] = useState<string>("");
  const [usePaymaster, setUsePaymaster] = useState(false);

  // Initialize the 4337 hook with optional config
  const {
    isLoading,
    isInitialized,
    initializeClients,
    sendUserOperation,
    getUserOpReceipt,
    checkPaymasterSupport,
    estimateUserOpGas,
  } = use4337UserOp({
    // Optional: specify custom bundler/paymaster URLs
    // bundlerUrl: "https://your-custom-bundler.com",
    // paymasterUrl: "https://your-paymaster.com",
  });

  // Initialize clients on mount
  useEffect(() => {
    initializeClients();
  }, [initializeClients]);

  const handleSendUserOp = async () => {
    if (!targetAddress || !isInitialized) {
      alert("Please ensure wallet is connected and enter a target address");
      return;
    }

    try {
      const params: SendUserOpParams = {
        to: targetAddress,
        value: value ? parseEther(value) : BigInt(0),
        data: callData ? (callData as `0x${string}`) : "0x",
        usePaymaster,
      };

      // Optional: Get gas estimates first
      const gasEstimate = await estimateUserOpGas(params);
      if (gasEstimate) {
        console.log("Gas estimate:", gasEstimate);
      }

      // Send the user operation
      const result = await sendUserOperation(params);

      if (result) {
        console.log("User operation result:", result);
        alert(`User operation sent! Hash: ${result.userOpHash}`);

        // Optionally get more details about the receipt
        if (result.userOpHash) {
          const receipt = await getUserOpReceipt(result.userOpHash);
          console.log("Full receipt:", receipt);
        }
      }
    } catch (error) {
      console.error("Failed to send user operation:", error);
    }
  };

  const handleCheckPaymasterSupport = async () => {
    const supported = await checkPaymasterSupport();
    alert(`Paymaster support: ${supported ? "Yes" : "No"}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-md mx-auto bg-base-100 rounded-box shadow-lg">
      <h2 className="text-2xl font-bold text-center">EIP-4337 User Operations</h2>

      {/* Connection Status */}
      <div className="alert alert-info">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isInitialized ? "bg-green-500" : "bg-red-500"}`}></div>
          <span>{isInitialized ? "✅ Smart Account Ready" : "❌ Initializing..."}</span>
        </div>
      </div>

      {/* Target Address Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Target Address</span>
        </label>
        <AddressInput placeholder="0x..." value={targetAddress} onChange={setTargetAddress} />
      </div>

      {/* Value Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Value (ETH)</span>
        </label>
        <EtherInput placeholder="0.0" value={value} onChange={setValue} />
      </div>

      {/* Call Data Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Call Data (optional)</span>
        </label>
        <input
          type="text"
          placeholder="0x..."
          className="input input-bordered"
          value={callData}
          onChange={e => setCallData(e.target.value)}
        />
      </div>

      {/* Paymaster Option */}
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Use Paymaster (Gasless)</span>
          <input
            type="checkbox"
            className="checkbox"
            checked={usePaymaster}
            onChange={e => setUsePaymaster(e.target.checked)}
          />
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          className="btn btn-primary"
          onClick={handleSendUserOp}
          disabled={isLoading || !isInitialized || !targetAddress}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Sending User Op...
            </>
          ) : (
            "Send User Operation"
          )}
        </button>

        <button
          className="btn btn-secondary btn-outline"
          onClick={handleCheckPaymasterSupport}
          disabled={!isInitialized}
        >
          Check Paymaster Support
        </button>
      </div>

      {/* Info Section */}
      <div className="divider">Info</div>
      <div className="text-sm text-base-content/70">
        <p className="mb-2">
          <strong>EIP-4337 Account Abstraction:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Sign user operations instead of transactions</li>
          <li>Support for gasless transactions via paymasters</li>
          <li>Smart contract wallets with custom logic</li>
          <li>Bundler handles submission to network</li>
        </ul>
      </div>
    </div>
  );
};
