import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  badge,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6 ${className}`}>
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 font-display">
          {icon && <span className="text-blue-600 dark:text-blue-500 shrink-0">{icon}</span>}
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {(badge || action) && (
        <div className="flex items-center gap-3 shrink-0">
          {badge}
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
