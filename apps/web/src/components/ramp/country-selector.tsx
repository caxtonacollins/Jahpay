"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  countries?: { code: string; name: string; flag: string }[];
}

const DEFAULT_COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
];

export function CountrySelector({
  value,
  onChange,
  countries = DEFAULT_COUNTRIES,
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = countries.find((c) => c.code === value);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          {selectedCountry && (
            <>
              <span className="text-xl">{selectedCountry.flag}</span>
              <span className="text-white">{selectedCountry.name}</span>
            </>
          )}
          {!selectedCountry && (
            <>
              <Globe className="w-5 h-5 text-white/60" />
              <span className="text-white/60">Select country</span>
            </>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-white/60" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/10 rounded-lg overflow-hidden z-50 backdrop-blur-md"
        >
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-white/20 transition-colors"
            >
              <span className="text-xl">{country.flag}</span>
              <span className="text-white">{country.name}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
