const round = (n) => Math.round(n * 1e6) / 1e6;

// Accepte un ObjectId ou un document peuplé
const idOf = (ref) => String(ref?._id ?? ref);

// Besoins calculés pour chaque produit (quantité commandée × quantité unitaire),
// puis additionnés par matière première sur tout l'ordre.
// Retourne [{ matiere, quantite }] : une seule ligne par matière.
const computeRequirements = (lines) => {
  const totals = new Map();
  for (const line of lines) {
    for (const component of line.composition) {
      const key = idOf(component.matiere);
      const entry = totals.get(key) || { matiere: component.matiere, quantite: 0 };
      entry.quantite += line.quantite * component.quantite;
      totals.set(key, entry);
    }
  }
  return [...totals.values()].map((e) => ({ matiere: e.matiere, quantite: round(e.quantite) }));
};

module.exports = { computeRequirements, idOf };
