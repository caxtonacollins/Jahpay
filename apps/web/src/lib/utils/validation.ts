/**
 * Validation utilities
 */

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(
  phone: string,
  country: string = "NG"
): boolean {
  const cleaned = phone.replace(/\D/g, "");

  if (country === "NG") {
    // Nigerian phone: 10 digits (without 0) or 11 digits (with 0) or 13 digits (with +234)
    return (
      cleaned.length === 10 || cleaned.length === 11 || cleaned.length === 13
    );
  }

  // Default: 10-15 digits
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function isValidAccountNumber(
  accountNumber: string,
  country: string = "NG"
): boolean {
  const cleaned = accountNumber.replace(/\D/g, "");

  if (country === "NG") {
    // Nigerian bank accounts are 10 digits
    return cleaned.length === 10;
  }

  // Default: 8-20 digits
  return cleaned.length >= 8 && cleaned.length <= 20;
}

export function isValidBankCode(
  bankCode: string,
  country: string = "NG"
): boolean {
  const cleaned = bankCode.trim();

  if (country === "NG") {
    // Nigerian bank codes are 3 digits
    return /^\d{3}$/.test(cleaned);
  }

  return cleaned.length > 0;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateAmount(
  amount: number,
  minAmount: number = 0,
  maxAmount: number = Infinity
): ValidationResult {
  const errors: string[] = [];

  if (amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (amount < minAmount) {
    errors.push(`Amount must be at least ${minAmount}`);
  }

  if (amount > maxAmount) {
    errors.push(`Amount must not exceed ${maxAmount}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateFormData(
  data: Record<string, any>,
  rules: Record<string, any>
): ValidationResult {
  const errors: string[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    if (rule.required && !value) {
      errors.push(`${field} is required`);
      continue;
    }

    if (rule.minLength && value?.length < rule.minLength) {
      errors.push(`${field} must be at least ${rule.minLength} characters`);
    }

    if (rule.maxLength && value?.length > rule.maxLength) {
      errors.push(`${field} must not exceed ${rule.maxLength} characters`);
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(`${field} is invalid`);
    }

    if (rule.custom && !rule.custom(value)) {
      errors.push(rule.customMessage || `${field} is invalid`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateOnRampForm(data: any): ValidationResult {
  return validateFormData(data, {
    cryptoCurrency: { required: true },
    fiatCurrency: { required: true },
    amount: {
      required: true,
      custom: (v: any) => v > 0,
      customMessage: "Amount must be greater than 0",
    },
    countryCode: { required: true },
  });
}

export function validateOffRampForm(data: any): ValidationResult {
  return validateFormData(data, {
    cryptoCurrency: { required: true },
    fiatCurrency: { required: true },
    amount: {
      required: true,
      custom: (v: any) => v > 0,
      customMessage: "Amount must be greater than 0",
    },
    bankAccountId: { required: true },
    countryCode: { required: true },
  });
}

export function validateBankAccount(
  data: any,
  country: string = "NG"
): ValidationResult {
  const errors: string[] = [];

  if (
    !data.accountNumber ||
    !isValidAccountNumber(data.accountNumber, country)
  ) {
    errors.push("Invalid account number");
  }

  if (!data.bankCode || !isValidBankCode(data.bankCode, country)) {
    errors.push("Invalid bank code");
  }

  if (!data.accountName || data.accountName.trim().length === 0) {
    errors.push("Account name is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
