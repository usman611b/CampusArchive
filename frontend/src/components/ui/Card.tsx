import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverEffect = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm transition-colors text-slate-900 dark:text-zinc-100',
        hoverEffect && 'hover:border-blue-400/50 dark:hover:border-zinc-700 hover:shadow-lg hover:-translate-y-0.5 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
