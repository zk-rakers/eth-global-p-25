// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";

contract PubkeyProver is Prover {
    bytes32 public constant SALT = keccak256("ETH_PRAGUE_25");

    function splitSignature (bytes memory _signature) 
        public 
        pure 
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(_signature.length == 65, "invalid signature length");

        assembly {
            r := mload(add(_signature, 0x20))
            s := mload(add(_signature, 0x40))
            v := byte(0, mload(add(_signature, 0x60)))
        }
    }

    function recoverSigner(bytes32 _message, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_message, v, r, s);
    }

    function proofPubKey(bytes32 _message, bytes memory _signature) public returns (Proof memory, bytes32 _nullifier) 
    {
        address signer = recoverSigner(_message, _signature);
        require(signer != address(0), "invalid signature");

        _nullifier = keccak256(abi.encodePacked(signer, SALT));

        return (proof(), _nullifier);
    }
}
