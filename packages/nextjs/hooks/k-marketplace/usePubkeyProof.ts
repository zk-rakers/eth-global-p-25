import { useCallback, useState } from "react";
import { useSelectedNetwork } from "../scaffold-eth";
import { signMessage } from "wagmi/actions";
import { useAccount, useConfig } from "wagmi";
import { keccak256 } from "viem";
import { createVlayerClient } from "@vlayer/sdk";
import PubkeyProver from "~~/vlayer_abi/proover.json";

const vlayer = createVlayerClient();

export const usePubkeyProof = () => {
  const { address: account, chain: accountChain } = useAccount();
  const selectedNetwork = useSelectedNetwork(accountChain?.id);

  const config = useConfig();

  const [salt, ] = useState(() => keccak256("ETH_PRAGUE_25"));

  const handleSignAndGetProof = useCallback(async () => {

    const signature = await signMessage(config, 
      {
        message: salt,
        account: account,
      },
    );

    console.log("signature", signature);

    const hash = await vlayer.prove({
      address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      proverAbi: PubkeyProver.abi as any,
      functionName: 'proofPubKey',
      args: [salt, signature],
      chainId: selectedNetwork.id,
    });

    debugger

    console.log("proof", hash);

    return hash;
  }, [account, salt, selectedNetwork]);

  return {
    handleSignAndGetProof,
  };
};
