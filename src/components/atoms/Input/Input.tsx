import React from 'react';
import './Input.css';

export type InputVariant = 'default' | 'error' | 'success';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const hasError = variant === 'error' || error;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
        </label>
      )}
      <input id={inputId} className={`input input--${hasError ? 'error' : variant}`} {...props} />
      {(error || helperText) && (
        <span className={`input__helper ${hasError ? 'input__helper--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};
