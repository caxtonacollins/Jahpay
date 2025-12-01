-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    country_code TEXT,
    preferred_provider TEXT,
    kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('on-ramp', 'off-ramp')),
    provider TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Crypto details
    crypto_amount DECIMAL(36, 18),
    crypto_currency TEXT,
    wallet_address TEXT,
    blockchain_tx_hash TEXT,
    
    -- Fiat details
    fiat_amount DECIMAL(18, 2),
    fiat_currency TEXT,
    bank_account_number TEXT,
    bank_code TEXT,
    recipient_name TEXT,
    
    -- Provider details
    provider_tx_id TEXT,
    provider_reference TEXT,
    provider_fee DECIMAL(18, 2),
    
    -- Rates & fees
    exchange_rate DECIMAL(18, 6),
    platform_fee DECIMAL(18, 2),
    
    -- Metadata
    metadata JSONB,
    error_message TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Exchange rates cache
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate DECIMAL(18, 6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(provider, from_currency, to_currency)
);

-- Provider status tracking
CREATE TABLE IF NOT EXISTS provider_status (
    provider TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT true,
    success_rate DECIMAL(5, 2),
    avg_completion_time INTEGER,
    last_checked_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bank accounts (for off-ramps)
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_number TEXT NOT NULL,
    bank_code TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, account_number, bank_code)
);

-- Referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    uses INTEGER DEFAULT 0,
    rewards_earned DECIMAL(18, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_tx_id ON transactions(provider_tx_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_expires ON exchange_rates(expires_at);
