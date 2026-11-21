import { cx } from '@/lib/cx';
import { LIBELLES_PRIORITE, niveauBain, type NiveauBain } from '@/lib/domain/libelles';
import type { Priorite } from '@/lib/domain/score';

const TEINTES: Record<NiveauBain, string> = { 1: 'bg-bain-1', 2: 'bg-bain-2', 3: 'bg-bain-3' };

/**
 * Marque de bains : trois traits verticaux, d'autant plus nombreux et profonds que la
 * priorité est haute. La forme (nombre de traits) porte l'information autant que la teinte.
 * `reserve` dessine un commerce désinscrit : non teint, contour pointillé.
 */
export function Bains({
  niveau,
  reserve = false,
  taille = 'normal',
  className,
}: {
  niveau: NiveauBain;
  reserve?: boolean;
  taille?: 'normal' | 'grand';
  className?: string;
}) {
  const h = taille === 'grand' ? 'h-6 w-[7px]' : 'h-4 w-[5px]';
  return (
    <span className={cx('inline-flex items-end gap-[3px]', className)} aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cx(
            h,
            'rounded-[2px]',
            reserve
              ? 'border border-dashed border-encre-3'
              : i <= niveau
                ? TEINTES[niveau]
                : 'border border-filet-fort',
          )}
        />
      ))}
    </span>
  );
}

export function PrioriteBains({ priorite, avecLibelle = false }: { priorite: Priorite; avecLibelle?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" title={LIBELLES_PRIORITE[priorite]}>
      <Bains niveau={niveauBain(priorite)} />
      {avecLibelle ? (
        <span className="text-[13px] text-encre-2">{LIBELLES_PRIORITE[priorite]}</span>
      ) : (
        <span className="sr-only">{LIBELLES_PRIORITE[priorite]}</span>
      )}
    </span>
  );
}
