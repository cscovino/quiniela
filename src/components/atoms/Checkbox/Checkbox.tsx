import type { FC, InputHTMLAttributes } from 'react';
import { useId } from 'react';

import './Checkbox.css';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: FC<CheckboxProps> = ({ label, id, className = '', ...props }) => {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <label className={`checkbox-wrapper ${className}`} htmlFor={checkboxId}>
      <input type="checkbox" id={checkboxId} className="checkbox" {...props} />
      <span className="checkbox__indicator" />
      {label && <span className="checkbox__label">{label}</span>}
    </label>
  );
};
