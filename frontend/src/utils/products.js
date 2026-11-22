// L'API renvoie parfois l'identifiant, parfois l'objet matière : on accepte les deux
export const materialIdOf = (line) => line.matiere?._id ?? line.matiere;
