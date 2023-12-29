// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
@dev Struct to store payment requests
@variables amount: Amount of USD requested
@variables receiver: Address of payment receiver  
@variables completed: Boolean to determine if payment was succesfully made
*/
struct PayRequest {
    uint256 amount;
    address receiver;
    bool completed;
}

contract Easy2Pay {
    address public owner;

    uint256 requests;
    /** 
    @dev Mapping to store PayRequest structs mapped to a unique requestId
    */
    mapping(uint256 requestId => PayRequest) public payRequests;

    // Custom errors
    error Easy2Pay__RequestDoesNotExist();
    error Easy2Pay__InsufficientEther(
        uint256 requestedAmount,
        uint256 actualAmount
    );
    error Easy2Pay__PaymentAlreadyCompleted();
    error Easy2Pay__FailedToSendEther();
    error Easy2Pay__UnauthorizedAccess();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Easy2Pay__UnauthorizedAccess();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function requestPayment(uint256 _amount) public {
        requests++;
        payRequests[requests] = PayRequest(_amount, msg.sender, false);
    }

    function pay(uint256 _requestId) public payable {
        PayRequest storage request = payRequests[_requestId];

        if (request.receiver == address(0))
            revert Easy2Pay__RequestDoesNotExist();

        if (request.amount > msg.value)
            revert Easy2Pay__InsufficientEther(request.amount, msg.value);

        if (request.completed) revert Easy2Pay__PaymentAlreadyCompleted();

        request.completed = true;

        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use to transfer ETH.
        (bool sent, ) = request.receiver.call{value: msg.value}("");

        if (!sent) revert Easy2Pay__FailedToSendEther();
    }

    // Function in case a payment is received where msg.data must be empty
    receive() external payable {
        if (msg.sender != address(0)) revert Easy2Pay__FailedToSendEther();
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        if (msg.sender != address(0)) revert Easy2Pay__FailedToSendEther();
    }

    function setOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }
}
