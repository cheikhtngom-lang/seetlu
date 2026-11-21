'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/cx';
import { Marque } from './Marque';
import { NAVIGATION, estActif, type CleNav } from './navigation';

/**
 * Rail en indigo de cuve. Chaque entrée montre son volume comme un onglet proportionné :
 * un trait dont la longueur suit le nombre d'éléments de la section.
 */
export function Rail({ volumes = {}, pied }: { volumes?: Partial<Record<CleNav, number>>; pied?: React.ReactNode }) {
  const chemin = usePathname();
  const max = Math.max(1, ...Object.values(volumes).map((v) => v ?? 0));

  return (
    <nav
      aria-label="Navigation principale"
      className="sticky top-0 hidden h-dvh flex-col bg-cuve px-3 pt-6 pb-4 text-cuve-encre md:flex"
    >
      <Link href="/app" className="mb-8 px-2 text-cuve-encre">
        <Marque />
      </Link>

      <ul className="flex flex-col gap-0.5">
        {NAVIGATION.map(({ cle, href, libelle, icone: Icone }) => {
          const actif = estActif(href, chemin);
          const volume = volumes[cle];
          return (
            <li key={cle}>
              <Link
                href={href}
                aria-current={actif ? 'page' : undefined}
                className={cx(
                  'group flex flex-col gap-1.5 rounded-md px-2.5 py-2 transition-colors duration-150 focus-visible:outline-ocre-vif',
                  actif ? 'bg-cuve-2 text-cuve-encre' : 'text-cuve-encre-2 hover:bg-cuve-2/60 hover:text-cuve-encre',
                )}
              >
                <span className="flex items-center gap-2.5 text-[14px] font-medium">
                  <Icone size={17} strokeWidth={1.75} className={actif ? 'text-ocre-vif' : undefined} aria-hidden="true" />
                  <span className="flex-1">{libelle}</span>
                  {volume !== undefined ? <span className="text-[12px] text-cuve-encre-2">{volume}</span> : null}
                </span>
                {volume !== undefined ? (
                  <span className="ml-[27px] block h-[2px] rounded-full bg-cuve-encre/10">
                    <span
                      className="block h-full rounded-full bg-cuve-encre-2/70"
                      style={{ width: `${Math.max(4, (volume / max) * 100)}%` }}
                    />
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto border-t border-cuve-encre/10 px-2 pt-4 text-[13px] text-cuve-encre-2">{pied}</div>
    </nav>
  );
}
