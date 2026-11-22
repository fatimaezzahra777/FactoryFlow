import { materialIdOf } from './products';

const round = (n) => Math.round(n * 1e6) / 1e6;

// Besoins calculés pour chaque produit (quantité × quantité unitaire),
// puis additionnés par matière première sur tout l'ordre.
// lines : [{ produit, quantite }] ; productsById : { id: produit avec composition }
export function computeRequirements(lines, productsById) {
  const totals = {};
  for (const line of lines) {
    const quantity = Number(line.quantite);
    const product = productsById[line.produit];
    if (!product || !(quantity > 0)) continue;
    for (const component of product.composition) {
      const id = materialIdOf(component);
      totals[id] = (totals[id] ?? 0) + quantity * component.quantite;
    }
  }
  return Object.entries(totals).map(([matiere, quantite]) => ({ matiere, quantite: round(quantite) }));
}
