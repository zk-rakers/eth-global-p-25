import { useCallback } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function usePrivacyMarketplace() {
  const {
    writeContractAsync: postRequest,
    isMining,
    error,
  } = useScaffoldWriteContract({
    contractName: "PrivacyMarketplace",
  });

  const submitService = useCallback(
    async (hash: string, ipfsHash: string) => {
      try {
        console.log("Starting contract interaction...");
        console.log("Hash:", hash);
        console.log("IPFS Hash:", ipfsHash);

        // Ensure hash is in the correct format for bytes32
        const formattedHash = hash.startsWith("0x") ? hash : `0x${hash}`;
        if (formattedHash.length !== 66) {
          // 0x + 64 hex chars
          throw new Error("Invalid hash format. Expected 32 bytes (64 hex chars)");
        }
        console.log("Formatted hash:", formattedHash);

        const tx = await postRequest({
          functionName: "postRequest",
          // @ts-ignore
          args: [formattedHash as `0x${string}`, ipfsHash as `0x${string}`],
        });

        console.log("Transaction result:", tx);

        if (!tx) {
          throw new Error("Transaction failed");
        }

        return tx;
      } catch (error) {
        console.error("Error in submitService:", error);
        throw error;
      }
    },
    [postRequest],
  );

  return {
    submitService,
    isLoading: isMining,
    error,
  };
}
