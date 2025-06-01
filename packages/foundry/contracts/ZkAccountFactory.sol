// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ZkAccount } from "./ZkAccount.sol";
import { IEntryPoint } from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import { IZKVerifier } from "./IZKVerifier.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";

/**
 * @title ZkAccountFactory
 * @dev Factory contract for creating ZK-gated ERC-4337 smart accounts
 * Follows the ERC-4337 factory pattern with CREATE2 for deterministic addresses
 */
contract ZkAccountFactory {
    IEntryPoint public immutable entryPoint;
    IZKVerifier public immutable zkVerifier;

    error InvalidProof();

    constructor(IEntryPoint _entryPoint, IZKVerifier _zkVerifier) {
        entryPoint = _entryPoint;
        zkVerifier = _zkVerifier;
    }

    /**
     * @dev Creates a new ZkAccount using CREATE2 for deterministic addresses
     * Returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
     * @param proof The zero-knowledge proof to validate
     * @param root The public input (merkle root or other public anchor)
     * @param salt The salt for CREATE2 deployment
     * @return ret The address of the created or existing account
     */
    function createAccount(Proof calldata proof, bytes32 root, bytes32 salt) public returns (ZkAccount ret) {
        address addr = getAddress(proof, root, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return ZkAccount(payable(addr));
        }

        // Pre-validate the proof to fail early if invalid
        // This saves gas compared to failing in the constructor
        if (!zkVerifier.verify(proof, root)) {
            revert InvalidProof();
        }

        // Deploy the account using CREATE2
        // The ZkAccount constructor will re-validate the proof
        ret = new ZkAccount{ salt: salt }(entryPoint, zkVerifier, proof, root);
    }

    /**
     * @dev Creates account with auto-generated salt for convenience
     */
    function createAccountWithAutoSalt(Proof calldata proof, bytes32 root) external returns (ZkAccount) {
        bytes32 salt = keccak256(abi.encode(msg.sender, proof, root, block.timestamp));
        return createAccount(proof, root, salt);
    }

    /**
     * @dev Calculate the counterfactual address of this account as it would be returned by createAccount()
     * This enables counterfactual deployment patterns used in ERC-4337
     * @param proof The zero-knowledge proof
     * @param root The public input (merkle root or other public anchor)
     * @param salt The salt for CREATE2 deployment
     * @return The predicted address of the account
     */
    function getAddress(Proof calldata proof, bytes32 root, bytes32 salt) public view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(
                    abi.encodePacked(type(ZkAccount).creationCode, abi.encode(entryPoint, zkVerifier, proof, root))
                )
            )
        );

        return address(uint160(uint256(hash)));
    }

    /**
     * @dev Generate a deterministic salt based on owner and nonce
     * Useful for creating multiple accounts for the same user
     * @param owner The owner address
     * @param nonce A unique nonce for the owner
     * @return The generated salt
     */
    function generateSalt(address owner, uint256 nonce) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(owner, nonce));
    }
}
