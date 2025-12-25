import React, { ButtonHTMLAttributes } from 'react';

// Button Component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    icon,
    ...props 
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-primary text-black hover:bg-primary_hover shadow-[0_0_15px_rgba(0,220,130,0.3)]",
        secondary: "bg-surface text-white border border-white/10 hover:bg-secondary hover:border-white/20",
        ghost: "bg-transparent text-muted hover:text-white hover:bg-white/5",
        outline: "bg-transparent border border-primary text-primary hover:bg-primary/10"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};

// Badge Component
export const Badge: React.FC<{ children: React.ReactNode, color?: string }> = ({ children, color = 'bg-primary/10 text-primary' }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color} border border-white/5`}>
        {children}
    </span>
);

// Card Component
export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`glass-panel rounded-xl p-6 ${className}`}>
        {children}
    </div>
);