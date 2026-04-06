"use client"

import { clsx } from "clsx"
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react"

const inputBase =
  "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"

const inputStyle = {
  background: "var(--app-bg)",
  borderColor: "var(--app-border)",
  color: "var(--app-text)",
  transition: "border-color 150ms, box-shadow 150ms",
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-")
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium"
            style={{ color: "var(--app-text-muted)" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(inputBase, error && "input-error", className)}
          style={inputStyle}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-xs flex items-center gap-1"
            style={{ color: "var(--app-red)" }}
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-")
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium"
            style={{ color: "var(--app-text-muted)" }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(inputBase, error && "input-error", className)}
          style={{ ...inputStyle, cursor: "pointer" }}
          aria-describedby={error ? `${selectId}-error` : undefined}
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: "var(--app-surface)" }}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span
            id={`${selectId}-error`}
            className="text-xs"
            style={{ color: "var(--app-red)" }}
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const areaId = id ?? label?.toLowerCase().replace(/\s/g, "-")
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={areaId}
            className="text-xs font-medium"
            style={{ color: "var(--app-text-muted)" }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={clsx(inputBase, "resize-y min-h-[100px]", error && "input-error", className)}
          style={inputStyle}
          aria-describedby={error ? `${areaId}-error` : undefined}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && (
          <span
            id={`${areaId}-error`}
            className="text-xs"
            style={{ color: "var(--app-red)" }}
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"
