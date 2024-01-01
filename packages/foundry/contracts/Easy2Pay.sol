// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @dev Struct to store payment requests
 * @param amount: Amount of USD requested
 * @param completed: Boolean to determine if payment was succesfully made
 */
struct PayRequest {
    uint248 amount;
    bool completed;
}

contract Easy2Pay {
    address public owner;

    /**
     * @dev Mapping to store PayRequest structs mapped to a unique requestId
     */
    mapping(address receiver => PayRequest[]) public payRequests;

    // Custom errors
    error Easy2Pay__RequestDoesNotExist();
    error Easy2Pay__InsufficientEther(uint256 requestedAmount, uint256 actualAmount);
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

    // Function in case a payment is received where msg.data must be empty
    receive() external payable {
        if (msg.sender != address(0)) revert Easy2Pay__FailedToSendEther();
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        if (msg.sender != address(0)) revert Easy2Pay__FailedToSendEther();
    }

    /**
     * @dev Currently not useful. Delegating ownership of the contract to another address, 
     * @param _newOwner: Address of new owner
     */
    function setOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    /**
     * @dev Function to start a transaction through Easy2Pay
     * @param _amount Amount of ETH requested to fulfill payment
     */
    function requestPayment(uint248 _amount) public {
        payRequests[msg.sender].push(PayRequest(_amount, false));
    }

    /**
     * @dev Function to pay a PayRequest
     * @param receiver: Address of the receiver
     * @param _requestId: ID for the PayRequest asociated to the receiver
     */
    function pay(address receiver, uint256 _requestId) public payable {
        PayRequest storage request = payRequests[receiver][_requestId];

        if (receiver == address(0)) {
            revert Easy2Pay__RequestDoesNotExist();
        }

        if (request.amount > msg.value) {
            revert Easy2Pay__InsufficientEther(request.amount, msg.value);
        }

        if (request.completed) revert Easy2Pay__PaymentAlreadyCompleted();

        request.completed = true;

        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use to transfer ETH.
        (bool sent,) = receiver.call{value: msg.value}("");

        if (!sent) revert Easy2Pay__FailedToSendEther();
    }

    /**
     * @dev Function to view a list of PayRequest asociated to an address
     * @param receiver: Address that we're looking at
     */
    function getRequests(address receiver) public view returns (PayRequest[] memory) {
        return payRequests[receiver];
    }
}
