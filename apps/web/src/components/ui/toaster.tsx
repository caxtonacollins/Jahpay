'use client';

import * as React from 'react';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  // Map our custom types to Radix UI's expected types
  const getVariant = (type?: string) => {
    switch (type) {
      case 'success':
      case 'error':
      case 'warning':
      case 'info':
        return type;
      default:
        return 'default';
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, type, ...props }) {
        const variant = getVariant(type);
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && (
              <ToastAction altText={action.label} onClick={action.onClick}>
                {action.label}
              </ToastAction>
            )}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
