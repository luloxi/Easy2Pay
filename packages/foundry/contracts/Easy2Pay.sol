// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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
        address payer;
        uint248 amount;
        string reason;
        bool completed;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    uint256 public requestCount;

    mapping(uint256 => PayRequest) public payRequestsById;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event RequestCreated(
        uint256 indexed requestId,
        address indexed requester,
        address indexed payer,
        uint256 amount,
        string reason,
        uint256 creationTime
    );
    event RequestPaid(uint256 indexed requestId);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error Easy2Pay__InvalidRequest(address requester);
    error Easy2Pay__InvalidPayer(address payer);
    error Easy2Pay__InsufficientEther(
        uint256 requestedAmount,
        uint256 actualAmount
    );
    error Easy2Pay__PaymentAlreadyCompleted();
    error Easy2Pay__FailedToSendEther();
    error Easy2Pay__UnauthorizedAccess();

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /** @notice Request payment in ETH to a specific address with a reason
     * @param _amount How much ETH is the payer expected to pay.
     * @param _payer Who is expected to fulfill this payment
     * @param _reason The reason why this payment is being required
     */
    function requestPayment(
        uint248 _amount,
        address _payer,
        string memory _reason
    ) public {
        if (_payer == msg.sender) {
            revert Easy2Pay__InvalidRequest(msg.sender);
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

        emit RequestCreated(
            requestCount,
            msg.sender,
            _payer,
            _amount,
            _reason,
            block.timestamp
        );

        requestCount++;
    }

    /** @notice Pay a previously created PayRequest by sending ETH
     * @param _requestId ID for the PayRequest being paid
     */
    function pay(uint256 _requestId) public payable {
        PayRequest storage request = payRequestsById[_requestId];

        if (request.payer != address(0)) {
            if (request.payer != msg.sender) {
                revert Easy2Pay__InvalidPayer(msg.sender);
            }
        }

        if (request.amount > msg.value) {
            revert Easy2Pay__InsufficientEther(request.amount, msg.value);
        }

        if (request.completed) revert Easy2Pay__PaymentAlreadyCompleted();

        request.completed = true;

        (bool sent, ) = request.requester.call{value: msg.value}("");
        if (!sent) revert Easy2Pay__FailedToSendEther();
        emit RequestPaid(_requestId);
    }

    /*//////////////////////////////////////////////////////////////
                             VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /** @notice View information about a PayRequest
     * @param _requestId ID for the PayRequest being consulted
     * @return PayRequest A struct containing info about the consulted PayRequest
     */
    function getRequest(
        uint256 _requestId
    ) public view returns (PayRequest memory) {
        require(_requestId <= requestCount, "Invalid requestId");
        return payRequestsById[_requestId];
    }
}
