// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
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

    function test_CalculateFee() public view {
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

    // ============ Additional Coverage Tests ============

    // Native Token Tests
    function test_ReceiveFunction() public {
        vm.deal(address(0x5), 10 ether);
        vm.prank(address(0x5));
        (bool success,) = address(feeCollector).call{value: 5 ether}("");
        require(success);

        assertEq(feeCollector.getCollectedFees(address(0)), 5 ether);
    }

    function test_FallbackFunction() public {
        vm.deal(address(0x5), 10 ether);
        vm.prank(address(0x5));
        (bool success,) = address(feeCollector).call{value: 3 ether}(abi.encodeWithSignature("nonExistentFunction()"));
        require(success);

        assertEq(feeCollector.getCollectedFees(address(0)), 3 ether);
    }

    // Collect Fees Edge Cases
    function test_CollectFees_ZeroAmount() public {
        vm.startPrank(collector);
        vm.expectRevert(FeeCollector.InvalidAmount.selector);
        feeCollector.collectFees{value: 0}(address(0), 0);
        vm.stopPrank();
    }

    function test_CollectFees_MsgValueMismatch() public {
        vm.deal(collector, 10 ether);
        vm.startPrank(collector);
        vm.expectRevert(FeeCollector.InvalidAmount.selector);
        feeCollector.collectFees{value: 5 ether}(address(0), 10 ether);
        vm.stopPrank();
    }

    function test_CollectFees_MultipleDeposits() public {
        vm.deal(collector, 20 ether);
        vm.startPrank(collector);

        feeCollector.collectFees{value: 5 ether}(address(0), 5 ether);
        feeCollector.collectFees{value: 10 ether}(address(0), 10 ether);

        assertEq(feeCollector.getCollectedFees(address(0)), 15 ether);
        vm.stopPrank();
    }

    // Withdraw Fees Edge Cases
    function test_WithdrawFees_MoreThanCollected() public {
        vm.deal(collector, 10 ether);
        vm.startPrank(collector);
        feeCollector.collectFees{value: 5 ether}(address(0), 5 ether);
        vm.stopPrank();

        vm.prank(owner);
        vm.expectRevert(FeeCollector.InvalidAmount.selector);
        feeCollector.withdrawFees(address(0), recipient, 10 ether);
    }

    function test_WithdrawFees_ZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(FeeCollector.InvalidAmount.selector);
        feeCollector.withdrawFees(address(0), recipient, 0);
    }

    function test_WithdrawFees_ToZeroAddress() public {
        vm.deal(collector, 10 ether);
        vm.startPrank(collector);
        feeCollector.collectFees{value: 5 ether}(address(0), 5 ether);
        vm.stopPrank();

        vm.prank(owner);
        vm.expectRevert(FeeCollector.InvalidAddress.selector);
        feeCollector.withdrawFees(address(0), address(0), 5 ether);
    }

    function test_WithdrawFees_Partial() public {
        vm.deal(collector, 20 ether);
        vm.startPrank(collector);
        feeCollector.collectFees{value: 20 ether}(address(0), 20 ether);
        vm.stopPrank();

        uint256 balanceBefore = recipient.balance;
        vm.prank(owner);
        feeCollector.withdrawFees(address(0), recipient, 8 ether);

        assertEq(recipient.balance, balanceBefore + 8 ether);
        assertEq(feeCollector.getCollectedFees(address(0)), 12 ether);
    }

    function test_WithdrawFees_Multiple() public {
        vm.deal(collector, 30 ether);
        vm.startPrank(collector);
        feeCollector.collectFees{value: 30 ether}(address(0), 30 ether);
        vm.stopPrank();

        vm.startPrank(owner);
        feeCollector.withdrawFees(address(0), recipient, 10 ether);
        feeCollector.withdrawFees(address(0), recipient, 10 ether);
        feeCollector.withdrawFees(address(0), recipient, 10 ether);
        vm.stopPrank();

        assertEq(feeCollector.getCollectedFees(address(0)), 0);
        assertEq(recipient.balance, 30 ether);
    }

    // Authorization Tests
    function test_AuthorizeCollector_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(FeeCollector.InvalidAddress.selector);
        feeCollector.authorizeCollector(address(0));
    }

    function test_RevokeCollector_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(FeeCollector.InvalidAddress.selector);
        feeCollector.revokeCollector(address(0));
    }

    function test_AuthorizeCollector_OnlyOwner() public {
        address newCollector = address(0x4);
        vm.prank(collector);
        vm.expectRevert();
        feeCollector.authorizeCollector(newCollector);
    }

    function test_RevokeCollector_OnlyOwner() public {
        vm.prank(collector);
        vm.expectRevert();
        feeCollector.revokeCollector(collector);
    }

    // Collector Access Control
    function test_CollectFees_UnauthorizedCollector() public {
        address unauthorizedCollector = address(0x5);
        vm.deal(unauthorizedCollector, 10 ether);
        vm.startPrank(unauthorizedCollector);
        vm.expectRevert(FeeCollector.UnauthorizedCollector.selector);
        feeCollector.collectFees{value: 5 ether}(address(0), 5 ether);
        vm.stopPrank();
    }

    function test_CollectFees_OwnerCanAlwaysCollect() public {
        vm.deal(owner, 10 ether);
        vm.startPrank(owner);
        feeCollector.collectFees{value: 5 ether}(address(0), 5 ether);
        vm.stopPrank();

        assertEq(feeCollector.getCollectedFees(address(0)), 5 ether);
    }

    function test_WithdrawFees_OnlyOwner() public {
        vm.deal(collector, 10 ether);
        vm.startPrank(collector);
        feeCollector.collectFees{value: 5 ether}(address(0), 5 ether);
        vm.stopPrank();

        vm.prank(collector);
        vm.expectRevert();
        feeCollector.withdrawFees(address(0), recipient, 5 ether);
    }

    // Fee Calculation Edge Cases
    function test_CalculateFee_ZeroAmount() public view {
        uint256 fee = feeCollector.calculateFee(0, 150);
        assertEq(fee, 0);
    }

    function test_CalculateFee_ZeroFeeBps() public view {
        uint256 fee = feeCollector.calculateFee(100 ether, 0);
        assertEq(fee, 0);
    }

    function test_CalculateFee_LargeAmount() public view {
        uint256 amount = 1000000 ether;
        uint256 feeBps = 150;
        uint256 expectedFee = (amount * feeBps) / 10000;
        assertEq(feeCollector.calculateFee(amount, feeBps), expectedFee);
    }

    function test_CalculateFee_MaxFeeBps() public view {
        uint256 amount = 100 ether;
        uint256 feeBps = 10000; // 100%
        uint256 expectedFee = amount;
        assertEq(feeCollector.calculateFee(amount, feeBps), expectedFee);
    }

    // Multiple Collectors
    function test_MultipleCollectors() public {
        address collector2 = address(0x6);
        address collector3 = address(0x7);

        vm.startPrank(owner);
        feeCollector.authorizeCollector(collector2);
        feeCollector.authorizeCollector(collector3);
        vm.stopPrank();

        vm.deal(collector, 10 ether);
        vm.deal(collector2, 10 ether);
        vm.deal(collector3, 10 ether);

        vm.prank(collector);
        feeCollector.collectFees{value: 5 ether}(address(0), 5 ether);

        vm.prank(collector2);
        feeCollector.collectFees{value: 3 ether}(address(0), 3 ether);

        vm.prank(collector3);
        feeCollector.collectFees{value: 2 ether}(address(0), 2 ether);

        assertEq(feeCollector.getCollectedFees(address(0)), 10 ether);
    }

    // Revoke and Re-authorize
    function test_RevokeAndReauthorize() public {
        vm.startPrank(owner);
        feeCollector.revokeCollector(collector);
        assertFalse(feeCollector.authorizedCollectors(collector));

        feeCollector.authorizeCollector(collector);
        assertTrue(feeCollector.authorizedCollectors(collector));
        vm.stopPrank();

        vm.deal(collector, 10 ether);
        vm.startPrank(collector);
        feeCollector.collectFees{value: 5 ether}(address(0), 5 ether);
        vm.stopPrank();

        assertEq(feeCollector.getCollectedFees(address(0)), 5 ether);
    }

    // Different Recipients
    function test_WithdrawFees_DifferentRecipients() public {
        address recipient2 = address(0x8);

        vm.deal(collector, 20 ether);
        vm.startPrank(collector);
        feeCollector.collectFees{value: 20 ether}(address(0), 20 ether);
        vm.stopPrank();

        uint256 recipient1BalanceBefore = recipient.balance;
        uint256 recipient2BalanceBefore = recipient2.balance;

        vm.startPrank(owner);
        feeCollector.withdrawFees(address(0), recipient, 10 ether);
        feeCollector.withdrawFees(address(0), recipient2, 10 ether);
        vm.stopPrank();

        assertEq(recipient.balance, recipient1BalanceBefore + 10 ether);
        assertEq(recipient2.balance, recipient2BalanceBefore + 10 ether);
    }
}
