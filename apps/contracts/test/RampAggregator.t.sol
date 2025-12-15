// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
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
            1 ether,      // minAmount
            1000 ether,   // maxAmount
            100           // 1% fee
        );
        
        vm.stopPrank();
        
        // Give user some ETH
        vm.deal(user, 100 ether);
    }

    function test_InitialState() public {
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
        rampAggregator.initiateOffRamp{value: 0.5 ether}(
            0.5 ether,
            "yellowcard",
            "NGN",
            100000
        );
        vm.stopPrank();
    }

    function test_InitiateOffRamp_AboveMaximum() public {
        vm.deal(user, 2000 ether);
        vm.startPrank(user);
        vm.expectRevert(RampAggregator.InvalidAmount.selector);
        rampAggregator.initiateOffRamp{value: 2000 ether}(
            2000 ether,
            "yellowcard",
            "NGN",
            40000000
        );
        vm.stopPrank();
    }

    function test_CompleteOffRamp() public {
        vm.startPrank(user);
        uint256 amount = 5 ether;
        bytes32 requestId = rampAggregator.initiateOffRamp{value: amount}(
            amount,
            "yellowcard",
            "NGN",
            1000000
        );
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
        bytes32 requestId = rampAggregator.initiateOffRamp{value: amount}(
            amount,
            "yellowcard",
            "NGN",
            1000000
        );
        
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
        bytes32 requestId = rampAggregator.initiateOffRamp{value: amount}(
            amount,
            "yellowcard",
            "NGN",
            1000000
        );
        vm.stopPrank();
        
        uint256 balanceBefore = user.balance;
        vm.prank(backendSigner);
        rampAggregator.cancelOffRamp(requestId);
        
        RampAggregator.OffRampRequest memory request = rampAggregator.getOffRampRequest(requestId);
        assertTrue(request.cancelled);
        // User should receive refund (minus fee that was sent to fee collector)
        assertGt(user.balance, balanceBefore);
    }

    function test_CalculateFee() public {
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
        
        rampAggregator.setProviderConfig(
            "cashramp",
            true,
            0.1 ether,
            500 ether,
            150
        );
        
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
}

