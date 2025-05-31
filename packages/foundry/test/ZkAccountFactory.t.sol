//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/ZkAccountFactory.sol";
import "../contracts/ZkAccount.sol";
import "../contracts/IZKVerifier.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

// Mock ZK Verifier for testing
contract MockZKVerifier is IZKVerifier {
    mapping(bytes32 => bool) public validProofs;
    mapping(bytes32 => bool) public proofSet;
    bool public defaultVerifyResult = true;
    
    function setProofValid(bytes memory proof, bytes32 root, bool isValid) external {
        bytes32 key = keccak256(abi.encodePacked(proof, root));
        validProofs[key] = isValid;
        proofSet[key] = true;
    }
    
    function setDefaultVerifyResult(bool result) external {
        defaultVerifyResult = result;
    }
    
    function verify(bytes calldata proof, bytes32 root) external view override returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(proof, root));
        // If this specific proof/root combination was explicitly set, use that value
        if (proofSet[key]) {
            return validProofs[key];
        }
        // Otherwise use default
        return defaultVerifyResult;
    }
}

// Simplified Mock EntryPoint for testing
contract MockEntryPoint {
    function getUserOpHash(PackedUserOperation calldata) external view returns (bytes32) { 
        return bytes32(0); 
    }
    
    function getNonce(address, uint192) external view returns (uint256) { 
        return 0; 
    }
    
    function balanceOf(address) external view returns (uint256) { 
        return 0; 
    }
}

contract ZkAccountFactoryTest is Test {
    ZkAccountFactory public factory;
    MockZKVerifier public mockVerifier;
    MockEntryPoint public mockEntryPoint;
    
    // Test data
    bytes public validProof = abi.encodePacked("valid_proof_data");
    bytes public invalidProof = abi.encodePacked("invalid_proof_data");
    bytes32 public validRoot = keccak256(abi.encodePacked("valid_merkle_root"));
    bytes32 public invalidRoot = keccak256(abi.encodePacked("invalid_merkle_root"));
    bytes32 public testSalt = keccak256(abi.encodePacked("test_salt"));
    
    address public user1;
    address public user2;

    function setUp() public {
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy mock contracts
        mockVerifier = new MockZKVerifier();
        mockEntryPoint = new MockEntryPoint();
        
        // Deploy factory
        factory = new ZkAccountFactory(
            IEntryPoint(address(mockEntryPoint)),
            mockVerifier
        );
        
        // Set default verification to false for security
        mockVerifier.setDefaultVerifyResult(false);
        
        // Set up proof validations explicitly - only valid combinations should pass
        mockVerifier.setProofValid(validProof, validRoot, true);
        mockVerifier.setProofValid(invalidProof, validRoot, false);
        mockVerifier.setProofValid(validProof, invalidRoot, false);
        mockVerifier.setProofValid(invalidProof, invalidRoot, false);
    }

    function testFactoryDeployment() public {
        // Test that factory was deployed with correct parameters
        assertEq(address(factory.entryPoint()), address(mockEntryPoint));
        assertEq(address(factory.zkVerifier()), address(mockVerifier));
    }

    function testCreateAccountSuccess() public {
        // Get the predicted address first
        address predictedAddr = factory.getAddress(validProof, validRoot, testSalt);
        
        vm.prank(user1);
        ZkAccount zkAccount = factory.createAccount(validProof, validRoot, testSalt);
        address accountAddr = address(zkAccount);
        
        // Verify the account was deployed at the predicted address
        assertEq(accountAddr, predictedAddr);
        
        // Verify the deployed account has the correct properties
        assertEq(address(zkAccount.entryPoint()), address(mockEntryPoint));
        assertEq(address(zkAccount.zkVerifier()), address(mockVerifier));
        assertEq(zkAccount.verifiedRoot(), validRoot);
        
        // Verify account has code (was actually deployed)
        assertGt(accountAddr.code.length, 0);
    }

    function testCreateAccountInvalidProof() public {
        vm.prank(user1);
        
        vm.expectRevert(ZkAccountFactory.InvalidProof.selector);
        factory.createAccount(invalidProof, validRoot, testSalt);
    }

    function testCreateAccountInvalidRoot() public {
        vm.prank(user1);
        
        vm.expectRevert(ZkAccountFactory.InvalidProof.selector);
        factory.createAccount(validProof, invalidRoot, testSalt);
    }

    function testCreateAccountAlreadyExists() public {
        vm.prank(user1);
        
        // Create account first time
        ZkAccount firstAccount = factory.createAccount(validProof, validRoot, testSalt);
        
        // Try to create same account again - should return existing account
        ZkAccount secondAccount = factory.createAccount(validProof, validRoot, testSalt);
        
        assertEq(address(firstAccount), address(secondAccount));
        assertGt(address(firstAccount).code.length, 0);
    }

    function testCreateAccountWithAutoSalt() public {
        vm.prank(user1);
        
        // Create account with auto-generated salt
        ZkAccount zkAccount = factory.createAccountWithAutoSalt(validProof, validRoot);
        address accountAddr = address(zkAccount);
        
        // Verify account was created successfully
        assertGt(accountAddr.code.length, 0); // Contract should have code
        
        // Verify the deployed account has the correct properties
        assertEq(address(zkAccount.entryPoint()), address(mockEntryPoint));
        assertEq(zkAccount.verifiedRoot(), validRoot);
    }

    function testCreateAccountWithAutoSaltMultipleCalls() public {
        vm.prank(user1);
        
        // Create multiple accounts with auto-salt - they should be different
        ZkAccount account1 = factory.createAccountWithAutoSalt(validProof, validRoot);
        
        // Wait a bit to ensure different timestamp
        vm.warp(block.timestamp + 1);
        
        ZkAccount account2 = factory.createAccountWithAutoSalt(validProof, validRoot);
        
        // Should create different accounts
        assertTrue(address(account1) != address(account2));
        assertGt(address(account1).code.length, 0);
        assertGt(address(account2).code.length, 0);
    }

    function testGetAddressPrediction() public view {
        // Test that getAddress returns deterministic addresses
        address predicted1 = factory.getAddress(validProof, validRoot, testSalt);
        address predicted2 = factory.getAddress(validProof, validRoot, testSalt);
        
        assertEq(predicted1, predicted2);
        
        // Different salt should give different address
        bytes32 differentSalt = keccak256(abi.encodePacked("different_salt"));
        address predicted3 = factory.getAddress(validProof, validRoot, differentSalt);
        
        assertTrue(predicted1 != predicted3);
    }

    function testGetAddressDifferentInputs() public view {
        bytes32 salt1 = keccak256(abi.encodePacked("salt1"));
        bytes32 salt2 = keccak256(abi.encodePacked("salt2"));
        bytes32 root2 = keccak256(abi.encodePacked("different_root"));
        bytes memory proof2 = abi.encodePacked("different_proof");
        
        address addr1 = factory.getAddress(validProof, validRoot, salt1);
        address addr2 = factory.getAddress(validProof, validRoot, salt2);
        address addr3 = factory.getAddress(validProof, root2, salt1);
        address addr4 = factory.getAddress(proof2, validRoot, salt1);
        
        // All addresses should be different
        assertTrue(addr1 != addr2);
        assertTrue(addr1 != addr3);
        assertTrue(addr1 != addr4);
        assertTrue(addr2 != addr3);
        assertTrue(addr2 != addr4);
        assertTrue(addr3 != addr4);
    }

    function testGenerateSalt() public view {
        bytes32 salt1 = factory.generateSalt(user1, 0);
        bytes32 salt2 = factory.generateSalt(user1, 1);
        bytes32 salt3 = factory.generateSalt(user2, 0);
        
        // Different nonces or users should produce different salts
        assertTrue(salt1 != salt2);
        assertTrue(salt1 != salt3);
        assertTrue(salt2 != salt3);
        
        // Same inputs should produce same salt
        bytes32 salt4 = factory.generateSalt(user1, 0);
        assertEq(salt1, salt4);
    }

    function testAccountExistsAfterDeployment() public {
        // Initially should not exist (check by code length)
        address predictedAddr = factory.getAddress(validProof, validRoot, testSalt);
        assertEq(predictedAddr.code.length, 0);
        
        vm.prank(user1);
        factory.createAccount(validProof, validRoot, testSalt);
        
        // Now should exist (has code)
        assertGt(predictedAddr.code.length, 0);
    }

    function testMultipleAccountsForSameUser() public {
        vm.prank(user1);
        
        bytes32 salt1 = factory.generateSalt(user1, 0);
        bytes32 salt2 = factory.generateSalt(user1, 1);
        
        ZkAccount account1 = factory.createAccount(validProof, validRoot, salt1);
        ZkAccount account2 = factory.createAccount(validProof, validRoot, salt2);
        
        assertTrue(address(account1) != address(account2));
        assertGt(address(account1).code.length, 0);
        assertGt(address(account2).code.length, 0);
    }

    function testZkVerifierFailurePreventsDeployment() public {
        // Create a verifier that will fail for this specific proof
        MockZKVerifier failingVerifier = new MockZKVerifier();
        failingVerifier.setDefaultVerifyResult(false);
        failingVerifier.setProofValid(validProof, validRoot, false);
        
        ZkAccountFactory failingFactory = new ZkAccountFactory(
            IEntryPoint(address(mockEntryPoint)),
            failingVerifier
        );
        
        vm.prank(user1);
        vm.expectRevert(ZkAccountFactory.InvalidProof.selector);
        failingFactory.createAccount(validProof, validRoot, testSalt);
    }

    function testFactoryWithDifferentVerifiers() public {
        // Create a second verifier with different behavior
        MockZKVerifier verifier2 = new MockZKVerifier();
        verifier2.setProofValid(validProof, validRoot, false); // Make it invalid
        
        ZkAccountFactory factory2 = new ZkAccountFactory(
            IEntryPoint(address(mockEntryPoint)),
            verifier2
        );
        
        vm.prank(user1);
        
        // Should succeed with first factory
        factory.createAccount(validProof, validRoot, testSalt);
        
        // Should fail with second factory
        vm.expectRevert(ZkAccountFactory.InvalidProof.selector);
        factory2.createAccount(validProof, validRoot, testSalt);
    }

    function testCreateAccountGasUsage() public {
        vm.prank(user1);
        
        uint256 gasBefore = gasleft();
        factory.createAccount(validProof, validRoot, testSalt);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Gas usage should be reasonable (this is a basic sanity check)
        assertLt(gasUsed, 5_000_000); // Should use less than 5M gas
        assertGt(gasUsed, 100_000);   // But more than 100k gas (deployment cost)
    }

    function testFuzzCreateAccount(bytes memory fuzzProof, bytes32 fuzzRoot, bytes32 fuzzSalt) public {
        // Assume the fuzzed inputs are different from our valid ones to avoid conflicts
        vm.assume(keccak256(abi.encodePacked(fuzzProof, fuzzRoot)) != keccak256(abi.encodePacked(validProof, validRoot)));
        
        // Set the fuzzed proof as invalid by default
        mockVerifier.setProofValid(fuzzProof, fuzzRoot, false);
        
        vm.prank(user1);
        vm.expectRevert(ZkAccountFactory.InvalidProof.selector);
        factory.createAccount(fuzzProof, fuzzRoot, fuzzSalt);
    }

    function testFuzzGetAddress(bytes memory fuzzProof, bytes32 fuzzRoot, bytes32 fuzzSalt) public view {
        // getAddress should always return a valid address, regardless of inputs
        address predicted = factory.getAddress(fuzzProof, fuzzRoot, fuzzSalt);
        
        // Address should not be zero
        assertTrue(predicted != address(0));
        
        // Calling again with same inputs should return same address
        address predicted2 = factory.getAddress(fuzzProof, fuzzRoot, fuzzSalt);
        assertEq(predicted, predicted2);
    }
} 