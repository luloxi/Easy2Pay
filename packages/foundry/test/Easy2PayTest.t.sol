// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import {Test, console} from "forge-std/Test.sol";
// import {Easy2Pay} from "../contracts/Easy2Pay.sol";

// contract Easy2PayTest is Test {
//     Easy2Pay easy2pay;

//     address USER1 = makeAddr("1");
//     address USER2 = makeAddr("2");
//     address USER3 = makeAddr("3");
//     uint256 constant REQUEST_VALUE = 0.1 ether;
//     uint256 constant STARTING_BALANCE = 1 ether;

//     function setUp() external {
//         easy2pay = new Easy2Pay();
//         vm.deal(USER1, STARTING_BALANCE);
//         vm.deal(USER2, STARTING_BALANCE);
//         vm.deal(USER3, STARTING_BALANCE);
//     }

//     function testExactPaymentFulfill() public {
//         vm.prank(USER1);
//         easy2pay.requestPayment(uint248(REQUEST_VALUE), USER2, "Test");
//         vm.prank(USER2);
//         easy2pay.pay{value: REQUEST_VALUE}(0);
//         assertEq(address(USER1).balance, STARTING_BALANCE + REQUEST_VALUE);
//     }

//     function testRevertOnUnderPayment() public {
//         vm.prank(USER1);
//         easy2pay.requestPayment(uint248(REQUEST_VALUE), USER2, "Test");
//         vm.prank(USER2);
//         vm.expectRevert();
//         easy2pay.pay{value: REQUEST_VALUE - 1}(0);
//     }

//     function testCantPayForACompletedPayment() public {
//         vm.prank(USER1);
//         easy2pay.requestPayment(uint248(REQUEST_VALUE), USER2, "Test");
//         vm.prank(USER2);
//         easy2pay.pay{value: REQUEST_VALUE}(0);
//         vm.expectRevert();
//         easy2pay.pay{value: REQUEST_VALUE}(0);
//     }

//     function testRevertsIfNotPayer() public {
//         vm.prank(USER1);
//         easy2pay.requestPayment(uint248(REQUEST_VALUE), USER2, "Test");
//         vm.prank(USER3);
//         vm.expectRevert();
//         easy2pay.pay{value: REQUEST_VALUE}(0);
//     }

//     function testRevertsIfPayerIsMsgSender() public {
//         vm.prank(USER1);
//         vm.expectRevert();
//         easy2pay.requestPayment(uint248(REQUEST_VALUE), USER1, "Test");
//     }
// }
