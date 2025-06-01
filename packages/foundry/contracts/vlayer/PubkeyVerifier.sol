// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

import {PubkeyProver} from "./PubkeyProver.sol";

import {IZKVerifier} from "../IZKVerifier.sol";

contract PubkeyVerifier is Verifier, IZKVerifier {
    address public prover;
    mapping(bytes32 => bool) public nullifiers;

    constructor(address _prover) {
        prover = _prover;
    }

    function verify(Proof calldata proof, bytes32 _nullifier) 
    external 
    onlyVerified(prover, PubkeyProver.proofPubKey.selector) 
    returns (bool) {
        require(proof.length == 0, "Proof must be empty");
        require(_nullifier != bytes32(0), "Nullifier must be non-zero");
        require(!nullifiers[_nullifier], "Nullifier already used");
        
        nullifiers[_nullifier] = true;
        return true;
    }
}
