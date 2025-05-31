// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

import {PubkeyProver} from "./PubkeyProver.sol";
import {ExampleNFT} from "./ExampleNFT.sol";

import {IZKVerifier} from "../IZKVerifier.sol";

contract SimpleVerifier is Verifier, IZKVerifier {
    address public prover;
    ExampleNFT public whaleNFT;


    mapping(bytes32 => bool) public nullifiers;

    constructor(address _prover, address _nft) {
        prover = _prover;
        whaleNFT = ExampleNFT(_nft);
    }

    function claimWhale(Proof calldata, address claimer, uint256 balance)
        public
        onlyVerified(prover, SimpleProver.balance.selector)
    {
        require(!claimed[claimer], "Already claimed");

        if (balance > 10_000_000) {
            claimed[claimer] = true;
            whaleNFT.mint(claimer);
        }
    }

    function verify(Proof calldata proof, bytes32 _nullifier) 
    external 
    view 
    onlyVerified(prover, PubkeyProver.proofPubKey.selector) 
    returns (bool) {
        require(proof.length == 0, "Proof must be empty");
        require(_nullifier != bytes32(0), "Nullifier must be non-zero");
        require(!nullifiers[_nullifier], "Nullifier already used");
        
        nullifiers[_nullifier] = true;
        return true;
    }
}
