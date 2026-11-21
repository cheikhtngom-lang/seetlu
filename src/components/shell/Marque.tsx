/** Mot-marque : trois bains montants puis « Seetlu » en Archivo resserré. */
export function Marque({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-end gap-2 ${className}`}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <rect x="0" y="8" width="4" height="10" rx="1" fill="var(--bain-1)" />
        <rect x="7" y="4" width="4" height="14" rx="1" fill="var(--bain-2)" />
        <rect x="14" y="0" width="4" height="18" rx="1" fill="currentColor" />
      </svg>
      <span className="text-[21px] leading-none font-bold tracking-[-0.03em] [font-stretch:88%]">Seetlu</span>
    </span>
  );
}
