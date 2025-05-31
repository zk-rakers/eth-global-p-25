// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IZKVerifier {
    function verify(bytes calldata proof, bytes32 root) external view returns (bool);
}