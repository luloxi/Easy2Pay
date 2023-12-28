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

contract EasyPay {
    uint256 requests;
    /** 
    @dev Mapping to store PayRequest structs mapped to a unique requestId
    */
    mapping(uint256 requestId => PayRequest) public payRequests;

    function requestPayment(uint256 _amount) public {
        requests++;
        payRequests[requests] = PayRequest(_amount, msg.sender, false);
    }

    function pay(uint256 _requestId) public payable {
        require(payRequests[_requestId].receiver != address(0), "Request doesn't exist or was made by a dumb human!" );
        require(payRequests[_requestId].amount <= msg.value, "Ether sent must be equal or greater than requested amount!");
        require(payRequests[_requestId].completed == false, "Request has already been paid!");
        payRequests[_requestId].completed = true;
        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use to transfer ETH.
        (bool sent, ) = payRequests[_requestId].receiver.call{value: msg.value}("");
        require(sent, "Failed to send Ether, try again next block!");
    }

    // Function in case a payment is received where msg.data must be empty
    receive() external payable {
        require(msg.sender == address(0), "Are you stupid or what? Take care of your ETH!");
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        require(msg.sender == address(0), "Are you stupid or what? Take care of your ETH!");
    }
}