import React from 'react';

export function Card({
  children,
  className = '',
  hover = false,
  highlight = false,
  ...props
}) {
  const baseClasses = "rounded-3xl p-8 md:p-10 relative w-full box-border h-full group";
  
  const bgClasses = highlight 
    ? "bg-surface-container border-2 border-primary shadow-sm" 
    : "bg-surface-container-low border border-outline/20 shadow-sm";
    
  const hoverClasses = hover ? "hover:bg-surface-container transition-colors" : "";
  
  const classes = `${baseClasses} ${bgClasses} ${hoverClasses} ${className}`;
  const hoverProps = hover ? { 'data-gsap-hover': 'card' } : {};

  return (
    <div className={classes} {...hoverProps} {...props}>
      {hover && (
        <div 
          data-gsap="card-glow" 
          className="absolute inset-0 pointer-events-none opacity-0 rounded-3xl z-0" 
        />
      )}
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`mb-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`relative z-10 flex flex-col h-full justify-between items-stretch gap-8 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
