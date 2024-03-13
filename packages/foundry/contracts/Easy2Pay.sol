// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

struct PayRequest {
    address requester;
    uint256 requestId;
    address payer;
    uint248 amount;
    string reason;
    bool completed;
}

contract Easy2Pay {
    address public owner;
    uint256 public requestCount;
    mapping(uint256 => PayRequest) public payRequestsById;

    event RequestCreated(
        uint256 indexed requestId,
        address indexed requester,
        address indexed payer,
        uint256 amount,
        string reason,
        uint256 creationTime
    );
    event RequestPaid(uint256 indexed requestId);

    error Easy2Pay__InvalidPayer(address payer);
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

    function setOwner(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }

    function requestPayment(uint248 _amount, address _payer, string memory _reason) public {
        if (_payer != address(0)) {
            if (_payer != msg.sender) {
                revert Easy2Pay__InvalidPayer(msg.sender);
            }
        }

        PayRequest memory newRequest = PayRequest({
            requester: msg.sender,
            requestId: requestCount,
            payer: _payer,
            amount: _amount,
            reason: _reason,
            completed: false
        });

        payRequestsById[requestCount] = newRequest;
        emit RequestCreated(requestCount, msg.sender, _payer, _amount, _reason, block.timestamp);
        requestCount++;
    }

    function pay(uint256 _requestId) public payable {
        PayRequest storage request = payRequestsById[_requestId];

        if (request.payer != address(0)) {
            if (request.payer != msg.sender) {
                revert Easy2Pay__InvalidPayer(msg.sender);
            }
        }

        if (request.amount < msg.value) {
            revert Easy2Pay__InsufficientEther(request.amount, msg.value);
        }

        if (request.completed) revert Easy2Pay__PaymentAlreadyCompleted();

        request.completed = true;

        (bool sent,) = request.requester.call{value: msg.value}("");
        if (!sent) revert Easy2Pay__FailedToSendEther();
        emit RequestPaid(_requestId);
    }

    function getRequest(uint256 requestId) public view returns (PayRequest memory) {
        require(requestId <= requestCount, "Invalid requestId");
        return payRequestsById[requestId];
    }
}
