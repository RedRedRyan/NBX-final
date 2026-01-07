"use client";

import React from 'react';

interface ToggleProps {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
    id,
    label,
    description,
    checked,
    onChange,
    disabled = false,
}) => {
    return (
        <div className="flex items-center justify-between p-4 bg-dark-100 rounded-lg border border-border">
            <div className="flex-1">
                <label htmlFor={id} className="text-sm font-medium text-white cursor-pointer">
                    {label}
                </label>
                {description && (
                    <p className="text-xs text-light-200 mt-0.5">{description}</p>
                )}
            </div>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`
          relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-100
          ${checked ? 'bg-primary' : 'bg-dark-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
            >
                <span
                    className={`
            absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
            ${checked ? 'translate-x-7' : 'translate-x-1'}
          `}
                />
            </button>
        </div>
    );
};

export default Toggle;
