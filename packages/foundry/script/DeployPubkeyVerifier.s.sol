//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/vlayer/PubkeyVerifier.sol";

contract DeployPubkeyVerifier is ScaffoldETHDeploy {
    address public prover;

    constructor(address _prover) {
        prover = _prover;
    }

    function run() external ScaffoldEthDeployerRunner {
        PubkeyVerifier pubkeyVerifier = new PubkeyVerifier(prover);

        console.logString(string.concat("PubkeyVerifier deployed at: ", vm.toString(address(pubkeyVerifier))));

        // Store deployment for export
        deployments.push(Deployment({ name: "PubkeyVerifier", addr: address(pubkeyVerifier) }));
    }

    function test() public { }
}