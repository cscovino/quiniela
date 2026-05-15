import React from 'react';
import './Typography.css';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';

export interface TypographyProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

const variantMap: Record<TypographyVariant, { tag: string; className: string }> = {
  h1: { tag: 'h1', className: 'typography--h1' },
  h2: { tag: 'h2', className: 'typography--h2' },
  h3: { tag: 'h3', className: 'typography--h3' },
  h4: { tag: 'h4', className: 'typography--h4' },
  body: { tag: 'p', className: 'typography--body' },
  small: { tag: 'p', className: 'typography--small' },
  caption: { tag: 'span', className: 'typography--caption' },
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  children,
  className = '',
  as,
}) => {
  const { tag: defaultTag, className: variantClass } = variantMap[variant];
  const Component = as || defaultTag;

  return <Component className={`typography ${variantClass} ${className}`}>{children}</Component>;
};
