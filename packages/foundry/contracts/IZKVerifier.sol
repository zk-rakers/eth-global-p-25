// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IZKVerifier {
    function verify(Proof calldata proof, bytes32 root) external view returns (bool);
}
