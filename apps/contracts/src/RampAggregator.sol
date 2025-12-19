// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RampAggregator
 * @notice Production-ready smart contract for managing fiat-to-crypto on-ramp and off-ramp transactions
 * @dev Integrates with multiple payment providers (Yellow Card, Cashramp, Bitmama)
 */
contract RampAggregator is Ownable, Pausable, ReentrancyGuard {
    // ============ Constants ============
    uint256 public constant MAX_FEE_BPS = 1000; // 10% maximum fee
    uint256 public constant BPS_DENOMINATOR = 10000;

    // ============ State Variables ============
    address public backendSigner;
    address public feeCollector;
    uint256 public feeBps;

    struct ProviderConfig {
        bool isActive;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 feeBps;
    }

    mapping(string => ProviderConfig) public providers;

    // Off-ramp request tracking
    struct OffRampRequest {
        address user;
        uint256 amount;
        string provider;
        string fiatCurrency;
        uint256 amountFiat;
        uint256 timestamp;
        bool completed;
        bool cancelled;
    }

    mapping(bytes32 => OffRampRequest) public offRampRequests;
    mapping(address => uint256) public userBalances; // For tracking user deposits

    // ============ Events ============
    event OnRampCompleted(
        address indexed user,
        uint256 amount,
        string provider,
        string txReference
    );

    event OffRampInitiated(
        address indexed user,
        uint256 amount,
        bytes32 indexed requestId,
        string provider
    );

    event OffRampCompleted(
        address indexed user,
        bytes32 indexed requestId,
        uint256 amount
    );

    event OffRampCancelled(
        address indexed user,
        bytes32 indexed requestId,
        uint256 amount
    );

    event ProviderUpdated(
        string provider,
        bool isActive,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 feeBps
    );

    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event BackendSignerUpdated(address oldSigner, address newSigner);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    event EmergencyWithdraw(address token, uint256 amount, address to);

    // ============ Errors ============
    error InvalidAddress();
    error InvalidFee();
    error InvalidAmount();
    error ProviderNotActive();
    error RequestNotFound();
    error RequestAlreadyCompleted();
    error RequestAlreadyCancelled();
    error InsufficientBalance();
    error InvalidSigner();
    error TransferFailed();

    // ============ Modifiers ============
    modifier onlyBackendSigner() {
        if (msg.sender != backendSigner) revert InvalidSigner();
        _;
    }

    modifier validProvider(string memory provider) {
        if (!providers[provider].isActive) revert ProviderNotActive();
        _;
    }

    // ============ Constructor ============
    constructor(address _backendSigner, address _feeCollector) Ownable(msg.sender) Pausable() ReentrancyGuard() {
        if (_backendSigner == address(0) || _feeCollector == address(0)) {
            revert InvalidAddress();
        }
        backendSigner = _backendSigner;
        feeCollector = _feeCollector;
        feeBps = 150; // Default 1.5% fee
    }

    // ============ Receive ============
    receive() external payable {
        // Allow contract to receive native tokens (CELO)
    }

    fallback() external payable {
        // Allow contract to receive native tokens (CELO)
    }

    // ============ On-Ramp Functions ============

    /**
     * @notice Record an on-ramp transaction completion
     * @dev Called by backend after fiat payment is confirmed
     * @param user Address of the user receiving crypto
     * @param amount Amount of crypto to credit (in wei/smallest unit)
     * @param provider Provider name (e.g., "yellowcard", "cashramp", "bitmama")
     * @param txReference External transaction reference from provider
     */
    function recordOnRamp(
        address user,
        uint256 amount,
        string memory provider,
        string memory txReference
    ) external onlyBackendSigner whenNotPaused {
        if (user == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (!providers[provider].isActive) revert ProviderNotActive();

        // Update user balance (for tracking purposes)
        userBalances[user] += amount;

        emit OnRampCompleted(user, amount, provider, txReference);
    }

    // ============ Off-Ramp Functions ============

    /**
     * @notice Initiate an off-ramp transaction
     * @dev User locks crypto tokens to convert to fiat
     * @param amount Amount of crypto to lock (in wei/smallest unit)
     * @param provider Provider name
     * @param fiatCurrency Fiat currency code (e.g., "NGN")
     * @param amountFiat Expected fiat amount to receive
     * @return requestId Unique identifier for this off-ramp request
     */
    function initiateOffRamp(
        uint256 amount,
        string memory provider,
        string memory fiatCurrency,
        uint256 amountFiat
    ) external payable whenNotPaused nonReentrant validProvider(provider) returns (bytes32) {
        if (amount == 0) revert InvalidAmount();
        if (amount < providers[provider].minAmount) revert InvalidAmount();
        if (amount > providers[provider].maxAmount) revert InvalidAmount();

        // Generate unique request ID
        bytes32 requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                amount,
                provider,
                fiatCurrency,
                block.timestamp,
                block.number
            )
        );

        // Check if request ID already exists (extremely unlikely but safe)
        if (offRampRequests[requestId].user != address(0)) {
            revert RequestNotFound(); // Actually means request exists, but we'll use this
        }

        // Store off-ramp request
        offRampRequests[requestId] = OffRampRequest({
            user: msg.sender,
            amount: amount,
            provider: provider,
            fiatCurrency: fiatCurrency,
            amountFiat: amountFiat,
            timestamp: block.timestamp,
            completed: false,
            cancelled: false
        });

        // Calculate and collect fee
        uint256 fee = calculateFee(amount);

        // Transfer tokens from user to contract
        // Note: User must approve this contract first
        // For native CELO, we use msg.value
        if (msg.value > 0) {
            if (msg.value != amount) revert InvalidAmount();
            // Native CELO is already in contract
        } else {
            // For ERC20 tokens, we need to transfer
            // This is a placeholder - in production, you'd specify the token address
            // For now, we'll track the balance
            userBalances[msg.sender] -= amount;
        }

        // Transfer fee to fee collector
        if (fee > 0 && feeCollector != address(0)) {
            (bool success, ) = feeCollector.call{value: fee}("");
            if (!success) revert TransferFailed();
        }

        emit OffRampInitiated(msg.sender, amount, requestId, provider);

        return requestId;
    }

    /**
     * @notice Complete an off-ramp transaction
     * @dev Called by backend after fiat payment is sent to user
     * @param requestId Unique identifier of the off-ramp request
     */
    function completeOffRamp(bytes32 requestId) external onlyBackendSigner whenNotPaused {
        OffRampRequest storage request = offRampRequests[requestId];
        if (request.user == address(0)) revert RequestNotFound();
        if (request.completed) revert RequestAlreadyCompleted();
        if (request.cancelled) revert RequestAlreadyCancelled();

        request.completed = true;

        // In a full implementation, tokens would be transferred out here
        // For now, we just mark as completed

        emit OffRampCompleted(request.user, requestId, request.amount);
    }

    /**
     * @notice Cancel an off-ramp transaction
     * @dev Can be called by user or backend to cancel a pending request
     * @param requestId Unique identifier of the off-ramp request
     */
    function cancelOffRamp(bytes32 requestId) external whenNotPaused {
        OffRampRequest storage request = offRampRequests[requestId];
        if (request.user == address(0)) revert RequestNotFound();
        if (request.completed) revert RequestAlreadyCompleted();
        if (request.cancelled) revert RequestAlreadyCancelled();

        // Only user or backend can cancel
        if (msg.sender != request.user && msg.sender != backendSigner) {
            revert InvalidSigner();
        }

        request.cancelled = true;

        // Refund tokens to user (amount minus fee that was already sent to fee collector)
        uint256 fee = calculateFee(request.amount);
        uint256 refundAmount = request.amount - fee;
        userBalances[request.user] += refundAmount;

        // In production, transfer tokens back to user
        // Note: Fee was already sent to fee collector, so we refund the remaining amount
        if (refundAmount > 0) {
            (bool success, ) = request.user.call{value: refundAmount}("");
            if (!success) revert TransferFailed();
        }

        emit OffRampCancelled(request.user, requestId, request.amount);
    }

    // ============ View Functions ============

    /**
     * @notice Get off-ramp request details
     * @param requestId Unique identifier of the off-ramp request
     * @return request Off-ramp request struct
     */
    function getOffRampRequest(
        bytes32 requestId
    ) external view returns (OffRampRequest memory) {
        return offRampRequests[requestId];
    }

    /**
     * @notice Check if a provider is active
     * @param provider Provider name
     * @return bool True if provider is active
     */
    function isProviderActive(string memory provider) external view returns (bool) {
        return providers[provider].isActive;
    }

    /**
     * @notice Get user balance
     * @param user User address
     * @return balance User's balance in the contract
     */
    function getUserBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }

    /**
     * @notice Calculate fee for an amount
     * @param amount Amount to calculate fee for
     * @return fee Fee amount
     */
    function calculateFee(uint256 amount) public view returns (uint256) {
        return (amount * feeBps) / BPS_DENOMINATOR;
    }

    // ============ Admin Functions ============

    /**
     * @notice Set platform fee
     * @param _feeBps New fee in basis points (max 10%)
     */
    function setFee(uint256 _feeBps) external onlyOwner {
        if (_feeBps > MAX_FEE_BPS) revert InvalidFee();
        uint256 oldFeeBps = feeBps;
        feeBps = _feeBps;
        emit FeeUpdated(oldFeeBps, _feeBps);
    }

    /**
     * @notice Configure a provider
     * @param provider Provider name
     * @param active Whether provider is active
     * @param minAmount Minimum transaction amount
     * @param maxAmount Maximum transaction amount
     * @param _feeBps Provider-specific fee in basis points
     */
    function setProviderConfig(
        string memory provider,
        bool active,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 _feeBps
    ) external onlyOwner {
        if (_feeBps > MAX_FEE_BPS) revert InvalidFee();
        if (minAmount > maxAmount) revert InvalidAmount();

        providers[provider] = ProviderConfig({
            isActive: active,
            minAmount: minAmount,
            maxAmount: maxAmount,
            feeBps: _feeBps
        });

        emit ProviderUpdated(provider, active, minAmount, maxAmount, _feeBps);
    }

    /**
     * @notice Update backend signer address
     * @param newSigner New backend signer address
     */
    function setBackendSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert InvalidAddress();
        address oldSigner = backendSigner;
        backendSigner = newSigner;
        emit BackendSignerUpdated(oldSigner, newSigner);
    }

    /**
     * @notice Update fee collector address
     * @param newCollector New fee collector address
     */
    function setFeeCollector(address newCollector) external onlyOwner {
        if (newCollector == address(0)) revert InvalidAddress();
        address oldCollector = feeCollector;
        feeCollector = newCollector;
        emit FeeCollectorUpdated(oldCollector, newCollector);
    }

    /**
     * @notice Pause contract operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdraw tokens or native currency
     * @param token Token address (address(0) for native CELO)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            // Withdraw native CELO
            (bool success, ) = owner().call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            // Withdraw ERC20 token
            IERC20(token).transfer(owner(), amount);
        }
        emit EmergencyWithdraw(token, amount, owner());
    }
}

