//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/ZkAccount.sol";
import "../contracts/IZKVerifier.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/core/UserOperationLib.sol";

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
    function getUserOpHash(PackedUserOperation calldata) external pure returns (bytes32) {
        return bytes32(0);
    }

    function getNonce(address, uint192) external pure returns (uint256) {
        return 0;
    }

    function balanceOf(address) external pure returns (uint256) {
        return 0;
    }
}

contract ZkAccountTest is Test {
    using UserOperationLib for PackedUserOperation;

    ZkAccount public zkAccount;
    MockZKVerifier public mockVerifier;
    MockEntryPoint public mockEntryPoint;

    // Test data
    bytes public validProof = abi.encodePacked("valid_proof_data");
    bytes public invalidProof = abi.encodePacked("invalid_proof_data");
    bytes32 public validRoot = keccak256(abi.encodePacked("valid_merkle_root"));
    bytes32 public invalidRoot = keccak256(abi.encodePacked("invalid_merkle_root"));

    address public user1;
    address public user2;

    function setUp() public {
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy mock contracts
        mockVerifier = new MockZKVerifier();
        mockEntryPoint = new MockEntryPoint();

        // Set default verification to false for security
        mockVerifier.setDefaultVerifyResult(false);

        // Set up proof validations explicitly - only valid combinations should pass
        mockVerifier.setProofValid(validProof, validRoot, true);
        mockVerifier.setProofValid(invalidProof, validRoot, false);
        mockVerifier.setProofValid(validProof, invalidRoot, false);
        mockVerifier.setProofValid(invalidProof, invalidRoot, false);
    }

    function testConstructorWithValidProof() public {
        // Should successfully create account with valid proof
        zkAccount = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, validRoot);

        // Verify account was created with correct values
        assertEq(address(zkAccount.entryPoint()), address(mockEntryPoint));
        assertEq(address(zkAccount.zkVerifier()), address(mockVerifier));
        assertEq(zkAccount.verifiedRoot(), validRoot);
    }

    function testConstructorWithInvalidProof() public {
        // Should revert with invalid proof
        vm.expectRevert("Invalid proof");
        new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, invalidProof, validRoot);
    }

    function testConstructorWithInvalidRoot() public {
        // Should revert with invalid root (even with valid proof)
        vm.expectRevert("Invalid proof");
        new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, invalidRoot);
    }

    function testEntryPointGetter() public {
        zkAccount = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, validRoot);

        assertEq(address(zkAccount.entryPoint()), address(mockEntryPoint));
    }

    function testValidateUserOpSuccess() public {
        zkAccount = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, validRoot);

        // Create a user operation with valid proof and matching root in initCode
        bytes memory initCode = abi.encode(validProof, validRoot);
        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(zkAccount),
            nonce: 0,
            initCode: initCode,
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });

        // Mock the call as coming from EntryPoint
        vm.prank(address(mockEntryPoint));
        uint256 result = zkAccount.validateUserOp(userOp, bytes32(0), 0);
        assertEq(result, 0); // Should return 0 for valid validation
    }

    function testValidateUserOpFailureWrongRoot() public {
        zkAccount = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, validRoot);

        // Create a user operation with different root in initCode
        bytes memory initCode = abi.encode(validProof, invalidRoot);
        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(zkAccount),
            nonce: 0,
            initCode: initCode,
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });

        vm.prank(address(mockEntryPoint));
        uint256 result = zkAccount.validateUserOp(userOp, bytes32(0), 0);
        assertEq(result, 1); // Should return 1 for failed validation
    }

    function testValidateUserOpFailureInvalidProof() public {
        zkAccount = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, validRoot);

        // Ensure the invalid proof explicitly fails validation
        mockVerifier.setProofValid(invalidProof, validRoot, false);

        // Create a user operation with invalid proof in initCode
        bytes memory initCode = abi.encode(invalidProof, validRoot);
        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(zkAccount),
            nonce: 0,
            initCode: initCode,
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });

        vm.prank(address(mockEntryPoint));
        uint256 result = zkAccount.validateUserOp(userOp, bytes32(0), 0);
        assertEq(result, 1); // Should return 1 for failed validation
    }

    function testReceiveEther() public {
        zkAccount = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, validRoot);

        // Send ether to the account
        uint256 amount = 1 ether;
        vm.deal(user1, amount);

        vm.prank(user1);
        (bool success,) = address(zkAccount).call{ value: amount }("");

        assertTrue(success);
        assertEq(address(zkAccount).balance, amount);
    }

    function testImmutableVariables() public {
        zkAccount = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, validRoot);

        // Test that immutable variables are set correctly and cannot be changed
        assertEq(address(zkAccount.entryPoint()), address(mockEntryPoint));
        assertEq(address(zkAccount.zkVerifier()), address(mockVerifier));
        assertEq(zkAccount.verifiedRoot(), validRoot);
    }

    function testZKVerifierFailureInConstructor() public {
        // Create a new verifier that will fail for this specific proof
        MockZKVerifier failingVerifier = new MockZKVerifier();
        failingVerifier.setProofValid(validProof, validRoot, false);

        vm.expectRevert("Invalid proof");
        new ZkAccount(IEntryPoint(address(mockEntryPoint)), failingVerifier, validProof, validRoot);
    }

    function testMultipleAccountsWithDifferentRoots() public {
        bytes32 root1 = keccak256(abi.encodePacked("root1"));
        bytes32 root2 = keccak256(abi.encodePacked("root2"));

        mockVerifier.setProofValid(validProof, root1, true);
        mockVerifier.setProofValid(validProof, root2, true);

        ZkAccount account1 = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, root1);

        ZkAccount account2 = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, root2);

        assertEq(account1.verifiedRoot(), root1);
        assertEq(account2.verifiedRoot(), root2);
        assertTrue(account1.verifiedRoot() != account2.verifiedRoot());
    }

    function testFuzzValidateUserOp(bytes memory fuzzProof, bytes32 fuzzRoot) public {
        // Skip if the fuzzed values match our valid setup to avoid conflicts
        vm.assume(
            keccak256(abi.encodePacked(fuzzProof, validRoot)) != keccak256(abi.encodePacked(validProof, validRoot))
        );

        zkAccount = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, validRoot);

        // Set up the fuzzed proof as invalid
        mockVerifier.setProofValid(fuzzProof, fuzzRoot, false);

        bytes memory initCode = abi.encode(fuzzProof, fuzzRoot);
        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(zkAccount),
            nonce: 0,
            initCode: initCode,
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });

        vm.prank(address(mockEntryPoint));
        uint256 result = zkAccount.validateUserOp(userOp, bytes32(0), 0);
        assertEq(result, 1); // Should fail validation for random inputs
    }

    function testValidateUserOpOnlyFromEntryPoint() public {
        zkAccount = new ZkAccount(IEntryPoint(address(mockEntryPoint)), mockVerifier, validProof, validRoot);

        bytes memory initCode = abi.encode(validProof, validRoot);
        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(zkAccount),
            nonce: 0,
            initCode: initCode,
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });

        // Should revert when not called from entryPoint (BaseAccount requirement)
        vm.prank(user1);
        vm.expectRevert();
        zkAccount.validateUserOp(userOp, bytes32(0), 0);
    }
}
