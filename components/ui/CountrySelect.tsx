"use client";

import React, { useState, useRef, useEffect } from 'react';

// Country data with ISO codes and flag emojis
const COUNTRIES = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
    { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
    { code: 'IL', name: 'Israel', flag: '🇮🇱' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'PE', name: 'Peru', flag: '🇵🇪' },
].sort((a, b) => a.name.localeCompare(b.name));

interface CountrySelectProps {
    value: string;
    onChange: (code: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    multiple?: boolean;
    selectedCodes?: string[];
    onMultiChange?: (codes: string[]) => void;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Select country...',
    disabled = false,
    multiple = false,
    selectedCodes = [],
    onMultiChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCountries = COUNTRIES.filter(
        (country) =>
            country.name.toLowerCase().includes(search.toLowerCase()) ||
            country.code.toLowerCase().includes(search.toLowerCase())
    );

    const selectedCountry = COUNTRIES.find((c) => c.code === value);

    const handleSelect = (code: string) => {
        if (multiple && onMultiChange) {
            const newCodes = selectedCodes.includes(code)
                ? selectedCodes.filter((c) => c !== code)
                : [...selectedCodes, code];
            onMultiChange(newCodes);
        } else {
            onChange(code);
            setIsOpen(false);
            setSearch('');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-light-100 mb-1">{label}</label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className={`
          w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-left
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
            >
                {multiple ? (
                    <span className="text-white">
                        {selectedCodes.length > 0
                            ? `${selectedCodes.length} countries selected`
                            : placeholder}
                    </span>
                ) : selectedCountry ? (
                    <span className="flex items-center gap-2 text-white">
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span>{selectedCountry.name}</span>
                    </span>
                ) : (
                    <span className="text-light-200">{placeholder}</span>
                )}
                <svg
                    className={`w-5 h-5 text-light-200 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-dark-200 border border-border rounded-lg shadow-xl overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-border">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search countries..."
                            className="w-full px-3 py-2 bg-dark-100 border border-border rounded-lg text-white text-sm
                       focus:outline-none focus:ring-1 focus:ring-primary placeholder-light-200"
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredCountries.length === 0 ? (
                            <div className="px-4 py-3 text-light-200 text-sm">No countries found</div>
                        ) : (
                            filteredCountries.map((country) => {
                                const isSelected = multiple
                                    ? selectedCodes.includes(country.code)
                                    : value === country.code;

                                return (
                                    <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => handleSelect(country.code)}
                                        className={`
                      w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                      ${isSelected
                                                ? 'bg-primary/20 text-white'
                                                : 'text-light-100 hover:bg-dark-100 hover:text-white'
                                            }
                    `}
                                    >
                                        <span className="text-xl">{country.flag}</span>
                                        <span className="flex-1">{country.name}</span>
                                        <span className="text-xs text-light-200">{country.code}</span>
                                        {multiple && isSelected && (
                                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Selected Countries Tags (for multiple) */}
            {multiple && selectedCodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCodes.map((code) => {
                        const country = COUNTRIES.find((c) => c.code === code);
                        if (!country) return null;
                        return (
                            <span
                                key={code}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-white text-sm rounded-lg"
                            >
                                <span>{country.flag}</span>
                                <span>{country.code}</span>
                                <button
                                    type="button"
                                    onClick={() => onMultiChange?.(selectedCodes.filter((c) => c !== code))}
                                    className="ml-1 text-light-200 hover:text-white"
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CountrySelect;
