'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change, e.g. +4.2 or -1.5
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  iconColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
  className,
}: StatCardProps) {
  const isPositive = typeof change === 'number' && change > 0;
  const isNegative = typeof change === 'number' && change < 0;

  return (
    <Card className={cn('border-border/80 shadow-xs hover:shadow-sm transition-shadow', className)}>
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </p>

          {typeof change === 'number' && (
            <div className="flex items-center gap-1.5 pt-1 text-xs">
              {isPositive ? (
                <span className="flex items-center font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                  +{change}%
                </span>
              ) : isNegative ? (
                <span className="flex items-center font-semibold text-rose-600 dark:text-rose-400">
                  <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
                  {change}%
                </span>
              ) : (
                <span className="flex items-center font-medium text-slate-500">
                  <Minus className="h-3.5 w-3.5 mr-0.5" />
                  0%
                </span>
              )}
              <span className="text-muted-foreground text-[11px]">
                {changeLabel}
              </span>
            </div>
          )}
        </div>

        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0', iconColor)}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

