import { useCallback } from "react";
import { useScaffoldReadContract } from "../scaffold-eth";
import { signMessage } from "wagmi/actions";
import { useAccount } from "wagmi";

export const usePubkeyProof = () => {
  const { address: account } = useAccount();

  const { data: salt } = useScaffoldReadContract({
    contractName: "PubkeyProver",
    functionName: "SALT",
  });

  const { data: pubkeyProver } = useScaffoldReadContract({
    contractName: "PubkeyProver",
    functionName: "proofPubKey",
    args: [salt, "0x6100000000000000000000000000000000000000000000000000000000000000"],
  });

  const handleSignAndGetProof = useCallback(async () => {
    const message = "Hello, world!";

    const signature = await signMessage(
      {
        message: message,
      },
      {
        account: account,
      },
    );

    return signature;
  }, [account, salt]);

  return {
    handleSignAndGetProof,
  };
};
