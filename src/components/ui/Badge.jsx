import React from 'react';

/**
 * Composant de badge coloré pour les statuts.
 */
const Badge = ({ variant = 'primary', children }) => {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
  };

  return (
    <span className={`badge ${variants[variant] || variants.primary}`}>
      {children}
    </span>
  );
};

export default Badge;
