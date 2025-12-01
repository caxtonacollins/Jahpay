import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const loadingVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        primary: 'text-primary',
        secondary: 'text-secondary',
        destructive: 'text-destructive',
        success: 'text-success',
        warning: 'text-warning',
        info: 'text-info',
      },
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        default: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
      },
      fullScreen: {
        true: 'fixed inset-0 h-screen w-screen bg-background/80 backdrop-blur-sm z-50',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

interface LoadingProps extends VariantProps<typeof loadingVariants> {
  className?: string;
  text?: string;
  showText?: boolean;
}

export function Loading({
  className,
  variant,
  size,
  text = 'Loading...',
  showText = false,
  fullScreen = false,
}: LoadingProps) {
  return (
    <div className={cn(
      loadingVariants({ variant, size, fullScreen, className }),
      fullScreen ? 'flex-col space-y-4' : 'space-x-2'
    )}>
      <Loader2 className={cn('animate-spin', loadingVariants({ size, variant }))} />
      {showText && (
        <span className={cn(
          'font-medium',
          fullScreen ? 'text-lg' : 'text-sm',
          {
            'text-primary': variant === 'primary',
            'text-secondary': variant === 'secondary',
            'text-destructive': variant === 'destructive',
            'text-success': variant === 'success',
            'text-warning': variant === 'warning',
            'text-info': variant === 'info',
          }
        )}>
          {text}
        </span>
      )}
    </div>
  );
}

// Skeleton loader component
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

// Loading overlay component
export function LoadingOverlay({
  isLoading,
  children,
  overlayClass,
  ...props
}: {
  isLoading: boolean;
  children: React.ReactNode;
  overlayClass?: string;
} & LoadingProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className={cn(
        'absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg',
        overlayClass
      )}>
        <Loading {...props} />
      </div>
    </div>
  );
}
