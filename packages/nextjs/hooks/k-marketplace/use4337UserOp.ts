import { useCallback, useState } from "react";
import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount, toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { Address, Hash, Hex, createPublicClient, http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { useAccount, useWalletClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { AllowedChainIds, notification } from "~~/utils/scaffold-eth";

export interface UserOpConfig {
  bundlerUrl?: string;
  paymasterUrl?: string;
  accountType?: "simple" | "safe" | "kernel";
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
  blockNumber?: bigint;
  blockHash?: Hash;
  transactionIndex?: number;
}

export interface AccountInfo {
  address: Address;
  isDeployed: boolean;
  nonce: bigint;
  smartAccount?: any;
}

/**
 * Hook for handling EIP-4337 user operations using permissionless.js
 */
export const use4337UserOp = (config?: UserOpConfig) => {
  const account = useAccount();
  const { address } = account;
  const { data: walletClient } = useWalletClient();
  const { targetNetwork } = useTargetNetwork();

  const [isLoading, setIsLoading] = useState(false);
  const [smartAccountClient, setSmartAccountClient] = useState<any>(null);

  // Default configuration
  const bundlerUrl =
    config?.bundlerUrl || `https://api.pimlico.io/v2/${targetNetwork.id}/rpc?apikey=pim_bMe21TKgcVep7eeYfR9SEx`;
  const accountType = config?.accountType || "simple";

  console.log("walletClient", walletClient);

  // Hook for reading from ZkAccountFactory
  const { data: factoryEntryPoint } = useScaffoldReadContract({
    contractName: "ZkAccountFactory",
    functionName: "entryPoint",
  });

  const { data: zkAccountFactory } = useScaffoldContract({
    contractName: "ZkAccountFactory",
  });

  const { data: deployedContractData } = useDeployedContractInfo({
    contractName: "ZkAccount",
    chainId: targetNetwork?.id as AllowedChainIds,
  });

  // Create pimlico client (combines bundler and paymaster)
  const createPimlicoClientInstance = useCallback(() => {
    return createPimlicoClient({
      transport: http(bundlerUrl),
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    });
  }, [bundlerUrl]);

  // Create smart account from wallet client
  const createSmartAccount = useCallback(async (
    proof: string,
    root: string,
    salt: string,
  ) => {
    if (!zkAccountFactory) {
      notification.error("ZkAccountFactory not found");
      throw new Error("ZkAccountFactory not found");
    }

    console.log("walletClient", account);

    const publicClient = createPublicClient({
      transport: http(),
      chain: targetNetwork,
    });

    const AAFactory = await zkAccountFactory.read.getAddress([proof, root, salt]);

    debugger;

    // Create smart account based on type
    switch (accountType) {
      case "safe":
        return await toSafeSmartAccount({
          client: publicClient,
          // @ts-ignore
          owners: [account.address],
          entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
          },
          version: "1.4.1",
        });

      case "simple":
      default:
        return await toSimpleSmartAccount({
          client: publicClient,
          // @ts-ignore
          owner: walletClient,
          address: deployedContractData?.address, // hardcoded
          factoryAddress: AAFactory,
          entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
          },
        });
    }
  }, [walletClient, targetNetwork, accountType, account, deployedContractData, zkAccountFactory]);

  // Initialize smart account client
  const initializeSmartAccountClient = useCallback(async (
    proof: string,
    root: string,
    salt: string,
  ) => {
    try {
      const smartAccount = await createSmartAccount(proof, root, salt);
      const pimlicoClient = createPimlicoClientInstance();

      const client = createSmartAccountClient({
        account: smartAccount,
        chain: targetNetwork,
        bundlerTransport: http(bundlerUrl),
        paymaster: pimlicoClient,
        userOperation: {
          estimateFeesPerGas: async () => {
            return (await pimlicoClient.getUserOperationGasPrice()).fast;
          },
        },
      });

      debugger;

      setSmartAccountClient(client);
      return { smartAccount, client };
    } catch (error) {
      console.error("Failed to initialize smart account client:", error);

      debugger;
      throw error;
    }
  }, [createSmartAccount, createPimlicoClientInstance, targetNetwork, bundlerUrl]);

  const { address: connectedAddress } = useAccount();

  // Send user operation
  const sendUserOperation = useCallback(
    async (params: SendUserOpParams): Promise<UserOpReceipt | null> => {
      setIsLoading(true);
      let notificationId: string | null = null;

      try {
        notificationId = notification.loading("Preparing user operation...");

        console.log("client", connectedAddress, address, walletClient);

        const { client } = await initializeSmartAccountClient();
        debugger;

        // Send user operation using the new calls format
        const userOpHash = await client.sendUserOperation({
          calls: [
            {
              to: params.to,
              data: params.data || "0x",
              value: params.value || BigInt(0),
            },
          ],
        });

        notification.remove(notificationId);
        notificationId = notification.loading("Executing user operation...");

        // Wait for the user operation to be mined
        const receipt = await smartAccountClient.waitForUserOperationReceipt({
          hash: userOpHash,
        });

        notification.remove(notificationId);

        // const randomCommitment = randomBytes(32);
        // const randomEncryptedCID = randomBytes(32);

        const result: UserOpReceipt = {
          userOpHash,
          transactionHash: receipt.transactionHash,
          success: receipt.success,
          actualGasUsed: receipt.actualGasUsed,
          actualGasCost: receipt.actualGasCost,
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash,
          transactionIndex: receipt.transactionIndex,
        };

        notification.success("User operation executed successfully!", { icon: "🚀" });
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
    [smartAccountClient, connectedAddress, walletClient, initializeSmartAccountClient],
  );

  // Estimate gas for user operation
  const estimateUserOpGas = useCallback(
    async (params: SendUserOpParams) => {
      if (!smartAccountClient) {
        return null;
      }

      try {
        const gasEstimate = await smartAccountClient.estimateUserOperationGas({
          calls: [
            {
              to: params.to,
              data: params.data || "0x",
              value: params.value || BigInt(0),
            },
          ],
        });

        return gasEstimate;
      } catch (error) {
        console.error("Failed to estimate gas:", error);
        return null;
      }
    },
    [smartAccountClient],
  );

  // Get user operation receipt
  const getUserOpReceipt = useCallback(
    async (userOpHash: Hash): Promise<UserOpReceipt | null> => {
      if (!smartAccountClient) {
        return null;
      }

      try {
        const receipt = await smartAccountClient.getUserOperationReceipt({
          hash: userOpHash,
        });

        return {
          userOpHash,
          transactionHash: receipt.transactionHash,
          success: receipt.success,
          actualGasUsed: receipt.actualGasUsed,
          actualGasCost: receipt.actualGasCost,
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash,
          transactionIndex: receipt.transactionIndex,
        };
      } catch (error) {
        console.error("Failed to get user op receipt:", error);
        return null;
      }
    },
    [smartAccountClient],
  );

  return {
    // State
    isLoading,
    smartAccountClient,

    // Core actions
    sendUserOperation,
    estimateUserOpGas,
    getUserOpReceipt,

    // Factory info
    factoryInfo: {
      entryPoint: factoryEntryPoint || entryPoint07Address,
    },

    // Paymaster support
    checkPaymasterSupport: async () => !!config?.paymasterUrl,
  };
};
