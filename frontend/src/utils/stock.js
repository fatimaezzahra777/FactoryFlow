export const stockOf = (material) => material.stock?.quantite ?? 0;
// Même règle que le backend (findBelowThreshold) : stock <= seuil d'alerte
export const isLow = (material) => stockOf(material) <= material.seuilAlerte;
