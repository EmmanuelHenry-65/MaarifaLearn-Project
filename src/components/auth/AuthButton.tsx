import React from 'react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'google';
}

export default function AuthButton({ children, variant = 'primary', className, ...props }: AuthButtonProps) {
  const baseClass = "w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/20",
    secondary: "bg-transparent border border-[rgba(56,78,135,0.3)] text-gray-300 hover:bg-[rgba(56,78,135,0.1)]",
    google: "bg-white text-slate-900 hover:bg-slate-50",
  };

  return (
    <button className={`${baseClass} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
