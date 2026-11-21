import { cx } from '@/lib/cx';

/** Un chiffre du jour dans une rangée filetée. `chaud` le passe à l'ocre réservée. */
export function Stat({
  valeur,
  libelle,
  detail,
  chaud = false,
}: {
  valeur: number | string;
  libelle: string;
  detail?: string;
  chaud?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 px-4 py-3">
      <span
        className={cx(
          'text-[28px] leading-none font-semibold tracking-[-0.02em] [font-stretch:92%]',
          chaud ? 'text-ocre' : 'text-encre',
        )}
      >
        {valeur}
      </span>
      <span className="truncate text-[13px] text-encre-2">{libelle}</span>
      {detail ? <span className="truncate text-[12px] text-encre-3">{detail}</span> : null}
    </div>
  );
}

export function RangeeStats({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 divide-filet rounded-lg border border-filet bg-surface sm:grid-cols-4 sm:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-filet sm:[&>*]:border-b-0">
      {children}
    </div>
  );
}
