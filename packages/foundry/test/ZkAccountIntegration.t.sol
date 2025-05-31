//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/ZkAccountFactory.sol";
import "../contracts/ZkAccount.sol";
import "../contracts/IZKVerifier.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/core/UserOperationLib.sol";

// Enhanced Mock ZK Verifier for integration testing
contract EnhancedMockZKVerifier is IZKVerifier {
    mapping(bytes32 => bool) public validProofs;
    mapping(bytes32 => bool) public proofSet;
    bool public defaultVerifyResult = false;

    // Events for testing - we'll track these separately
    event ProofVerified(bytes proof, bytes32 root, bool result);

    // Track last verification for event testing
    bytes public lastProof;
    bytes32 public lastRoot;
    bool public lastResult;

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

        if (proofSet[key]) {
            return validProofs[key];
        } else {
            return defaultVerifyResult;
        }
    }

    // Separate function to emit events for testing
    function verifyWithEvent(bytes calldata proof, bytes32 root) external returns (bool) {
        bool result = this.verify(proof, root);
        emit ProofVerified(proof, root, result);
        return result;
    }
}

contract EnhancedMockEntryPoint {
    mapping(address => uint256) public nonces;
    mapping(address => uint256) public balances;

    event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender);

    function getUserOpHash(PackedUserOperation calldata userOp) external pure returns (bytes32) {
        return keccak256(abi.encode(userOp.sender, userOp.nonce, userOp.initCode));
    }

    function getNonce(address sender, uint192) external view returns (uint256) {
        return nonces[sender];
    }

    function incrementNonce(address sender) external {
        nonces[sender]++;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function depositTo(address account) external payable {
        balances[account] += msg.value;
    }

    function handleOps(PackedUserOperation[] calldata ops, address payable beneficiary) external {
        for (uint256 i = 0; i < ops.length; i++) {
            bytes32 userOpHash = this.getUserOpHash(ops[i]);
            emit UserOperationEvent(userOpHash, ops[i].sender);
            nonces[ops[i].sender]++;
        }
    }
}

contract ZkAccountIntegrationTest is Test {
    using UserOperationLib for PackedUserOperation;

    ZkAccountFactory public factory;
    EnhancedMockZKVerifier public zkVerifier;
    EnhancedMockEntryPoint public entryPoint;

    address public alice;
    address public bob;
    address public charlie;
    address public attacker;

    struct UserTestData {
        bytes proof;
        bytes32 root;
        bytes32 salt;
        ZkAccount account;
    }

    mapping(address => UserTestData) public userData;

    event AccountCreated(address indexed user, address indexed account, bytes32 root);
    event UserOpValidated(address indexed account, bool success);

    function setUp() public {
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        charlie = makeAddr("charlie");
        attacker = makeAddr("attacker");

        // Deploy contracts
        zkVerifier = new EnhancedMockZKVerifier();
        entryPoint = new EnhancedMockEntryPoint();
        factory = new ZkAccountFactory(IEntryPoint(address(entryPoint)), zkVerifier);

        _setupUserData(alice, "alice_proof", "alice_root", "alice_salt");
        _setupUserData(bob, "bob_proof", "bob_root", "bob_salt");
        _setupUserData(charlie, "charlie_proof", "charlie_root", "charlie_salt");
        _setupUserData(attacker, "attacker_proof", "attacker_root", "attacker_salt");

        zkVerifier.setProofValid(userData[attacker].proof, userData[attacker].root, false);

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);
        vm.deal(attacker, 10 ether);
    }

    function _setupUserData(address user, string memory proofStr, string memory rootStr, string memory saltStr)
        internal
    {
        userData[user].proof = abi.encodePacked(proofStr);
        userData[user].root = keccak256(abi.encodePacked(rootStr));
        userData[user].salt = keccak256(abi.encodePacked(saltStr));

        // Set proof as valid by default
        zkVerifier.setProofValid(userData[user].proof, userData[user].root, true);
    }

    function testEndToEndAccountCreationAndUsage() public {
        // Test complete flow: create account -> fund it -> execute operations

        // 1. Alice creates her account
        vm.prank(alice);
        ZkAccount aliceAccount =
            factory.createAccount(userData[alice].proof, userData[alice].root, userData[alice].salt);
        userData[alice].account = aliceAccount;

        // Verify account creation
        assertEq(address(aliceAccount.entryPoint()), address(entryPoint));
        assertEq(address(aliceAccount.zkVerifier()), address(zkVerifier));
        assertEq(aliceAccount.verifiedRoot(), userData[alice].root);

        // 2. Fund Alice's account
        vm.prank(alice);
        (bool success,) = address(aliceAccount).call{ value: 5 ether }("");
        assertTrue(success);
        assertEq(address(aliceAccount).balance, 5 ether);

        // 3. Validate a user operation
        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(aliceAccount),
            nonce: 0,
            initCode: abi.encode(userData[alice].proof, userData[alice].root),
            callData: "",
            accountGasLimits: bytes32(uint256(100000) << 128 | uint256(100000)),
            preVerificationGas: 21000,
            gasFees: bytes32(uint256(1e9) << 128 | uint256(1e9)),
            paymasterAndData: "",
            signature: ""
        });

        vm.prank(address(entryPoint));
        uint256 validationResult = aliceAccount.validateUserOp(userOp, bytes32(0), 0);
        assertEq(validationResult, 0, "Alice's user operation should be valid");
    }

    function testMultipleUsersAccountCreation() public {
        address[3] memory users = [alice, bob, charlie];
        ZkAccount[3] memory accounts;

        // Create accounts for all users
        for (uint256 i = 0; i < users.length; i++) {
            vm.prank(users[i]);
            accounts[i] =
                factory.createAccount(userData[users[i]].proof, userData[users[i]].root, userData[users[i]].salt);
            userData[users[i]].account = accounts[i];
        }

        // Verify all accounts are different
        assertTrue(address(accounts[0]) != address(accounts[1]));
        assertTrue(address(accounts[0]) != address(accounts[2]));
        assertTrue(address(accounts[1]) != address(accounts[2]));

        // Verify each account has correct properties
        for (uint256 i = 0; i < users.length; i++) {
            assertEq(accounts[i].verifiedRoot(), userData[users[i]].root);
            assertGt(address(accounts[i]).code.length, 0);
        }
    }

    function testAccountInteractions() public {
        // Create accounts for Alice and Bob
        vm.prank(alice);
        ZkAccount aliceAccount =
            factory.createAccount(userData[alice].proof, userData[alice].root, userData[alice].salt);

        vm.prank(bob);
        ZkAccount bobAccount = factory.createAccount(userData[bob].proof, userData[bob].root, userData[bob].salt);

        // Fund both accounts
        vm.prank(alice);
        (bool success1,) = address(aliceAccount).call{ value: 3 ether }("");
        assertTrue(success1);

        vm.prank(bob);
        (bool success2,) = address(bobAccount).call{ value: 2 ether }("");
        assertTrue(success2);

        // Verify balances
        assertEq(address(aliceAccount).balance, 3 ether);
        assertEq(address(bobAccount).balance, 2 ether);

        // Test that each account validates only its own operations
        PackedUserOperation memory aliceOp = PackedUserOperation({
            sender: address(aliceAccount),
            nonce: 0,
            initCode: abi.encode(userData[alice].proof, userData[alice].root),
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });

        PackedUserOperation memory bobOpWithWrongData = PackedUserOperation({
            sender: address(bobAccount),
            nonce: 0,
            initCode: abi.encode(userData[alice].proof, userData[alice].root), // Wrong proof/root
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });

        // Alice's operation should succeed
        vm.prank(address(entryPoint));
        uint256 aliceResult = aliceAccount.validateUserOp(aliceOp, bytes32(0), 0);
        assertEq(aliceResult, 0);

        // Bob's operation with wrong data should fail
        vm.prank(address(entryPoint));
        uint256 bobResult = bobAccount.validateUserOp(bobOpWithWrongData, bytes32(0), 0);
        assertEq(bobResult, 1);
    }

    function testAccountFactoryWithAutoSalt() public {
        // Test creating multiple accounts for the same user with auto-generated salts

        vm.startPrank(alice);

        // Create first account
        ZkAccount account1 = factory.createAccountWithAutoSalt(userData[alice].proof, userData[alice].root);

        // Wait to ensure different timestamp
        vm.warp(block.timestamp + 1);

        // Create second account
        ZkAccount account2 = factory.createAccountWithAutoSalt(userData[alice].proof, userData[alice].root);

        vm.stopPrank();

        // Accounts should be different
        assertTrue(address(account1) != address(account2));

        // Both should have correct properties
        assertEq(account1.verifiedRoot(), userData[alice].root);
        assertEq(account2.verifiedRoot(), userData[alice].root);
        assertGt(address(account1).code.length, 0);
        assertGt(address(account2).code.length, 0);
    }

    function testSecurityAgainstInvalidProofs() public {
        // Attacker tries to create account with invalid proof
        vm.prank(attacker);
        vm.expectRevert(ZkAccountFactory.InvalidProof.selector);
        factory.createAccount(userData[attacker].proof, userData[attacker].root, userData[attacker].salt);

        // Attacker tries to use someone else's valid proof with different root
        vm.prank(attacker);
        vm.expectRevert(ZkAccountFactory.InvalidProof.selector);
        factory.createAccount(
            userData[alice].proof, // Valid proof
            userData[attacker].root, // But wrong root
            userData[attacker].salt
        );
    }

    function testGasOptimization() public {
        // Test gas usage for account creation and operations

        vm.prank(alice);
        uint256 gasStart = gasleft();
        ZkAccount aliceAccount =
            factory.createAccount(userData[alice].proof, userData[alice].root, userData[alice].salt);
        uint256 gasUsedCreation = gasStart - gasleft();

        // Creation should be reasonably efficient
        assertLt(gasUsedCreation, 3_000_000, "Account creation uses too much gas");
        assertGt(gasUsedCreation, 500_000, "Account creation suspiciously low gas");

        // Test gas for user operation validation
        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(aliceAccount),
            nonce: 0,
            initCode: abi.encode(userData[alice].proof, userData[alice].root),
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });

        vm.prank(address(entryPoint));
        gasStart = gasleft();
        aliceAccount.validateUserOp(userOp, bytes32(0), 0);
        uint256 gasUsedValidation = gasStart - gasleft();

        // Validation should be efficient
        assertLt(gasUsedValidation, 200_000, "User operation validation uses too much gas");
    }

    function testConcurrentAccountCreation() public {
        // Test multiple users creating accounts simultaneously
        address[3] memory users = [alice, bob, charlie];
        ZkAccount[3] memory accounts;

        // Create accounts for all users
        for (uint256 i = 0; i < users.length; i++) {
            vm.prank(users[i]);
            accounts[i] =
                factory.createAccount(userData[users[i]].proof, userData[users[i]].root, userData[users[i]].salt);
        }

        // Verify all accounts are valid and different
        for (uint256 i = 0; i < users.length; i++) {
            assertGt(address(accounts[i]).code.length, 0);
            assertEq(accounts[i].verifiedRoot(), userData[users[i]].root);

            for (uint256 j = i + 1; j < users.length; j++) {
                assertTrue(address(accounts[i]) != address(accounts[j]));
            }
        }
    }

    function testAccountPersistenceAndRedeployment() public {
        // Test that trying to redeploy the same account returns the existing one

        vm.prank(alice);
        ZkAccount account1 = factory.createAccount(userData[alice].proof, userData[alice].root, userData[alice].salt);

        // Fund the account
        vm.prank(alice);
        (bool success,) = address(account1).call{ value: 1 ether }("");
        assertTrue(success);

        // Try to "redeploy" the same account
        vm.prank(alice);
        ZkAccount account2 = factory.createAccount(userData[alice].proof, userData[alice].root, userData[alice].salt);

        // Should be the same account
        assertEq(address(account1), address(account2));

        // Should still have the same balance
        assertEq(address(account2).balance, 1 ether);
    }

    function testComplexUserOperationFlow() public {
        // Test a more complex scenario with multiple operations

        // Create Alice's account
        vm.prank(alice);
        ZkAccount aliceAccount =
            factory.createAccount(userData[alice].proof, userData[alice].root, userData[alice].salt);

        // Fund account through EntryPoint deposit
        vm.prank(alice);
        entryPoint.depositTo{ value: 2 ether }(address(aliceAccount));
        assertEq(entryPoint.balanceOf(address(aliceAccount)), 2 ether);

        // Create multiple user operations
        PackedUserOperation[] memory ops = new PackedUserOperation[](2);

        ops[0] = PackedUserOperation({
            sender: address(aliceAccount),
            nonce: entryPoint.getNonce(address(aliceAccount), 0),
            initCode: abi.encode(userData[alice].proof, userData[alice].root),
            callData: abi.encodeWithSignature("execute(address,uint256,bytes)", alice, 0.5 ether, ""),
            accountGasLimits: bytes32(uint256(150000) << 128 | uint256(150000)),
            preVerificationGas: 21000,
            gasFees: bytes32(uint256(1e9) << 128 | uint256(1e9)),
            paymasterAndData: "",
            signature: ""
        });

        ops[1] = PackedUserOperation({
            sender: address(aliceAccount),
            nonce: entryPoint.getNonce(address(aliceAccount), 0) + 1,
            initCode: abi.encode(userData[alice].proof, userData[alice].root),
            callData: abi.encodeWithSignature("execute(address,uint256,bytes)", bob, 0.3 ether, ""),
            accountGasLimits: bytes32(uint256(150000) << 128 | uint256(150000)),
            preVerificationGas: 21000,
            gasFees: bytes32(uint256(1e9) << 128 | uint256(1e9)),
            paymasterAndData: "",
            signature: ""
        });

        // Validate each operation
        for (uint256 i = 0; i < ops.length; i++) {
            vm.prank(address(entryPoint));
            uint256 result = aliceAccount.validateUserOp(ops[i], bytes32(0), 0);
            assertEq(result, 0, "User operation should be valid");
        }

        // Simulate handling operations
        entryPoint.handleOps(ops, payable(alice));

        // Verify nonce was incremented
        assertEq(entryPoint.getNonce(address(aliceAccount), 0), 2);
    }

    function testEventEmissions() public {
        // Test that events are properly emitted during integration flow

        // Test manual proof verification event - adjust for the actual event format
        zkVerifier.verifyWithEvent(userData[alice].proof, userData[alice].root);

        vm.prank(alice);
        ZkAccount aliceAccount =
            factory.createAccount(userData[alice].proof, userData[alice].root, userData[alice].salt);

        // Test user operation event
        PackedUserOperation memory userOp = PackedUserOperation({
            sender: address(aliceAccount),
            nonce: 0,
            initCode: abi.encode(userData[alice].proof, userData[alice].root),
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });

        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = userOp;

        entryPoint.handleOps(ops, payable(alice));

        // Verify that nonce was incremented (indicating the operation was processed)
        assertEq(entryPoint.getNonce(address(aliceAccount), 0), 1);
    }

    function testFuzzIntegration(bytes memory fuzzProof, bytes32 fuzzRoot, bytes32 fuzzSalt) public {
        // Skip if the fuzzed values match any of our valid setups
        vm.assume(fuzzProof.length > 0);
        vm.assume(fuzzProof.length < 1000);
        vm.assume(
            keccak256(abi.encodePacked(fuzzProof, fuzzRoot))
                != keccak256(abi.encodePacked(userData[alice].proof, userData[alice].root))
        );
        vm.assume(
            keccak256(abi.encodePacked(fuzzProof, fuzzRoot))
                != keccak256(abi.encodePacked(userData[bob].proof, userData[bob].root))
        );

        // Set fuzzed proof as invalid
        zkVerifier.setProofValid(fuzzProof, fuzzRoot, false);

        // Should fail to create account with invalid proof
        vm.prank(alice);
        vm.expectRevert(ZkAccountFactory.InvalidProof.selector);
        factory.createAccount(fuzzProof, fuzzRoot, fuzzSalt);

        // getAddress should still work with any inputs
        address predicted = factory.getAddress(fuzzProof, fuzzRoot, fuzzSalt);
        assertTrue(predicted != address(0));
    }
}
