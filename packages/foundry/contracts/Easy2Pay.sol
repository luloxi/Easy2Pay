// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title A payment requesting contract
/// @author Lulox
/// @notice You can use this contract for requesting payments with a reason
/// @dev This is a base contract that requires further development to include payment in other tokens
contract Easy2Pay {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct PayRequest {
        address requester;
        uint256 requestId;
        uint256 amount;
        string reason;
        bool completed;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    AggregatorV3Interface internal ethUsdPriceFeed;
    IERC20 internal usdcToken;

    uint256 public requestCount;
    mapping(uint256 => PayRequest) public payRequestsById;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event RequestCreated(
        uint256 indexed requestId, address indexed requester, uint256 amount, string reason, uint256 creationTime
    );
    event RequestPaid(uint256 indexed requestId, address indexed payer);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error Easy2Pay__InsufficientEther(uint256 requestedAmount, uint256 actualAmount);
    error Easy2Pay__InsufficientUSDC();
    error Easy2Pay__PaymentAlreadyCompleted();
    error Easy2Pay__FailedToSendEther();

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    constructor(address _ethUsdPriceFeed, address _usdcTokenAddress) {
        ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
        usdcToken = IERC20(_usdcTokenAddress);
    }

    /**
     * @notice Request payment in USD with a reason
     * @param _amount How much USD is expected to be paid.
     * @param _reason The reason why this payment is being required
     */
    function requestPayment(uint256 _amount, string memory _reason) public {
        PayRequest memory newRequest = PayRequest({
            requester: msg.sender,
            requestId: requestCount,
            amount: _amount,
            reason: _reason,
            completed: false
        });

        payRequestsById[requestCount] = newRequest;

        emit RequestCreated(requestCount, msg.sender, _amount, _reason, block.timestamp);

        requestCount++;
    }

    /**
     * @notice Pay a previously created PayRequest by sending ETH
     * @param _requestId ID for the PayRequest being paid
     */
    function payWithEth(uint256 _requestId) public payable {
        PayRequest storage request = payRequestsById[_requestId];

        if (request.completed) revert Easy2Pay__PaymentAlreadyCompleted();

        uint256 ethPrice = getLatestEthPrice();
        uint256 ethAmount = (request.amount * 1e20) / ethPrice;

        if (msg.value < ethAmount) {
            revert Easy2Pay__InsufficientEther(ethAmount, msg.value);
        }

        request.completed = true;
        emit RequestPaid(_requestId, msg.sender);

        (bool sent,) = request.requester.call{value: msg.value}("");
        if (!sent) revert Easy2Pay__FailedToSendEther();
    }

    /**
     * @notice Pay a previously created PayRequest by sending USDC
     * @param _requestId ID for the PayRequest being paid
     */
    function payWithUsdc(uint256 _requestId) public {
        PayRequest storage request = payRequestsById[_requestId];

        if (request.completed) revert Easy2Pay__PaymentAlreadyCompleted();

        if (usdcToken.balanceOf(msg.sender) < request.amount) revert Easy2Pay__InsufficientUSDC();

        request.completed = true;
        emit RequestPaid(_requestId, msg.sender);

        usdcToken.transferFrom(msg.sender, request.requester, request.amount);
    }

    /*//////////////////////////////////////////////////////////////
                             VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice View information about a PayRequest
     * @param _requestId ID for the PayRequest being consulted
     * @return PayRequest A struct containing info about the consulted PayRequest
     */
    function getRequest(uint256 _requestId) public view returns (PayRequest memory) {
        require(_requestId <= requestCount, "Invalid requestId");
        return payRequestsById[_requestId];
    }

    /**
     * @notice View current ETH price on Chainlink Price Feeds
     * @return A uint256 with the current price of ETH with 8 digits of precision
     */
    function getLatestEthPrice() public view returns (uint256) {
        // answer is in int256 and 1e8 format
        (, int256 answer,,,) = ethUsdPriceFeed.latestRoundData();

        return uint256(answer);
    }

    /**
     * @notice View current ETH price on Chainlink Price Feeds
     * @return A uint256 with the price to pay in ETH for the request amount with 18 digits of precision
     */
    function getRequestAmountInEth(uint256 _requestId) public view returns (uint256) {
        PayRequest storage request = payRequestsById[_requestId];

        uint256 ethPrice = getLatestEthPrice();
        // request.amount (1e6) * 1e20 / ethPrice (1e8)
        // (1e6 * 1e20) / 1e8
        // 1e26 / 1e8
        // 1e18
        uint256 ethAmount = (request.amount * 1e20) / ethPrice;
        return ethAmount;
    }
}
