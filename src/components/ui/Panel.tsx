import { cx } from '@/lib/cx';
import type { ReactNode } from 'react';

/** Zone de travail : un titre, une action éventuelle, un contenu. Filet d'un pixel, pas d'ombre. */
export function Panel({
  titre,
  action,
  children,
  className,
  corps,
}: {
  titre?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  corps?: string;
}) {
  return (
    <section className={cx('rounded-lg border border-filet bg-surface', className)}>
      {titre ? (
        <header className="flex min-h-11 items-center justify-between gap-3 border-b border-filet px-4">
          <h2 className="text-[13px] font-semibold text-encre">{titre}</h2>
          {action}
        </header>
      ) : null}
      <div className={cx('p-4', corps)}>{children}</div>
    </section>
  );
}
