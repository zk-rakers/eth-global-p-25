# Deployment Scripts

This directory contains the deployment scripts for the k-marketplace project built on Scaffold-ETH 2.

## Overview

The project consists of several smart contracts:
- **PrivacyMarketplace**: The main marketplace contract for anonymous requests and bids
- **PubkeyProver**: vlayer prover contract for public key verification
- **PubkeyVerifier**: vlayer verifier contract that uses the prover
- **ZkAccountFactory**: Factory for creating ZK-gated ERC-4337 smart accounts
- **ZkAccount**: ERC-4337 smart account with ZK proof validation

## Deployment Order

The contracts have dependencies, so they must be deployed in the correct order:

1. **PrivacyMarketplace** (no dependencies)
2. **PubkeyProver** (no dependencies)  
3. **PubkeyVerifier** (requires PubkeyProver address)
4. **ZkAccountFactory** (requires EntryPoint and ZKVerifier)

## Scripts

### Main Deployment Script
- `Deploy.s.sol`: Deploys all contracts in the correct order with proper dependency management

### Individual Contract Scripts
- `DeployPrivacyMarketplace.s.sol`: Deploy only the marketplace contract
- `DeployPubkeyProver.s.sol`: Deploy only the pubkey prover
- `DeployPubkeyVerifier.s.sol`: Deploy only the pubkey verifier (requires prover)
- `DeployZkAccountFactory.s.sol`: Deploy only the account factory (can use PubkeyVerifier or fallback to MockZKVerifier)

### Utility Scripts
- `DeployHelpers.s.sol`: Base contract with deployment utilities and cross-script registry
- `VerifyAll.s.sol`: Verify all deployed contracts on block explorers

## Usage

### Deploy All Contracts
```bash
# Local development (anvil)
yarn deploy

# Testnet deployment (e.g., Sepolia)
yarn deploy --network sepolia
```

### Deploy Individual Contracts
```bash
# Deploy just the marketplace
yarn deploy --file DeployPrivacyMarketplace.s.sol

# Deploy just the prover
yarn deploy --file DeployPubkeyProver.s.sol

# Deploy verifier (requires prover to be deployed first)
yarn deploy --file DeployPubkeyVerifier.s.sol

# Deploy account factory
yarn deploy --file DeployZkAccountFactory.s.sol
```

### Verify Contracts
```bash
yarn verify --network sepolia
```

## Development vs Production

### Local Development (Anvil)
- Uses MockEntryPoint for ERC-4337 functionality
- Uses MockZKVerifier if PubkeyVerifier is not available
- Sets up test proofs for easy testing

### Testnet/Mainnet
- Uses official EntryPoint contracts when available
- Warns when using mock contracts in production
- Requires proper ZK verifier setup

## Network Support

The scripts automatically detect the network and use appropriate configurations:

- **Anvil (31337)**: Uses mock contracts for development
- **Sepolia (11155111)**: Uses official EntryPoint
- **Mainnet (1)**: Uses official EntryPoint
- **Optimism (10)**: Uses official EntryPoint
- **Polygon (137)**: Uses official EntryPoint
- **Arbitrum (42161)**: Uses official EntryPoint

## Deployment Registry

The scripts use a shared deployment registry that allows contracts deployed in the same session to reference each other. This ensures proper dependency resolution when deploying multiple contracts.

## Output

Deployment artifacts are saved to:
- `deployments/<chainId>.json`: Contract addresses and network info
- Used by the frontend to connect to deployed contracts

## Troubleshooting

### Common Issues

1. **"PubkeyProver dependency not met"**
   - Deploy PubkeyProver first before PubkeyVerifier

2. **"Invalid private key"**
   - Set up your keystore account properly
   - For local development, uses anvil's default account

3. **"MockZKVerifier warning on non-local network"**
   - Replace with real ZK verifier implementation for production

### Getting Help

Check the Scaffold-ETH 2 documentation for more details on deployment configuration and network setup. 