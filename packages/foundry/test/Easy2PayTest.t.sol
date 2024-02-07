// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Easy2Pay} from "../contracts/Easy2Pay.sol";

contract Easy2PayTest is Test {
    Easy2Pay easy2pay;

    function setUp() external {
        easy2pay = new Easy2Pay();
    }

    function testOwnerIsMsgSender() public {
        assertEq(easy2pay.owner(), address(this));
    }
}