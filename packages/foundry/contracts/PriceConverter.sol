// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Import Chainlink Aggregator Interface
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title PriceConverter
 * @dev Library to convert Ethereum (ETH) amounts to USD using Chainlink Price Feeds
 */
library PriceConverter {
    /**
     * @dev Internal function to retrieve the latest ETH/USD price from Chainlink Price Feeds
     * @return uint256 The latest ETH/USD price in 18 decimal places
     */
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Sepolia ETH / USD Address
        // Reference: https://docs.chain.link/data-feeds/price-feeds/addresses
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // ETH/USD rate in 18 decimal places
        return uint256(answer * 10000000000);
    }

    /**
     * @dev Internal function to convert a given amount of ETH to USD
     * @param ethAmount uint256 The amount of Ethereum (ETH) to convert
     * @return uint256 The converted amount in USD
     */
    function getConversionRate(
        uint256 ethAmount, AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        // Calculate the amount in USD by multiplying the ETH amount with the ETH price and adjusting for 18 decimal places
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        // Return the actual ETH/USD conversion rate
        return ethAmountInUsd;
    }
}
