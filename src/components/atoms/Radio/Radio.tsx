import React from 'react';
import './Radio.css';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio: React.FC<RadioProps> = ({ label, id, className = '', ...props }) => {
  const generatedId = React.useId();
  const radioId = id || generatedId;

  return (
    <label className={`radio-wrapper ${className}`} htmlFor={radioId}>
      <input type="radio" id={radioId} className="radio" {...props} />
      <span className="radio__indicator" />
      {label && <span className="radio__label">{label}</span>}
    </label>
  );
};
