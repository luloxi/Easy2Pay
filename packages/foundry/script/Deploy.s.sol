//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/Easy2Pay.sol";
import "../contracts/test/MockUSDC.sol";
import "../contracts/test/MockV3Aggregator.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }
        vm.startBroadcast(deployerPrivateKey);

        // Sepolia deploy

        // address ethUsdPriceFeedSepolia = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
        // MockUSDC mockUSDC = new MockUSDC();
        // Easy2Pay easy2Pay = new Easy2Pay(ethUsdPriceFeedSepolia, address(mockUSDC));

        // Foundry deploy

        // uint8 DECIMALS = 8;
        // int256 INITIAL_PRICE = 3000e8;
        // MockV3Aggregator mockPriceFeed = new MockV3Aggregator(DECIMALS, INITIAL_PRICE);
        // MockUSDC mockUSDC = new MockUSDC();
        // Easy2Pay easy2Pay = new Easy2Pay(address(mockPriceFeed), address(mockUSDC));

        // Arbitrum deploy

        address ethUsdPriceFeedArbitrum = 0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612;
        address usdcTokenAddress = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831; // USDC on Arbitrum
        Easy2Pay easy2Pay = new Easy2Pay(ethUsdPriceFeedArbitrum, usdcTokenAddress);

        console.logString(string.concat("Easy2Pay deployed at: ", vm.toString(address(easy2Pay))));
        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
    }
}
