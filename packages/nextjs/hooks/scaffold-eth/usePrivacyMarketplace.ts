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
    async (bytes32Hash: string, ipfsHash: string) => {
      try {
        console.log("Starting contract interaction...");
        console.log("Bytes32 Hash:", bytes32Hash);
        console.log("IPFS Hash:", ipfsHash);

        // Format IPFS hash to ensure it has 0x prefix
        const formattedIpfsHash = ipfsHash.startsWith("0x") ? ipfsHash : `0x${ipfsHash}`;
        console.log("Formatted IPFS hash:", formattedIpfsHash);

        const tx = await postRequest({
          functionName: "postRequest",
          args: [bytes32Hash as `0x${string}`, formattedIpfsHash as `0x${string}`, "", ""],
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
