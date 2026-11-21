'use client';

/** Date du jour à Dakar, calculée dans le navigateur (valeur instable, hors pré-rendu). */
export function DateDuJour({ className }: { className?: string }) {
  const texte = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Dakar',
  }).format(new Date());
  return (
    <p className={className} suppressHydrationWarning>
      {texte.charAt(0).toUpperCase() + texte.slice(1)}
    </p>
  );
}
