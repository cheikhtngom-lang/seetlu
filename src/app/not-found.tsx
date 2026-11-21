import Link from 'next/link';
import { Marque } from '@/components/shell/Marque';
import { classesBouton } from '@/components/ui/Button';

export default function PageIntrouvable() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="flex max-w-[44ch] flex-col items-start gap-5">
        <Marque className="text-encre" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Page introuvable</h1>
          <p className="text-sm text-encre-2">Cette adresse ne mène à rien dans Seetlu. Le lien est peut-être incomplet.</p>
        </div>
        <Link href="/app" className={classesBouton('primaire')}>
          Aller au tableau de bord
        </Link>
      </div>
    </main>
  );
}
