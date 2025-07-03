
'use client';

import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  visible: boolean;
}

export function SplashScreen({ visible }: SplashScreenProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="relative flex flex-col items-center gap-4">
        <Logo className="h-24 w-24 text-primary" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-48 w-48 rounded-full border-2 border-primary/20 animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>
        <p className="font-headline text-3xl font-bold text-primary">UmmahMatch</p>
      </div>
    </div>
  );
}
