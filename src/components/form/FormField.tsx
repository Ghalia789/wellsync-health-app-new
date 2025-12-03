"use client";

import React, { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  type: "text" | "email" | "password" | "number" | "date" | "textarea" | "select";
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  options?: { label: string; value: string }[];
}

export default function FormField({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
  step,
  error,
  helpText,
  disabled,
  options,
}: FormFieldProps) {
  const baseInputClasses =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--mint-500)] focus:border-transparent transition";

  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${baseInputClasses} ${errorClasses} resize-none`}
          rows={4}
        />
      ) : type === "select" ? (
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`${baseInputClasses} ${errorClasses}`}
        >
          <option value="" disabled>Select...</option>
          {options && options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`${baseInputClasses} ${errorClasses}`}
        />
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helpText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helpText}</p>
      )}
    </div>
  );
}
