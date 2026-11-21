import type { PageLue } from '@/lib/domain/html-audit';
import type { MetierKey } from '@/lib/domain/metiers';
import type { ScoreResult } from '@/lib/domain/score';

export type AnalyseProduit = {
  nom: string;
  resume: string;
  metiers: MetierKey[];
  /** Exactement 3 arguments clés. */
  arguments: string[];
  prix: string | null;
};

export type ProduitResume = { nom: string; resume: string; arguments: string[]; url: string };
export type PlaceResume = { nom: string; metier: MetierKey; quartier: string | null };

export interface AiProvider {
  analyserProduit(i: { url: string; page: PageLue; descriptionManuelle?: string }): Promise<AnalyseProduit>;
  expliquerProspect(i: { produit: ProduitResume; place: PlaceResume; score: ScoreResult }): Promise<{ pourquoi: string }>;
  ecrireMessage(i: {
    produit: ProduitResume;
    place: PlaceResume;
    manques: string[];
    salutationWolof: boolean;
  }): Promise<{ texte: string }>;
}

/** Quota gratuit atteint : l'appelant peut réessayer après `reessayerDansS` secondes. */
export class AiQuotaError extends Error {
  constructor(public reessayerDansS: number) {
    super('quota');
    this.name = 'AiQuotaError';
  }
}
