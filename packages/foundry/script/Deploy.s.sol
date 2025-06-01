//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployPrivacyMarketplace } from "./DeployPrivacyMarketplace.s.sol";
import { DeployZkAccountFactory } from "./DeployZkAccountFactory.s.sol";
import { DeployPubkeyVerifier } from "./DeployPubkeyVerifier.s.sol";
import { DeployPubkeyProver } from "./DeployPubkeyProver.s.sol";

import { PubkeyProver } from "../contracts/vlayer/PubkeyProver.sol";
import { PubkeyVerifier } from "../contracts/vlayer/PubkeyVerifier.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploys all your contracts sequentially
        // Add new deployments here when needed

        // Deploy PrivacyMarketplace contract
        DeployPrivacyMarketplace deployPrivacyMarketplace = new DeployPrivacyMarketplace();
        deployPrivacyMarketplace.run();

        PubkeyProver pubkeyProver = new PubkeyProver();
        console.logString(string.concat("PubkeyProver deployed at: ", vm.toString(address(pubkeyProver))));

        deployments.push(Deployment({ name: "PubkeyProver", addr: address(pubkeyProver) }));

        PubkeyVerifier pubkeyVerifier = new PubkeyVerifier(address(pubkeyProver));

        deployments.push(Deployment({ name: "PubkeyVerifier", addr: address(pubkeyVerifier) }));

        // Deploy ZkAccountFactory contract
        DeployZkAccountFactory deployZkAccountFactory = new DeployZkAccountFactory(
            address(pubkeyVerifier)
        );
        deployZkAccountFactory.run();
    }
}
