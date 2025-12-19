// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FeeCollector
 * @notice Contract for collecting and managing platform fees
 * @dev Allows authorized collectors to deposit fees and owner to withdraw
 */
contract FeeCollector is Ownable {
    // ============ State Variables ============
    mapping(address => bool) public authorizedCollectors;
    mapping(address => uint256) public collectedFees; // token => amount

    // ============ Events ============
    event FeesCollected(address indexed token, uint256 amount, address indexed collector);
    event FeesWithdrawn(address indexed token, uint256 amount, address indexed to);
    event CollectorAuthorized(address indexed collector);
    event CollectorRevoked(address indexed collector);

    // ============ Errors ============
    error UnauthorizedCollector();
    error InvalidAddress();
    error InvalidAmount();
    error TransferFailed();

    // ============ Modifiers ============
    modifier onlyCollector() {
        if (!authorizedCollectors[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedCollector();
        }
        _;
    }

    // ============ Constructor ============
    constructor() Ownable(msg.sender) {}

    // ============ Receive ============
        // Allow contract to receive native tokens (CELO)
    receive() external payable {
        collectedFees[address(0)] += msg.value;
        emit FeesCollected(address(0), msg.value, msg.sender);
    }

    // Allow contract to receive native tokens (CELO)
    fallback() external payable {
        collectedFees[address(0)] += msg.value;
        emit FeesCollected(address(0), msg.value, msg.sender);
    }

    // ============ Functions ============

    /**
     * @notice Collect fees (native CELO or ERC20 tokens)
     * @param token Token address (address(0) for native CELO)
     * @param amount Amount to collect
     */
    function collectFees(address token, uint256 amount) external payable onlyCollector {
        if (amount == 0) revert InvalidAmount();

        if (token == address(0)) {
            // Native CELO - should be sent with the transaction
            if (msg.value != amount) revert InvalidAmount();
            collectedFees[address(0)] += amount;
        } else {
            // ERC20 token - must be approved first
            IERC20(token).transferFrom(msg.sender, address(this), amount);
            collectedFees[token] += amount;
        }

        emit FeesCollected(token, amount, msg.sender);
    }

    /**
     * @notice Calculate fee based on amount and fee basis points
     * @param amount Amount to calculate fee for
     * @param feeBps Fee in basis points
     * @return fee Calculated fee amount
     */
    function calculateFee(uint256 amount, uint256 feeBps) external pure returns (uint256) {
        return (amount * feeBps) / 10000;
    }

    /**
     * @notice Withdraw collected fees
     * @param token Token address (address(0) for native CELO)
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function withdrawFees(address token, address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (collectedFees[token] < amount) revert InvalidAmount();

        collectedFees[token] -= amount;

        if (token == address(0)) {
            // Withdraw native CELO
            (bool success, ) = to.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            // Withdraw ERC20 token
            bool success = IERC20(token).transfer(to, amount);
            if (!success) revert TransferFailed();
        }

        emit FeesWithdrawn(token, amount, to);
    }

    /**
     * @notice Get total collected fees for a token
     * @param token Token address (address(0) for native CELO)
     * @return amount Total collected fees
     */
    function getCollectedFees(address token) external view returns (uint256) {
        return collectedFees[token];
    }

    /**
     * @notice Authorize a collector address
     * @param collector Address to authorize
     */
    function authorizeCollector(address collector) external onlyOwner {
        if (collector == address(0)) revert InvalidAddress();
        authorizedCollectors[collector] = true;
        emit CollectorAuthorized(collector);
    }

    /**
     * @notice Revoke collector authorization
     * @param collector Address to revoke
     */
    function revokeCollector(address collector) external onlyOwner {
        if (collector == address(0)) revert InvalidAddress();
        authorizedCollectors[collector] = false;
        emit CollectorRevoked(collector);
    }
}

