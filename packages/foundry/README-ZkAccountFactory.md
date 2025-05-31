# ZkAccountFactory Deployment Guide

This guide explains how to deploy and use the ZkAccountFactory contract using Scaffold-ETH 2.

## Overview

The ZkAccountFactory creates ZK-gated ERC-4337 smart accounts that require zero-knowledge proof verification for account creation and operation. Each account validates ZK proofs against a merkle root or other public anchor.

## Components

1. **ZkAccountFactory**: Main factory contract for creating ZK accounts
2. **ZkAccount**: Individual smart account contracts with ZK validation
3. **MockZKVerifier**: Development/testing verifier (replace with real implementation)
4. **MockEntryPoint**: Local development EntryPoint (uses official on testnets)

## Deployment

### Local Development (Anvil)

```bash
# Start local blockchain
yarn chain

# Deploy all contracts (including ZkAccountFactory)
yarn deploy

# Or deploy only ZkAccountFactory
yarn deploy --file DeployZkAccountFactory.s.sol
```

### Testnet Deployment

```bash
# Deploy to Sepolia testnet
yarn deploy --file DeployZkAccountFactory.s.sol --network sepolia

# Deploy to Optimism testnet
yarn deploy --file DeployZkAccountFactory.s.sol --network optimism
```

## Contract Addresses

After deployment, the contracts will be exported to:
- `packages/nextjs/contracts/deployedContracts.ts` - For frontend integration
- `packages/foundry/deployments/[chainId].json` - Raw deployment data

## Usage Examples

### Frontend Integration

```typescript
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Read factory information
const { data: entryPoint } = useScaffoldReadContract({
  contractName: "ZkAccountFactory",
  functionName: "entryPoint",
});

// Create a new ZK account
const { writeContractAsync: createAccount } = useScaffoldWriteContract({
  contractName: "ZkAccountFactory",
});

await createAccount({
  functionName: "createAccount",
  args: [proof, root, salt],
});
```

### Direct Contract Interaction

```solidity
// Get predicted account address
address predictedAddr = factory.getAddress(proof, root, salt);

// Create account
ZkAccount account = factory.createAccount(proof, root, salt);

// Create account with auto-generated salt
ZkAccount account = factory.createAccountWithAutoSalt(proof, root);
```

## Testing

Run the test suite to verify deployment:

```bash
# Run all tests
forge test

# Run specific ZK account tests
forge test --match-contract ZkAccountFactory
forge test --match-contract ZkAccount
```

## Production Deployment

### Before Production

1. **Replace MockZKVerifier**: Deploy a real ZK verifier implementation
2. **Verify EntryPoint**: Ensure using official ERC-4337 EntryPoint contract
3. **Audit**: Have contracts audited by security professionals
4. **Test**: Thoroughly test on testnets

### Official EntryPoint Addresses

- **Ethereum Mainnet**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
- **Sepolia**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
- **Optimism**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
- **Arbitrum**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
- **Polygon**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`

### Production Deployment Commands

```bash
# Deploy to mainnet (requires mainnet keystore)
yarn deploy --file DeployZkAccountFactory.s.sol --network mainnet

# Verify contracts on Etherscan
yarn verify --network mainnet
```

## Configuration

### Environment Variables

```bash
# Set in .env file
ETH_KEYSTORE_ACCOUNT=scaffold-eth-custom  # For custom keystore
ETHERSCAN_API_KEY=your_api_key           # For contract verification
```

### Network Configuration

Networks are configured in `foundry.toml`. Add custom networks as needed:

```toml
[rpc_endpoints]
your_network = "https://your-rpc-url"

[etherscan]
your_network = { key = "${ETHERSCAN_API_KEY}" }
```

## Troubleshooting

### Common Issues

1. **Invalid Proof Error**: Ensure ZK proofs are properly formatted and valid
2. **EntryPoint Not Found**: Check network configuration and EntryPoint address
3. **Gas Issues**: Increase gas limits for complex ZK operations

### Debug Mode

```bash
# Run with verbose logging
forge script script/DeployZkAccountFactory.s.sol --rpc-url http://localhost:8545 --broadcast -vvv
```

## Security Considerations

1. **ZK Verifier**: Use audited ZK verification libraries
2. **Proof Generation**: Secure proof generation and prevent proof replay
3. **Account Recovery**: Implement account recovery mechanisms
4. **Access Control**: Properly manage factory admin functions

## Support

For issues and questions:
- Check Scaffold-ETH 2 documentation
- Review ERC-4337 specification
- Test thoroughly on testnets first 