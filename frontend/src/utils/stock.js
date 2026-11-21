export const stockOf = (material) => material.stock?.quantite ?? 0;
export const isLow = (material) => stockOf(material) < material.seuilAlerte;
