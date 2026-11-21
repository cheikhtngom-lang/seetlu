/** Où renvoyer une requête selon la page demandée et la présence d'une session. null = laisser passer. */
export function redirectionAcces(chemin: string, connecte: boolean): string | null {
  if (chemin === '/connexion') return connecte ? '/app' : null;
  if ((chemin === '/app' || chemin.startsWith('/app/')) && !connecte) {
    return `/connexion?suite=${encodeURIComponent(chemin)}`;
  }
  return null;
}

/** N'accepte comme destination après connexion qu'un chemin interne de l'app (pas de redirection ouverte). */
export function suiteSure(suite: string | null | undefined): string {
  if (!suite || !suite.startsWith('/app') || suite.startsWith('//') || suite.includes('\\')) return '/app';
  return suite;
}
