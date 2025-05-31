// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/core/UserOperationLib.sol";
import "@account-abstraction/contracts/core/BaseAccount.sol";

import { IZKVerifier } from "./IZKVerifier.sol";

contract ZkAccount is BaseAccount {
    using UserOperationLib for PackedUserOperation;
    
    IEntryPoint public immutable _entryPoint;
    IZKVerifier public immutable zkVerifier;

    bytes32 public immutable verifiedRoot; // can be a merkle root or other public anchor

    constructor(
        IEntryPoint anEntryPoint,
        IZKVerifier _zkVerifier,
        bytes memory proof,
        bytes32 publicInput
    ) {

        require(_zkVerifier.verify(proof, publicInput), "Invalid proof");

        _entryPoint = anEntryPoint;
        zkVerifier = _zkVerifier;
        verifiedRoot = publicInput;
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 /* userOpHash */
    ) internal view override returns (uint256 validationData) {
        (bytes memory proof, bytes32 publicInput) = abi.decode(userOp.initCode, (bytes, bytes32));

        if (publicInput != verifiedRoot) {
            return 1; // SIG_VALIDATION_FAILED
        }

        if (!zkVerifier.verify(proof, publicInput)) {
            return 1; // SIG_VALIDATION_FAILED
        }

        return 0; // valid :) 
    }

    receive() external payable {}

}