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
    bool completed;
}

contract EasyPay {
    address public owner;

    /** 
    @dev Mapping to store PayRequest structs mapped to a unique requestId
    */
    mapping(address receiver => PayRequest[]) public payRequests;

    // Custom errors
    error EasyPay__RequestDoesNotExist();
    error EasyPay__InsufficientEther(
        uint256 requestedAmount,
        uint256 actualAmount
    );
    error EasyPay__PaymentAlreadyCompleted();
    error EasyPay__FailedToSendEther();
    error EasyPay__UnauthorizedAccess();

    modifier onlyOwner() {
        if (msg.sender != owner) revert EasyPay__UnauthorizedAccess();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function requestPayment(uint256 _amount) public {
        uint256 id = payRequests[msg.sender].length;
        payRequests[msg.sender].push(PayRequest(_amount, false));
    }

    function getRequests(address receiver) public view returns(PayRequest[] memory) {
        return payRequests[receiver];
    }

    function pay(address receiver, uint256 _requestId) public payable {
        PayRequest storage request = payRequests[receiver][_requestId];

        if (receiver == address(0))
            revert EasyPay__RequestDoesNotExist();

        if (request.amount > msg.value)
            revert EasyPay__InsufficientEther(request.amount, msg.value);

        if (request.completed) revert EasyPay__PaymentAlreadyCompleted();

        request.completed = true;

        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use to transfer ETH.
        (bool sent, ) = receiver.call{value: msg.value}("");

        if (!sent) revert EasyPay__FailedToSendEther();
    }

    // Function in case a payment is received where msg.data must be empty
    receive() external payable {
        if (msg.sender != address(0)) revert EasyPay__FailedToSendEther();
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        if (msg.sender != address(0)) revert EasyPay__FailedToSendEther();
    }

    function setOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }
}
