import React from 'react';
import './Checkbox.css';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, className = '', ...props }) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  return (
    <label className={`checkbox-wrapper ${className}`} htmlFor={checkboxId}>
      <input type="checkbox" id={checkboxId} className="checkbox" {...props} />
      <span className="checkbox__indicator" />
      {label && <span className="checkbox__label">{label}</span>}
    </label>
  );
};
