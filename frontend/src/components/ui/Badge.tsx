import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'emerald' | 'amber' | 'red' | 'zinc';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'blue', children, ...props }) => {
  const variants = {
    blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-500/30',
    emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    amber: 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
    red: 'bg-red-100 dark:bg-red-500/20 text-red-900 dark:text-red-300 border-red-300 dark:border-red-500/30',
    zinc: 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white border-slate-300 dark:border-zinc-700'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border tracking-wide shadow-xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
