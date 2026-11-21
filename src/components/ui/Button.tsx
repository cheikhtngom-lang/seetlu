import { cx } from '@/lib/cx';
import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primaire' | 'clair' | 'fantome' | 'sur-cuve' | 'danger';

const VARIANTES: Record<Variante, string> = {
  primaire: 'bg-primaire text-primaire-encre hover:bg-primaire-survol',
  clair: 'bg-surface text-encre border border-filet-fort hover:border-bain-2',
  fantome: 'text-encre-2 hover:text-encre hover:bg-surface-2',
  'sur-cuve': 'bg-cuve-encre text-cuve hover:bg-white',
  danger: 'bg-surface text-rouge border border-filet-fort hover:border-rouge',
};

export const classesBouton = (variante: Variante = 'primaire', taille: 'normal' | 'petit' = 'normal') =>
  cx(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none',
    'transition-[transform,background-color,border-color,color] duration-150 ease-[var(--ease-sortie)]',
    'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
    taille === 'petit' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
    VARIANTES[variante],
  );

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; taille?: 'normal' | 'petit' };

export function Button({ variante, taille, className, type = 'button', ...reste }: Props) {
  return <button type={type} className={cx(classesBouton(variante, taille), className)} {...reste} />;
}
