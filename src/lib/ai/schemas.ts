import { z } from 'zod';
import { METIER_KEYS } from '@/lib/domain/metiers';

export const schemaAnalyseProduit = z.object({
  nom: z.string().min(1),
  resume: z.string().min(1),
  metiers: z.array(z.enum(METIER_KEYS as [string, ...string[]])).min(1),
  arguments: z.array(z.string().min(1)).length(3),
  prix: z.string().nullable(),
});

export const schemaPourquoi = z.object({ pourquoi: z.string().min(1) });

export const schemaMessage = z.object({ texte: z.string().min(1) });
