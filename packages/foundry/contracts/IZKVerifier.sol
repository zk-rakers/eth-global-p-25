// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Proof} from "vlayer-0.1.0/Proof.sol";

interface IZKVerifier {
    function verify(Proof calldata proof, bytes32 _nullifier) external returns (bool);
}
