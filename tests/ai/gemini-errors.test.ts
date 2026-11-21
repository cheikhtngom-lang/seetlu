import { describe, expect, test } from 'vitest';
import { AiQuotaError } from '@/lib/ai/provider';
import { mapperErreurGemini } from '@/lib/ai/gemini';

describe('mapperErreurGemini', () => {
  test('une 429 devient AiQuotaError avec le délai demandé', () => {
    const e = mapperErreurGemini({ status: 429, message: '{"error":{"details":[{"retryDelay":"37s"}]}}' });
    expect(e).toBeInstanceOf(AiQuotaError);
    expect((e as AiQuotaError).reessayerDansS).toBe(37);
  });

  test('une 429 sans délai attend 60 s', () => {
    expect((mapperErreurGemini({ status: 429, message: 'quota' }) as AiQuotaError).reessayerDansS).toBe(60);
  });

  test('une 500 n’est pas une erreur de quota', () => {
    const e = mapperErreurGemini({ status: 500, message: 'boom' });
    expect(e).not.toBeInstanceOf(AiQuotaError);
    expect(e).toBeInstanceOf(Error);
  });

  test('une valeur qui n’est pas une erreur devient une Error', () => {
    expect(mapperErreurGemini('texte')).toBeInstanceOf(Error);
  });
});
