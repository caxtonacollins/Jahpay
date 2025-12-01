/**
 * Number formatting utilities
 */

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCrypto(amount: number, decimals: number = 8): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function abbreviateNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toFixed(2);
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatPhoneNumber(
  phoneNumber: string,
  country: string = "NG"
): string {
  // Remove non-digits
  const cleaned = phoneNumber.replace(/\D/g, "");

  if (country === "NG") {
    // Nigerian format: +234 XXX XXX XXXX
    if (cleaned.length === 10 && cleaned.startsWith("0")) {
      return `+234${cleaned.substring(1)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith("234")) {
      return `+${cleaned}`;
    }
    if (cleaned.length === 10) {
      return `+234${cleaned}`;
    }
  }

  return phoneNumber;
}

export function formatAccountNumber(accountNumber: string): string {
  const cleaned = accountNumber.replace(/\D/g, "");
  return cleaned.replace(/(\d{4})/g, "$1 ").trim();
}

export function formatDate(
  date: Date | string,
  format: "short" | "long" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
