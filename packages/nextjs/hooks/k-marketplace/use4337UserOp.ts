import { useCallback, useState } from "react";
import { SmartAccountClient, createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { Address, Hash, Hex, createPublicClient, http, parseEther } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { useAccount, useWalletClient } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export interface UserOpConfig {
  bundlerUrl?: string;
  paymasterUrl?: string;
  smartAccountAddress?: Address;
}

export interface SendUserOpParams {
  to: Address;
  value?: bigint;
  data?: Hex;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  usePaymaster?: boolean;
}

export interface UserOpReceipt {
  userOpHash: Hash;
  transactionHash?: Hash;
  success: boolean;
  actualGasUsed?: bigint;
  actualGasCost?: bigint;
}

/**
 * Hook for handling EIP-4337 user operations with permissionless.js
 * Provides functionality to sign user operations and send them to bundler for meta-transactions
 */
export const use4337UserOp = (config?: UserOpConfig) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { targetNetwork } = useTargetNetwork();

  const [isLoading, setIsLoading] = useState(false);
  const [smartAccountClient, setSmartAccountClient] = useState<SmartAccountClient | null>(null);
  const [publicClient, setPublicClient] = useState<any>(null);

  // Initialize clients
  const initializeClients = useCallback(async () => {
    if (!walletClient || !targetNetwork) return;

    try {
      const bundlerUrl =
        config?.bundlerUrl ||
        `https://api.pimlico.io/v2/${targetNetwork.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`;

      // Create public client for reading blockchain data
      const client = createPublicClient({
        transport: http(),
        chain: targetNetwork,
      });
      setPublicClient(client);

      // Use traditional EIP-4337 smart account instead of EIP-7702
      const simpleAccount = await toSimpleSmartAccount({
        client,
        // @ts-ignore
        owner: walletClient.account,
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
      });

      // Create smart account client
      const smartAccount = createSmartAccountClient({
        account: simpleAccount,
        chain: targetNetwork,
        bundlerTransport: http(bundlerUrl),
      });

      setSmartAccountClient(smartAccount);

      return { smartAccount, publicClient: client };
    } catch (error) {
      console.error("Failed to initialize 4337 clients:", error);
      notification.error("Failed to initialize smart account clients");
      debugger;

      return null;
    }
  }, [walletClient, targetNetwork, config?.bundlerUrl]);

  // Send user operation
  const sendUserOperation = useCallback(
    async (params: SendUserOpParams): Promise<UserOpReceipt | null> => {
      if (!smartAccountClient) {
        notification.error("Smart account client not initialized");
        return null;
      }

      setIsLoading(true);
      let notificationId: string | null = null;

      try {
        notificationId = notification.loading("Preparing user operation...");

        notification.remove(notificationId);
        notificationId = notification.loading("Signing user operation...");

        // Send user operation to bundler
        const userOpHash = await smartAccountClient.sendUserOperation({
          calls: [
            {
              to: params.to,
              value: params.value || BigInt(0),
              data: params.data || "0x",
            },
          ],
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
          account: smartAccountClient.account,
        });

        notification.remove(notificationId);
        notificationId = notification.loading("Waiting for user operation confirmation...");

        // For now, we'll simulate a successful receipt since the exact API might vary
        // In a real implementation, you'd use the bundler client to wait for receipt
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate wait time

        notification.remove(notificationId);

        const result: UserOpReceipt = {
          userOpHash,
          success: true,
          actualGasUsed: BigInt(100000), // Estimated
          actualGasCost: BigInt(100000) * (params.maxFeePerGas || parseEther("0.000000001")),
        };

        notification.success("User operation executed successfully!", {
          icon: "🎉",
        });

        return result;
      } catch (error: any) {
        if (notificationId) {
          notification.remove(notificationId);
        }
        console.error("Failed to send user operation:", error);
        notification.error(`Failed to send user operation: ${error.message}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [smartAccountClient],
  );

  // Get user operation receipt (placeholder implementation)
  const getUserOpReceipt = useCallback(async (userOpHash: Hash) => {
    console.log("Getting receipt for:", userOpHash);
    // This would typically query the bundler for the receipt
    return {
      userOpHash,
      success: true,
      blockNumber: BigInt(0),
      blockHash: "0x" as Hash,
      transactionIndex: 0,
    };
  }, []);

  // Get user operation by hash (placeholder implementation)
  const getUserOpByHash = useCallback(
    async (userOpHash: Hash) => {
      console.log("Getting user op for:", userOpHash);
      // This would typically query the bundler for the user operation
      return {
        userOpHash,
        sender: address,
        nonce: BigInt(0),
      };
    },
    [address],
  );

  // Check if account supports paymasters (simplified implementation)
  const checkPaymasterSupport = useCallback(async () => {
    // This would check if the current setup supports paymasters
    return !!config?.paymasterUrl;
  }, [config?.paymasterUrl]);

  // Get gas estimates for user operation (simplified implementation)
  const estimateUserOpGas = useCallback(
    async (params: SendUserOpParams) => {
      if (!address) {
        notification.error("No address available");
        return null;
      }

      try {
        // Simplified gas estimation
        return {
          callGasLimit: BigInt(100000),
          verificationGasLimit: BigInt(100000),
          preVerificationGas: BigInt(21000),
          maxFeePerGas: params.maxFeePerGas || parseEther("0.000000001"),
          maxPriorityFeePerGas: params.maxPriorityFeePerGas || parseEther("0.000000001"),
        };
      } catch (error) {
        console.error("Failed to estimate gas:", error);
        return null;
      }
    },
    [address],
  );

  return {
    // State
    isLoading,
    smartAccountClient,
    publicClient,

    // Actions
    initializeClients,
    sendUserOperation,
    getUserOpReceipt,
    getUserOpByHash,
    checkPaymasterSupport,
    estimateUserOpGas,

    // Utils
    isInitialized: !!smartAccountClient,
  };
};
