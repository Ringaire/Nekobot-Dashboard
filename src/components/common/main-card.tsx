import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MainCardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function MainCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: MainCardProps) {
  const hasHeader = title || actions;
  return (
    <Card className={cn('gap-0 py-0', className)}>
      {hasHeader && (
        <CardHeader className="flex flex-row items-center justify-between gap-2 py-4">
          <div className="space-y-1">
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn('py-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
