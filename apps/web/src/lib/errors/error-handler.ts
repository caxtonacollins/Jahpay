/**
 * Error categorization and handling utilities
 * Provides consistent error handling across the application
 */

export enum ErrorCategory {
    NETWORK = 'network',
    USER = 'user',
    CONTRACT = 'contract',
    VALIDATION = 'validation',
    RATE_LIMIT = 'rate_limit',
    UNKNOWN = 'unknown',
}

export interface CategorizedError {
    category: ErrorCategory;
    message: string;
    userMessage: string;
    retryable: boolean;
    originalError?: Error;
}

/**
 * Categorize an error and provide user-friendly messaging
 */
export function categorizeError(error: unknown): CategorizedError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const lowerMessage = errorMessage.toLowerCase();

    // Network errors
    if (
        lowerMessage.includes('network') ||
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('connection') ||
        lowerMessage.includes('econnrefused')
    ) {
        return {
            category: ErrorCategory.NETWORK,
            message: errorMessage,
            userMessage: 'Network error. Please check your connection and try again.',
            retryable: true,
            originalError: error instanceof Error ? error : undefined,
        };
    }

    // Rate limiting
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
        return {
            category: ErrorCategory.RATE_LIMIT,
            message: errorMessage,
            userMessage: 'Too many requests. Please wait a moment and try again.',
            retryable: true,
            originalError: error instanceof Error ? error : undefined,
        };
    }

    // User errors (insufficient balance, invalid input)
    if (
        lowerMessage.includes('insufficient') ||
        lowerMessage.includes('balance') ||
        lowerMessage.includes('invalid amount') ||
        lowerMessage.includes('user rejected')
    ) {
        return {
            category: ErrorCategory.USER,
            message: errorMessage,
            userMessage: errorMessage,
            retryable: false,
            originalError: error instanceof Error ? error : undefined,
        };
    }

    // Validation errors
    if (
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('required') ||
        lowerMessage.includes('must be')
    ) {
        return {
            category: ErrorCategory.VALIDATION,
            message: errorMessage,
            userMessage: errorMessage,
            retryable: false,
            originalError: error instanceof Error ? error : undefined,
        };
    }

    // Contract/blockchain errors
    if (
        lowerMessage.includes('revert') ||
        lowerMessage.includes('gas') ||
        lowerMessage.includes('nonce') ||
        lowerMessage.includes('transaction') ||
        lowerMessage.includes('contract')
    ) {
        return {
            category: ErrorCategory.CONTRACT,
            message: errorMessage,
            userMessage: 'Transaction failed. Please try again or contact support.',
            retryable: true,
            originalError: error instanceof Error ? error : undefined,
        };
    }

    // Unknown errors
    return {
        category: ErrorCategory.UNKNOWN,
        message: errorMessage,
        userMessage: 'An unexpected error occurred. Please try again.',
        retryable: true,
        originalError: error instanceof Error ? error : undefined,
    };
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const categorized = categorizeError(error);

            // Don't retry non-retryable errors
            if (!categorized.retryable) {
                throw error;
            }

            // Don't retry on last attempt
            if (attempt === maxRetries - 1) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s, etc.
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Log error with context
 */
export function logError(
    context: string,
    error: unknown,
    additionalData?: Record<string, unknown>
) {
    const categorized = categorizeError(error);
    console.error(`[${context}] ${categorized.category.toUpperCase()}:`, {
        message: categorized.message,
        category: categorized.category,
        retryable: categorized.retryable,
        ...additionalData,
    });
}
