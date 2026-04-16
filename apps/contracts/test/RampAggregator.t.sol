// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {RampAggregator} from "../src/RampAggregator.sol";
import {FeeCollector} from "../src/FeeCollector.sol";

contract RampAggregatorTest is Test {
    RampAggregator public rampAggregator;
    FeeCollector public feeCollector;

    address public owner = address(0x1);
    address public backendSigner = address(0x2);
    address public user = address(0x3);
    address public feeCollectorAddress = address(0x4);

    event OnRampCompleted(address indexed user, uint256 amount, string provider, string txReference);
    event OffRampInitiated(address indexed user, uint256 amount, bytes32 indexed requestId, string provider);
    event OffRampCompleted(address indexed user, bytes32 indexed requestId, uint256 amount);
    event OffRampCancelled(address indexed user, bytes32 indexed requestId, uint256 amount);
    event ProviderUpdated(string provider, bool isActive, uint256 minAmount, uint256 maxAmount, uint256 feeBps);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy FeeCollector
        feeCollector = new FeeCollector();
        feeCollectorAddress = address(feeCollector);

        // Deploy RampAggregator
        rampAggregator = new RampAggregator(backendSigner, feeCollectorAddress);

        // Configure a test provider
        rampAggregator.setProviderConfig(
            "yellowcard",
            true,
            1 ether, // minAmount
            1000 ether, // maxAmount
            100 // 1% fee
        );

        vm.stopPrank();

        // Give user some ETH
        vm.deal(user, 100 ether);
    }

    function test_InitialState() public view {
        assertEq(rampAggregator.owner(), owner);
        assertEq(rampAggregator.feeCollector(), feeCollectorAddress);
        assertEq(rampAggregator.feeBps(), 150); // Default 1.5%
        assertTrue(rampAggregator.isProviderActive("yellowcard"));
    }

    function test_RecordOnRamp() public {
        vm.prank(backendSigner);
        uint256 amount = 10 ether;

        vm.expectEmit(true, false, false, true);
        emit OnRampCompleted(user, amount, "yellowcard", "tx_ref_123");

        rampAggregator.recordOnRamp(user, amount, "yellowcard", "tx_ref_123");

        assertEq(rampAggregator.getUserBalance(user), amount);
    }

    function test_RecordOnRamp_OnlyBackendSigner() public {
        vm.prank(user);
        vm.expectRevert(RampAggregator.InvalidSigner.selector);
        rampAggregator.recordOnRamp(user, 10 ether, "yellowcard", "tx_ref_123");
    }

    function test_RecordOnRamp_InvalidProvider() public {
        vm.prank(backendSigner);
        vm.expectRevert(RampAggregator.ProviderNotActive.selector);
        rampAggregator.recordOnRamp(user, 10 ether, "invalid_provider", "tx_ref_123");
    }

    function test_InitiateOffRamp() public {
        vm.startPrank(user);
        uint256 amount = 5 ether;

        bytes32 requestId = rampAggregator.initiateOffRamp{value: amount}(
            amount,
            "yellowcard",
            "NGN",
            1000000 // 1M NGN
        );

        vm.stopPrank();

        assertNotEq(requestId, bytes32(0));

        RampAggregator.OffRampRequest memory request = rampAggregator.getOffRampRequest(requestId);
        assertEq(request.user, user);
        assertEq(request.amount, amount);
        assertEq(request.provider, "yellowcard");
        assertEq(request.fiatCurrency, "NGN");
        assertFalse(request.completed);
        assertFalse(request.cancelled);

        // Verify fee was sent to fee collector
        assertGt(address(feeCollector).balance, 0);
    }

    function test_InitiateOffRamp_BelowMinimum() public {
        vm.startPrank(user);
        vm.expectRevert(RampAggregator.InvalidAmount.selector);
        rampAggregator.initiateOffRamp{value: 0.5 ether}(0.5 ether, "yellowcard", "NGN", 100000);
        vm.stopPrank();
    }

    function test_InitiateOffRamp_AboveMaximum() public {
        vm.deal(user, 2000 ether);
        vm.startPrank(user);
        vm.expectRevert(RampAggregator.InvalidAmount.selector);
        rampAggregator.initiateOffRamp{value: 2000 ether}(2000 ether, "yellowcard", "NGN", 40000000);
        vm.stopPrank();
    }

    function test_CompleteOffRamp() public {
        vm.startPrank(user);
        uint256 amount = 5 ether;
        bytes32 requestId = rampAggregator.initiateOffRamp{value: amount}(amount, "yellowcard", "NGN", 1000000);
        vm.stopPrank();

        vm.prank(backendSigner);
        vm.expectEmit(true, true, false, true);
        emit OffRampCompleted(user, requestId, amount);

        rampAggregator.completeOffRamp(requestId);

        RampAggregator.OffRampRequest memory request = rampAggregator.getOffRampRequest(requestId);
        assertTrue(request.completed);
    }

    function test_CancelOffRamp() public {
        vm.startPrank(user);
        uint256 amount = 5 ether;
        bytes32 requestId = rampAggregator.initiateOffRamp{value: amount}(amount, "yellowcard", "NGN", 1000000);

        uint256 balanceBefore = user.balance;
        rampAggregator.cancelOffRamp(requestId);
        vm.stopPrank();

        RampAggregator.OffRampRequest memory request = rampAggregator.getOffRampRequest(requestId);
        assertTrue(request.cancelled);
        // User should receive refund (minus fee that was sent to fee collector)
        assertGt(user.balance, balanceBefore);
    }

    function test_CancelOffRamp_ByBackend() public {
        vm.startPrank(user);
        uint256 amount = 5 ether;
        bytes32 requestId = rampAggregator.initiateOffRamp{value: amount}(amount, "yellowcard", "NGN", 1000000);
        vm.stopPrank();

        uint256 balanceBefore = user.balance;
        vm.prank(backendSigner);
        rampAggregator.cancelOffRamp(requestId);

        RampAggregator.OffRampRequest memory request = rampAggregator.getOffRampRequest(requestId);
        assertTrue(request.cancelled);
        // User should receive refund (minus fee that was sent to fee collector)
        assertGt(user.balance, balanceBefore);
    }

    function test_CalculateFee() public view {
        uint256 amount = 100 ether;
        uint256 expectedFee = (amount * 150) / 10000; // 1.5%
        assertEq(rampAggregator.calculateFee(amount), expectedFee);
    }

    function test_SetFee() public {
        vm.prank(owner);
        rampAggregator.setFee(200); // 2%
        assertEq(rampAggregator.feeBps(), 200);
    }

    function test_SetFee_OnlyOwner() public {
        vm.prank(user);
        vm.expectRevert();
        rampAggregator.setFee(200);
    }

    function test_SetFee_ExceedsMax() public {
        vm.prank(owner);
        vm.expectRevert(RampAggregator.InvalidFee.selector);
        rampAggregator.setFee(1001); // > 10%
    }

    function test_SetProviderConfig() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit ProviderUpdated("cashramp", true, 0.1 ether, 500 ether, 150);

        rampAggregator.setProviderConfig("cashramp", true, 0.1 ether, 500 ether, 150);

        assertTrue(rampAggregator.isProviderActive("cashramp"));
    }

    function test_PauseUnpause() public {
        vm.prank(owner);
        rampAggregator.pause();

        vm.prank(backendSigner);
        vm.expectRevert();
        rampAggregator.recordOnRamp(user, 10 ether, "yellowcard", "tx_ref");

        vm.prank(owner);
        rampAggregator.unpause();

        vm.prank(backendSigner);
        rampAggregator.recordOnRamp(user, 10 ether, "yellowcard", "tx_ref");
    }

    function test_EmergencyWithdraw() public {
        // Send some ETH to contract
        vm.deal(address(rampAggregator), 10 ether);

        uint256 balanceBefore = owner.balance;
        vm.prank(owner);
        rampAggregator.emergencyWithdraw(address(0), 10 ether);

        assertEq(owner.balance, balanceBefore + 10 ether);
    }

    function test_SetBackendSigner() public {
        address newSigner = address(0x5);
        vm.prank(owner);
        rampAggregator.setBackendSigner(newSigner);

        assertEq(rampAggregator.backendSigner(), newSigner);
    }

    function test_SetFeeCollector() public {
        FeeCollector newCollector = new FeeCollector();
        vm.prank(owner);
        rampAggregator.setFeeCollector(address(newCollector));

        assertEq(rampAggregator.feeCollector(), address(newCollector));
    }

    // ============ Additional Coverage Tests ============

    // State Transition Tests
    function test_CompleteOffRamp_AlreadyCompleted() public {
        vm.startPrank(user);
        bytes32 requestId = rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);
        vm.stopPrank();

        vm.prank(backendSigner);
        rampAggregator.completeOffRamp(requestId);

        // Try to complete again
        vm.prank(backendSigner);
        vm.expectRevert(RampAggregator.RequestAlreadyCompleted.selector);
        rampAggregator.completeOffRamp(requestId);
    }

    function test_CancelOffRamp_AlreadyCancelled() public {
        vm.startPrank(user);
        bytes32 requestId = rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);
        rampAggregator.cancelOffRamp(requestId);
        vm.stopPrank();

        // Try to cancel again
        vm.prank(user);
        vm.expectRevert(RampAggregator.RequestAlreadyCancelled.selector);
        rampAggregator.cancelOffRamp(requestId);
    }

    function test_CompleteOffRamp_AfterCancelled() public {
        vm.startPrank(user);
        bytes32 requestId = rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);
        rampAggregator.cancelOffRamp(requestId);
        vm.stopPrank();

        // Try to complete cancelled request
        vm.prank(backendSigner);
        vm.expectRevert(RampAggregator.RequestAlreadyCancelled.selector);
        rampAggregator.completeOffRamp(requestId);
    }

    function test_CancelOffRamp_AfterCompleted() public {
        vm.startPrank(user);
        bytes32 requestId = rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);
        vm.stopPrank();

        vm.prank(backendSigner);
        rampAggregator.completeOffRamp(requestId);

        // Try to cancel completed request
        vm.prank(user);
        vm.expectRevert(RampAggregator.RequestAlreadyCompleted.selector);
        rampAggregator.cancelOffRamp(requestId);
    }

    // Boundary Condition Tests
    function test_InitiateOffRamp_ExactlyAtMinimum() public {
        vm.startPrank(user);
        bytes32 requestId = rampAggregator.initiateOffRamp{value: 1 ether}(1 ether, "yellowcard", "NGN", 200000);
        vm.stopPrank();

        assertNotEq(requestId, bytes32(0));
    }

    function test_InitiateOffRamp_ExactlyAtMaximum() public {
        vm.deal(user, 1500 ether);
        vm.startPrank(user);
        bytes32 requestId =
            rampAggregator.initiateOffRamp{value: 1000 ether}(1000 ether, "yellowcard", "NGN", 200000000);
        vm.stopPrank();

        assertNotEq(requestId, bytes32(0));
    }

    function test_SetFee_AtMaximum() public {
        vm.prank(owner);
        rampAggregator.setFee(1000); // Exactly 10%
        assertEq(rampAggregator.feeBps(), 1000);
    }

    function test_SetFee_Zero() public {
        vm.prank(owner);
        rampAggregator.setFee(0);
        assertEq(rampAggregator.feeBps(), 0);
    }

    // Fee Calculation Edge Cases
    function test_CalculateFee_ZeroAmount() public view {
        uint256 fee = rampAggregator.calculateFee(0);
        assertEq(fee, 0);
    }

    function test_CalculateFee_LargeAmount() public view {
        uint256 amount = 1000000 ether;
        uint256 expectedFee = (amount * 150) / 10000;
        assertEq(rampAggregator.calculateFee(amount), expectedFee);
    }

    // Access Control Tests
    function test_SetProviderConfig_OnlyOwner() public {
        vm.prank(user);
        vm.expectRevert();
        rampAggregator.setProviderConfig("newprovider", true, 1 ether, 100 ether, 100);
    }

    function test_EmergencyWithdraw_OnlyOwner() public {
        vm.deal(address(rampAggregator), 10 ether);
        vm.prank(user);
        vm.expectRevert();
        rampAggregator.emergencyWithdraw(address(0), 10 ether);
    }

    function test_SetBackendSigner_OnlyOwner() public {
        vm.prank(user);
        vm.expectRevert();
        rampAggregator.setBackendSigner(address(0x5));
    }

    function test_SetFeeCollector_OnlyOwner() public {
        vm.prank(user);
        vm.expectRevert();
        rampAggregator.setFeeCollector(address(0x5));
    }

    // Pause Functionality Tests
    function test_InitiateOffRamp_WhenPaused() public {
        vm.prank(owner);
        rampAggregator.pause();

        vm.startPrank(user);
        vm.expectRevert();
        rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);
        vm.stopPrank();
    }

    function test_CompleteOffRamp_WhenPaused() public {
        vm.startPrank(user);
        bytes32 requestId = rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);
        vm.stopPrank();

        vm.prank(owner);
        rampAggregator.pause();

        vm.prank(backendSigner);
        vm.expectRevert();
        rampAggregator.completeOffRamp(requestId);
    }

    function test_CancelOffRamp_WhenPaused() public {
        vm.startPrank(user);
        bytes32 requestId = rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);
        vm.stopPrank();

        vm.prank(owner);
        rampAggregator.pause();

        vm.prank(user);
        vm.expectRevert();
        rampAggregator.cancelOffRamp(requestId);
    }

    // Invalid Address Tests
    function test_RecordOnRamp_InvalidUser() public {
        vm.prank(backendSigner);
        vm.expectRevert(RampAggregator.InvalidAddress.selector);
        rampAggregator.recordOnRamp(address(0), 10 ether, "yellowcard", "tx_ref");
    }

    function test_SetBackendSigner_InvalidAddress() public {
        vm.prank(owner);
        vm.expectRevert(RampAggregator.InvalidAddress.selector);
        rampAggregator.setBackendSigner(address(0));
    }

    function test_SetFeeCollector_InvalidAddress() public {
        vm.prank(owner);
        vm.expectRevert(RampAggregator.InvalidAddress.selector);
        rampAggregator.setFeeCollector(address(0));
    }

    // Provider Configuration Tests
    function test_UpdateProviderConfig() public {
        vm.prank(owner);
        rampAggregator.setProviderConfig("yellowcard", true, 2 ether, 500 ether, 200);

        (bool isActive, uint256 minAmount, uint256 maxAmount, uint256 feeBps) = rampAggregator.providers("yellowcard");
        assertEq(minAmount, 2 ether);
        assertEq(maxAmount, 500 ether);
        assertEq(feeBps, 200);
        assertTrue(isActive);
    }

    function test_DeactivateProvider() public {
        vm.prank(owner);
        rampAggregator.setProviderConfig("yellowcard", false, 1 ether, 1000 ether, 100);

        assertFalse(rampAggregator.isProviderActive("yellowcard"));
    }

    function test_InitiateOffRamp_InactiveProvider() public {
        vm.prank(owner);
        rampAggregator.setProviderConfig("yellowcard", false, 1 ether, 1000 ether, 100);

        vm.startPrank(user);
        vm.expectRevert(RampAggregator.ProviderNotActive.selector);
        rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);
        vm.stopPrank();
    }

    // Multiple Transactions Tests
    function test_MultipleOnRamps() public {
        vm.prank(backendSigner);
        rampAggregator.recordOnRamp(user, 10 ether, "yellowcard", "tx_ref_1");

        vm.prank(backendSigner);
        rampAggregator.recordOnRamp(user, 20 ether, "yellowcard", "tx_ref_2");

        assertEq(rampAggregator.getUserBalance(user), 30 ether);
    }

    function test_MultipleOffRamps_SameUser() public {
        vm.startPrank(user);
        bytes32 requestId1 = rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);

        bytes32 requestId2 = rampAggregator.initiateOffRamp{value: 10 ether}(10 ether, "yellowcard", "NGN", 2000000);
        vm.stopPrank();

        assertNotEq(requestId1, requestId2);

        RampAggregator.OffRampRequest memory request1 = rampAggregator.getOffRampRequest(requestId1);
        RampAggregator.OffRampRequest memory request2 = rampAggregator.getOffRampRequest(requestId2);

        assertEq(request1.amount, 5 ether);
        assertEq(request2.amount, 10 ether);
    }

    // Invalid Amount Tests
    function test_RecordOnRamp_ZeroAmount() public {
        vm.prank(backendSigner);
        vm.expectRevert(RampAggregator.InvalidAmount.selector);
        rampAggregator.recordOnRamp(user, 0, "yellowcard", "tx_ref");
    }

    function test_InitiateOffRamp_ZeroAmount() public {
        vm.startPrank(user);
        vm.expectRevert(RampAggregator.InvalidAmount.selector);
        rampAggregator.initiateOffRamp{value: 0}(0, "yellowcard", "NGN", 0);
        vm.stopPrank();
    }

    function test_InitiateOffRamp_MsgValueMismatch() public {
        vm.startPrank(user);
        vm.expectRevert(RampAggregator.InvalidAmount.selector);
        rampAggregator.initiateOffRamp{value: 5 ether}(10 ether, "yellowcard", "NGN", 1000000);
        vm.stopPrank();
    }

    // Cancel by Unauthorized User
    function test_CancelOffRamp_UnauthorizedUser() public {
        vm.startPrank(user);
        bytes32 requestId = rampAggregator.initiateOffRamp{value: 5 ether}(5 ether, "yellowcard", "NGN", 1000000);
        vm.stopPrank();

        address unauthorizedUser = address(0x6);
        vm.prank(unauthorizedUser);
        vm.expectRevert(RampAggregator.InvalidSigner.selector);
        rampAggregator.cancelOffRamp(requestId);
    }

    // Non-existent Request Tests
    function test_CompleteOffRamp_NonExistent() public {
        bytes32 fakeRequestId = keccak256(abi.encodePacked("fake"));
        vm.prank(backendSigner);
        vm.expectRevert(RampAggregator.RequestNotFound.selector);
        rampAggregator.completeOffRamp(fakeRequestId);
    }

    function test_CancelOffRamp_NonExistent() public {
        bytes32 fakeRequestId = keccak256(abi.encodePacked("fake"));
        vm.prank(user);
        vm.expectRevert(RampAggregator.RequestNotFound.selector);
        rampAggregator.cancelOffRamp(fakeRequestId);
    }

    function test_GetOffRampRequest_NonExistent() public view {
        bytes32 fakeRequestId = keccak256(abi.encodePacked("fake"));
        RampAggregator.OffRampRequest memory request = rampAggregator.getOffRampRequest(fakeRequestId);
        assertEq(request.user, address(0));
    }
}
