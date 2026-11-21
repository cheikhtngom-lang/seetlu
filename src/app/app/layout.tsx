import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { BarreMobile } from '@/components/shell/BarreMobile';
import { PiedSession } from '@/components/shell/PiedSession';
import { Rail } from '@/components/shell/Rail';

export default function CoqueApp({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <Rail
        pied={
          <Suspense fallback={<span className="block h-8" />}>
            <PiedSession />
          </Suspense>
        }
      />
      <main className="min-w-0 px-4 pt-5 pb-24 sm:px-6 md:px-8 md:pt-7 md:pb-10">{children}</main>
      <BarreMobile />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--encre)',
            border: '1px solid var(--filet)',
            fontFamily: 'var(--font-archivo)',
          },
        }}
      />
    </div>
  );
}
