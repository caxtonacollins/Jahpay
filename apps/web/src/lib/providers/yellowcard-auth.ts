import crypto from 'crypto';

/**
 * YellowCard API Authentication
 * Implements HMAC-SHA256 signing for API requests
 */

export interface YellowCardAuthConfig {
    apiKey: string;
    apiSecret: string;
    baseUrl: string;
}

/**
 * Generate HMAC signature for YellowCard API requests
 * Signature is calculated over: timestamp + request_path + method + body_hash
 */
export function generateYellowCardSignature(
    apiSecret: string,
    timestamp: string,
    requestPath: string,
    method: string,
    bodyHash: string
): string {
    const signaturePayload = `${timestamp}${requestPath}${method}${bodyHash}`;
    return crypto
        .createHmac('sha256', apiSecret)
        .update(signaturePayload)
        .digest('hex');
}

/**
 * Calculate SHA256 hash of request body
 */
export function hashRequestBody(body: string | null): string {
    if (!body) {
        return crypto.createHash('sha256').update('').digest('hex');
    }
    return crypto.createHash('sha256').update(body).digest('hex');
}

/**
 * Build YellowCard API headers with authentication
 */
export function buildYellowCardHeaders(
    apiKey: string,
    apiSecret: string,
    method: string,
    path: string,
    body?: Record<string, any>
): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyString = body ? JSON.stringify(body) : null;
    const bodyHash = hashRequestBody(bodyString);
    const signature = generateYellowCardSignature(
        apiSecret,
        timestamp,
        path,
        method,
        bodyHash
    );

    return {
        'Content-Type': 'application/json',
        'X-YC-Timestamp': timestamp,
        'Authorization': `YcHmacV1 ${apiKey}:${signature}`,
    };
}

/**
 * Make authenticated request to YellowCard API
 */
export async function makeYellowCardRequest<T>(
    config: YellowCardAuthConfig,
    method: string,
    path: string,
    body?: Record<string, any>
): Promise<T> {
    const url = `${config.baseUrl}${path}`;
    const headers = buildYellowCardHeaders(
        config.apiKey,
        config.apiSecret,
        method,
        path,
        body
    );

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message || `YellowCard API error: ${response.statusText}`
        );
    }

    return response.json();
}
