//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/vlayer/PubkeyProver.sol";

contract DeployPubkeyProver is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        PubkeyProver pubkeyProver = new PubkeyProver();
        console.logString(string.concat("PubkeyProver deployed at: ", vm.toString(address(pubkeyProver))));

        // Store deployment for export
        deployments.push(Deployment({ name: "PubkeyProver", addr: address(pubkeyProver) }));
    }

    function test() public { }
}