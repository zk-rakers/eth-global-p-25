//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/ZkAccountFactory.sol";
import "../contracts/ZkAccount.sol";
import "../contracts/IZKVerifier.sol";
import { IEntryPoint } from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/core/UserOperationLib.sol";

/**
 * @notice Mock ZK Verifier for development and testing
 * @dev This is a simple implementation that can be configured for testing
 * In production, replace with actual ZK verifier implementation
 */
contract MockZKVerifier is IZKVerifier {
    mapping(bytes32 => bool) public validProofs;
    mapping(bytes32 => bool) public proofSet;
    bool public defaultVerifyResult = true;

    event ProofValidated(bytes proof, bytes32 root, bool isValid);

    function setProofValid(bytes memory proof, bytes32 root, bool isValid) external {
        bytes32 key = keccak256(abi.encodePacked(proof, root));
        validProofs[key] = isValid;
        proofSet[key] = true;
    }

    function setDefaultVerifyResult(bool result) external {
        defaultVerifyResult = result;
    }

    function verify(Proof calldata proof, bytes32 _nullifier) external view override returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(proof.seal.seal, _nullifier));
        
        // If this specific proof/root combination was explicitly set, use that value
        if (proofSet[key]) {
            return validProofs[key];
        }
        
        // Otherwise use default (true for development convenience)
        return defaultVerifyResult;
    }
}

/**
 * @notice Simplified Mock EntryPoint for local development
 * @dev For production, use the official EntryPoint contract
 * Official EntryPoint addresses:
 * - Ethereum Mainnet: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
 * - Sepolia: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
 * - Optimism: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
 */
contract MockEntryPoint {
    using UserOperationLib for PackedUserOperation;

    function getUserOpHash(PackedUserOperation calldata) external pure returns (bytes32) {
        return keccak256("mock_hash");
    }

    function getNonce(address, uint192) external pure returns (uint256) {
        return 0;
    }

    function balanceOf(address) external pure returns (uint256) {
        return 1 ether; // Mock balance for testing
    }
}

/**
 * @notice Deploy script for ZkAccountFactory contract
 * @dev Deploys ZkAccountFactory with MockZKVerifier and EntryPoint contracts
 * 
 * Usage:
 * - Local: yarn deploy --file DeployZkAccountFactory.s.sol
 * - Testnet: yarn deploy --file DeployZkAccountFactory.s.sol --network sepolia
 * 
 * For production deployment:
 * 1. Replace MockZKVerifier with actual ZK verifier implementation
 * 2. Use official EntryPoint contract address instead of MockEntryPoint
 */
contract DeployZkAccountFactory is ScaffoldETHDeploy {
    
    // Official EntryPoint contract addresses for different networks
    // You can update these addresses based on the latest ERC-4337 deployments
    mapping(uint256 => address) public officialEntryPoints;

    IZKVerifier public pubkeyVerifier;
    address public pubkeyProver;

    constructor(
        IZKVerifier _pubkeyVerifier,
        address _pubkeyProver
    ) {
        pubkeyVerifier = _pubkeyVerifier;
        pubkeyProver = _pubkeyProver;

        // Initialize official EntryPoint addresses
        _initializeEntryPointAddresses();
    }
    
    function run() external ScaffoldEthDeployerRunner {
        // Initialize official EntryPoint addresses
        _initializeEntryPointAddresses();
        
        // Deploy or reference EntryPoint contract
        IEntryPoint entryPoint = _getOrDeployEntryPoint();
        
        // Deploy ZK Verifier (Mock for development, real implementation for production)
        IZKVerifier zkVerifier = _deployZKVerifier();
        
        // Deploy ZkAccountFactory
        ZkAccountFactory zkAccountFactory = new ZkAccountFactory(entryPoint, zkVerifier);
        
        console.logString(string.concat("ZkAccountFactory deployed at: ", vm.toString(address(zkAccountFactory))));
        console.logString(string.concat("EntryPoint used: ", vm.toString(address(entryPoint))));
        console.logString(string.concat("ZKVerifier used: ", vm.toString(address(zkVerifier))));
        
        // Store deployments for export to frontend
        deployments.push(Deployment({ name: "ZkAccountFactory", addr: address(zkAccountFactory) }));
        deployments.push(Deployment({ name: "ZKVerifier", addr: address(zkVerifier) }));
        
        // Only store EntryPoint if we deployed it (for local development)
        if (block.chainid == 31337) {
            deployments.push(Deployment({ name: "EntryPoint", addr: address(entryPoint) }));
        }
        
        // Log deployment summary
        _logDeploymentSummary(zkAccountFactory, entryPoint, zkVerifier);
    }
    
    function _initializeEntryPointAddresses() private {
        // Official EntryPoint v0.6 addresses
        officialEntryPoints[1] = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; // Ethereum Mainnet
        officialEntryPoints[11155111] = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; // Sepolia
        officialEntryPoints[10] = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; // Optimism
        officialEntryPoints[420] = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; // Optimism Goerli
        officialEntryPoints[137] = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; // Polygon
        officialEntryPoints[80001] = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; // Polygon Mumbai
        officialEntryPoints[42161] = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; // Arbitrum One
        officialEntryPoints[421613] = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789; // Arbitrum Goerli
    }
    
    function _getOrDeployEntryPoint() private returns (IEntryPoint) {
        uint256 chainId = block.chainid;
        
        // For local development (Anvil), deploy mock EntryPoint
        if (chainId == 31337) {
            MockEntryPoint mockEntryPoint = new MockEntryPoint();
            console.logString("Deployed MockEntryPoint for local development");
            return IEntryPoint(address(mockEntryPoint));
        }
        
        // For other networks, use official EntryPoint if available
        address officialEntryPoint = officialEntryPoints[chainId];
        if (officialEntryPoint != address(0)) {
            console.logString(string.concat("Using official EntryPoint at: ", vm.toString(officialEntryPoint)));
            return IEntryPoint(officialEntryPoint);
        }
        
        // Fallback: deploy mock for unknown networks (with warning)
        console.logString("WARNING: Unknown network, deploying MockEntryPoint. Consider using official EntryPoint for production.");
        MockEntryPoint mockEntryPoint = new MockEntryPoint();
        return IEntryPoint(address(mockEntryPoint));
    }
    
    function _deployZKVerifier() private returns (IZKVerifier) {
        uint256 chainId = block.chainid;
        
        // Deploy MockZKVerifier (in production, replace with real implementation)
        MockZKVerifier mockVerifier = new MockZKVerifier();
        
        if (chainId == 31337) {
            console.logString("Deployed MockZKVerifier for local development");
            // Set some default valid proofs for testing
            _setupTestProofs(mockVerifier);
        } else {
            console.logString("WARNING: Using MockZKVerifier. Replace with real ZK verifier for production!");
        }
        
        return IZKVerifier(address(mockVerifier));
    }
    
    function _setupTestProofs(MockZKVerifier mockVerifier) private {
        // Set up some default valid proof combinations for testing
        bytes memory testProof1 = abi.encodePacked("test_proof_1");
        bytes memory testProof2 = abi.encodePacked("test_proof_2");
        bytes32 testRoot1 = keccak256(abi.encodePacked("test_root_1"));
        bytes32 testRoot2 = keccak256(abi.encodePacked("test_root_2"));
        
        mockVerifier.setProofValid(testProof1, testRoot1, true);
        mockVerifier.setProofValid(testProof2, testRoot2, true);
        
        console.logString("Set up test proof combinations for development");
    }
    
    function _logDeploymentSummary(
        ZkAccountFactory factory,
        IEntryPoint entryPoint,
        IZKVerifier zkVerifier
    ) private view {
        console.logString("\n=== ZkAccountFactory Deployment Summary ===");
        console.logString(string.concat("Network: ", vm.toString(block.chainid)));
        console.logString(string.concat("Deployer: ", vm.toString(deployer)));
        console.logString(string.concat("ZkAccountFactory: ", vm.toString(address(factory))));
        console.logString(string.concat("EntryPoint: ", vm.toString(address(entryPoint))));
        console.logString(string.concat("ZKVerifier: ", vm.toString(address(zkVerifier))));
        console.logString("\nNext steps:");
        console.logString("1. Test account creation using the factory");
        console.logString("2. Verify ZK proofs work correctly");
        console.logString("3. Integrate with frontend using exported contracts");
        
        if (block.chainid != 31337) {
            console.logString("\nProduction Notes:");
            console.logString("- Replace MockZKVerifier with real ZK implementation");
            console.logString("- Ensure EntryPoint is the official contract");
            console.logString("- Test thoroughly before mainnet deployment");
        }
    }

    function test() public {
        // Required by forge-std testing framework
    }
} 