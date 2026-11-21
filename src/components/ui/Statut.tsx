import { cx } from '@/lib/cx';
import { LIBELLES_STATUT } from '@/lib/domain/libelles';
import type { ProspectStatut } from '@/lib/domain/score';

/** Le pipeline avance en profondeur d'indigo ; seuls « client » et « perdu » sortent de la cuve. */
const STYLES: Record<ProspectStatut, string> = {
  a_contacter: 'bg-surface-2 text-encre-2',
  contacte: 'bg-bain-1/35 text-encre',
  a_repondu: 'bg-bain-2/20 text-encre',
  demo: 'bg-bain-2 text-cuve-encre',
  client: 'bg-vert-fond text-vert',
  perdu: 'bg-surface-2 text-encre-3 line-through decoration-1',
  ne_plus_contacter: 'border border-dashed border-encre-3 text-encre-3',
};

export function Statut({ statut, className }: { statut: ProspectStatut; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-medium whitespace-nowrap',
        STYLES[statut],
        className,
      )}
    >
      {LIBELLES_STATUT[statut]}
    </span>
  );
}
