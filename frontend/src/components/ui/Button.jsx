import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  asChild = false,
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-label-md rounded-xl transition-[colors,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] active:translate-y-[1px]";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-fixed text-on-primary hover:text-on-primary-fixed shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-primary/50",
    secondary: "bg-surface-variant hover:bg-surface-variant-hover text-on-surface shadow-sm focus-visible:ring-surface-variant/50",
    outline: "border-2 border-primary text-primary hover:bg-primary/5 focus-visible:ring-primary/50",
    ghost: "bg-transparent hover:bg-white/10 text-on-surface focus-visible:ring-white/20"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  const widthClass = fullWidth ? "w-full" : "w-full sm:w-auto";
  
  const classes = `${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthClass} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
