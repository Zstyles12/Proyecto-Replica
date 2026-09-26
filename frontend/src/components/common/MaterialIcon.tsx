import React from 'react';

export interface MaterialIconProps {
  readonly name: string;
  readonly className?: string;
  readonly ariaHidden?: boolean;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  className = '',
  ariaHidden = true,
}) => {
  return (
    <span
      className={`material-symbols-outlined select-none inline-block ${className}`}
      aria-hidden={ariaHidden}
    >
      {name}
    </span>
  );
};
