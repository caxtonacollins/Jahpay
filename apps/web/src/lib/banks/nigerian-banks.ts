export interface Bank {
  code: string;
  name: string;
  country: string;
  ussd?: string;
}

// Nigerian Banks
export const NIGERIAN_BANKS: Bank[] = [
  { code: "011", name: "First Bank Nigeria", country: "NG" },
  { code: "012", name: "Union Bank Nigeria", country: "NG" },
  { code: "032", name: "Sterling Bank Nigeria", country: "NG" },
  { code: "033", name: "Zenith Bank Nigeria", country: "NG" },
  { code: "044", name: "Access Bank Nigeria", country: "NG" },
  { code: "050", name: "Ecobank Nigeria", country: "NG" },
  { code: "070", name: "Equitorial Trust Bank", country: "NG" },
  { code: "075", name: "Suntrust Bank Nigeria", country: "NG" },
  { code: "076", name: "Skye Bank", country: "NG" },
  { code: "082", name: "Guaranty Trust Bank", country: "NG" },
  { code: "090", name: "Fidelity Bank Nigeria", country: "NG" },
  { code: "100", name: "SambaPay", country: "NG" },
  { code: "101", name: "Providus Bank", country: "NG" },
  { code: "102", name: "Stanbic IBTC Bank", country: "NG" },
  { code: "103", name: "United Bank For Africa", country: "NG" },
  { code: "104", name: "Wema Bank", country: "NG" },
  { code: "105", name: "First Bank Nigeria PLC", country: "NG" },
  { code: "106", name: "Fidelity Bank Plc", country: "NG" },
  { code: "110", name: "Coronation Merchant Bank", country: "NG" },
  { code: "111", name: "Unity Bank Nigeria", country: "NG" },
  { code: "121", name: "Zenith Bank Nigeria", country: "NG" },
];

// Ghanaian Banks
export const GHANAIAN_BANKS: Bank[] = [
  { code: "GH001", name: "Ghana Commercial Bank", country: "GH" },
  { code: "GH002", name: "Ecobank Ghana", country: "GH" },
  { code: "GH003", name: "Zenith Bank Ghana", country: "GH" },
  { code: "GH004", name: "Absa Bank Ghana", country: "GH" },
  { code: "GH005", name: "Access Bank Ghana", country: "GH" },
];

// Kenyan Banks
export const KENYAN_BANKS: Bank[] = [
  { code: "KE001", name: "Equity Bank Kenya", country: "KE" },
  { code: "KE002", name: "Kenya Commercial Bank", country: "KE" },
  { code: "KE003", name: "Safaricom M-Pesa", country: "KE" },
  { code: "KE004", name: "Cooperative Bank of Kenya", country: "KE" },
  { code: "KE005", name: "Diamond Trust Bank", country: "KE" },
];

export const BANK_MAP: Record<string, Bank[]> = {
  NG: NIGERIAN_BANKS,
  GH: GHANAIAN_BANKS,
  KE: KENYAN_BANKS,
};

export function getBanksByCountry(countryCode: string): Bank[] {
  return BANK_MAP[countryCode] || [];
}

export function getBankByCode(
  code: string,
  countryCode: string
): Bank | undefined {
  const banks = getBanksByCountry(countryCode);
  return banks.find((bank) => bank.code === code);
}

export function getAllBanks(): Bank[] {
  return [...NIGERIAN_BANKS, ...GHANAIAN_BANKS, ...KENYAN_BANKS];
}
