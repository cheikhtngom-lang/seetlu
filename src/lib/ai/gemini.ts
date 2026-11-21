import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import type { MetierKey } from '@/lib/domain/metiers';
import { promptAnalyseProduit, promptMessage, promptPourquoi } from './prompts';
import { AiQuotaError, type AiProvider } from './provider';
import { schemaAnalyseProduit, schemaMessage, schemaPourquoi } from './schemas';

const DELAI_QUOTA_PAR_DEFAUT_S = 60;

/** Transforme une erreur du SDK : statut 429 → AiQuotaError (délai lu dans retryDelay). */
export function mapperErreurGemini(e: unknown): Error {
  const statut = (e as { status?: unknown } | null)?.status;
  const message = (e as { message?: unknown } | null)?.message;
  if (statut === 429) {
    const delai = typeof message === 'string' ? /retryDelay\\?"\s*:\s*\\?"(\d+)/.exec(message)?.[1] : undefined;
    return new AiQuotaError(delai ? Number(delai) : DELAI_QUOTA_PAR_DEFAUT_S);
  }
  if (e instanceof Error) return e;
  return new Error(typeof message === 'string' ? message : String(e));
}

export class GeminiAi implements AiProvider {
  private client: GoogleGenAI;

  constructor(
    apiKey: string,
    private model: string,
  ) {
    this.client = new GoogleGenAI({ apiKey });
  }

  private async json<S extends z.ZodType>(prompt: string, schema: S): Promise<z.infer<S>> {
    try {
      const res = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: z.toJSONSchema(schema),
          temperature: 0.4,
        },
      });
      return schema.parse(JSON.parse(res.text ?? ''));
    } catch (e) {
      throw mapperErreurGemini(e);
    }
  }

  async analyserProduit(i: Parameters<AiProvider['analyserProduit']>[0]) {
    const r = await this.json(promptAnalyseProduit(i), schemaAnalyseProduit);
    return { ...r, metiers: r.metiers as MetierKey[] };
  }

  expliquerProspect(i: Parameters<AiProvider['expliquerProspect']>[0]) {
    return this.json(promptPourquoi(i), schemaPourquoi);
  }

  ecrireMessage(i: Parameters<AiProvider['ecrireMessage']>[0]) {
    return this.json(promptMessage(i), schemaMessage);
  }
}
