'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/cx';
import { NAVIGATION, estActif } from './navigation';

/** Sous 768 px, le rail devient une barre en bas d'écran. */
export function BarreMobile() {
  const chemin = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cuve-2 bg-cuve pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAVIGATION.map(({ cle, href, court, icone: Icone }) => {
          const actif = estActif(href, chemin);
          return (
            <li key={cle}>
              <Link
                href={href}
                aria-current={actif ? 'page' : undefined}
                className={cx(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium focus-visible:outline-ocre-vif',
                  actif ? 'text-cuve-encre' : 'text-cuve-encre-2',
                )}
              >
                <Icone size={20} strokeWidth={1.75} className={actif ? 'text-ocre-vif' : undefined} aria-hidden="true" />
                {court}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
