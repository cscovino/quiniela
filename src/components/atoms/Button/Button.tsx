import type { AnchorHTMLAttributes, ButtonHTMLAttributes, FC, ReactNode } from 'react';

import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'gold' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | 'href'> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button: FC<ButtonProps> = (props) => {
  const {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    children,
    className = '',
  } = props;

  const classes = `btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full-width' : ''} ${className}`;
  const content = (
    <>
      {isLoading ? <span className="btn__spinner" /> : null}
      <span className="btn__content">{children}</span>
    </>
  );

  if ('href' in props && props.href !== undefined) {
    const {
      variant: _v,
      size: _s,
      isLoading: _l,
      isDisabled: _id,
      fullWidth: _fw,
      className: _c,
      children: _ch,
      ...anchorProps
    } = props;
    void _v;
    void _s;
    void _l;
    void _id;
    void _fw;
    void _c;
    void _ch;
    return (
      <a className={classes} {...anchorProps}>
        {content}
      </a>
    );
  }

  const {
    variant: _v,
    size: _s,
    isLoading: _l,
    isDisabled: _id,
    fullWidth: _fw,
    className: _c,
    children: _ch,
    disabled,
    ...buttonProps
  } = props;
  void _v;
  void _s;
  void _l;
  void _id;
  void _fw;
  void _c;
  void _ch;

  return (
    <button className={classes} disabled={disabled || isLoading || _id} {...buttonProps}>
      {content}
    </button>
  );
};
