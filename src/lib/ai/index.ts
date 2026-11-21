import { FakeAi } from './fake';
import { GeminiAi } from './gemini';
import type { AiProvider } from './provider';

export * from './provider';

let instance: AiProvider | null = null;

/** IA factice si AI_FAKE=1, sinon Gemini (clé et modèle lus dans l'environnement). */
export function getAi(): AiProvider {
  if (instance) return instance;
  if (process.env.AI_FAKE === '1') return (instance = new FakeAi());
  const cle = process.env.GEMINI_API_KEY;
  const modele = process.env.GEMINI_MODEL;
  if (!cle || !modele) throw new Error('GEMINI_API_KEY et GEMINI_MODEL doivent être définis (ou AI_FAKE=1).');
  return (instance = new GeminiAi(cle, modele));
}
