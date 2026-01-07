"use client";

import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    minDate?: string;
    maxDate?: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Select date...',
    disabled = false,
    minDate,
    maxDate,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        if (value) {
            const [year, month] = value.split('-').map(Number);
            return { year, month: month - 1 };
        }
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get days in month
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Navigate months
    const prevMonth = () => {
        setViewDate(prev => {
            if (prev.month === 0) {
                return { year: prev.year - 1, month: 11 };
            }
            return { ...prev, month: prev.month - 1 };
        });
    };

    const nextMonth = () => {
        setViewDate(prev => {
            if (prev.month === 11) {
                return { year: prev.year + 1, month: 0 };
            }
            return { ...prev, month: prev.month + 1 };
        });
    };

    // Navigate years
    const prevYear = () => {
        setViewDate(prev => ({ ...prev, year: prev.year - 1 }));
    };

    const nextYear = () => {
        setViewDate(prev => ({ ...prev, year: prev.year + 1 }));
    };

    // Check if date is disabled
    const isDateDisabled = (year: number, month: number, day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (minDate && dateStr < minDate) return true;
        if (maxDate && dateStr > maxDate) return true;
        return false;
    };

    // Check if date is selected
    const isDateSelected = (year: number, month: number, day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return value === dateStr;
    };

    // Check if date is today
    const isToday = (year: number, month: number, day: number) => {
        const today = new Date();
        return (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate()
        );
    };

    // Handle date selection
    const selectDate = (day: number) => {
        const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    // Format display date
    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-').map(Number);
        return `${MONTHS[month - 1]} ${day}, ${year}`;
    };

    // Generate calendar grid
    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
        const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month);
        const days: React.ReactNode[] = [];

        // Empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-9" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const disabled = isDateDisabled(viewDate.year, viewDate.month, day);
            const selected = isDateSelected(viewDate.year, viewDate.month, day);
            const today = isToday(viewDate.year, viewDate.month, day);

            days.push(
                <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDate(day)}
                    className={`
            h-9 w-9 rounded-lg text-sm font-medium transition-all
            flex items-center justify-center
            ${disabled
                            ? 'text-light-200/30 cursor-not-allowed'
                            : selected
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : today
                                    ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                    : 'text-white hover:bg-dark-100'
                        }
          `}
                >
                    {day}
                </button>
            );
        }

        return days;
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
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-left
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
            >
                {value ? (
                    <span className="text-white">{formatDisplayDate(value)}</span>
                ) : (
                    <span className="text-light-200">{placeholder}</span>
                )}
                <svg
                    className="w-5 h-5 text-light-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </button>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-80 mt-1 bg-dark-200 border border-border rounded-xl shadow-2xl overflow-hidden">
                    {/* Header - Year Navigation */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-dark-300">
                        <button
                            type="button"
                            onClick={prevYear}
                            className="p-1 text-light-200 hover:text-white hover:bg-dark-100 rounded transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-white font-semibold">{viewDate.year}</span>
                        <button
                            type="button"
                            onClick={nextYear}
                            className="p-1 text-light-200 hover:text-white hover:bg-dark-100 rounded transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Header - Month Navigation */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-1 text-light-200 hover:text-white hover:bg-dark-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-white font-medium">{MONTHS[viewDate.month]}</span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-1 text-light-200 hover:text-white hover:bg-dark-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 px-3 py-2 border-b border-border">
                        {DAYS.map((day) => (
                            <div
                                key={day}
                                className="h-8 flex items-center justify-center text-xs font-medium text-light-200"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 p-3">
                        {renderCalendar()}
                    </div>

                    {/* Footer - Quick Actions */}
                    <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-dark-300">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                onChange(dateStr);
                                setIsOpen(false);
                            }}
                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                            }}
                            className="text-xs text-light-200 hover:text-white font-medium transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
