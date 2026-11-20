export function getErrorMessage(error) {
  if (!error.response) return 'Impossible de joindre le serveur.';
  return error.response.data?.message || 'Une erreur est survenue.';
}
