// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {FeeCollector} from "../src/FeeCollector.sol";

contract FeeCollectorTest is Test {
    FeeCollector public feeCollector;
    
    address public owner = address(0x1);
    address public collector = address(0x2);
    address public recipient = address(0x3);

    function setUp() public {
        vm.startPrank(owner);
        feeCollector = new FeeCollector();
        feeCollector.authorizeCollector(collector);
        vm.stopPrank();
    }

    function test_CollectFees_Native() public {
        vm.deal(collector, 10 ether);
        vm.startPrank(collector);
        
        feeCollector.collectFees{value: 5 ether}(address(0), 5 ether);
        
        assertEq(feeCollector.getCollectedFees(address(0)), 5 ether);
        vm.stopPrank();
    }

    function test_CalculateFee() view public {
        uint256 amount = 100 ether;
        uint256 feeBps = 150; // 1.5%
        uint256 expectedFee = (amount * feeBps) / 10000;
        
        assertEq(feeCollector.calculateFee(amount, feeBps), expectedFee);
    }

    function test_WithdrawFees() public {
        vm.deal(collector, 10 ether);
        vm.startPrank(collector);
        feeCollector.collectFees{value: 10 ether}(address(0), 10 ether);
        vm.stopPrank();
        
        uint256 balanceBefore = recipient.balance;
        vm.prank(owner);
        feeCollector.withdrawFees(address(0), recipient, 5 ether);
        
        assertEq(recipient.balance, balanceBefore + 5 ether);
        assertEq(feeCollector.getCollectedFees(address(0)), 5 ether);
    }

    function test_AuthorizeCollector() public {
        address newCollector = address(0x4);
        vm.prank(owner);
        feeCollector.authorizeCollector(newCollector);
        
        assertTrue(feeCollector.authorizedCollectors(newCollector));
    }

    function test_RevokeCollector() public {
        vm.prank(owner);
        feeCollector.revokeCollector(collector);
        
        assertFalse(feeCollector.authorizedCollectors(collector));
    }
}

