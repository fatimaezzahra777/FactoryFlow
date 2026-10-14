const Stock = require('../models/Stock');

const create = (data, session) =>
  Stock.create([data], { session }).then(([stock]) => stock);

const findByMatiere = (matiereId, session) =>
  Stock.findOne({ matiere: matiereId }).session(session || null);

// Stocks dont la quantité est inférieure ou égale au seuil d'alerte de la matière
const findBelowThreshold = () =>
  Stock.aggregate([
    { $project: { mouvements: 0 } },
    {
      $lookup: {
        from: 'matieres_premieres',
        localField: 'matiere',
        foreignField: '_id',
        as: 'matiere',
      },
    },
    { $unwind: '$matiere' },
    { $match: { $expr: { $lte: ['$quantite', '$matiere.seuilAlerte'] } } },
    { $sort: { quantite: 1 } },
  ]);

module.exports = { create, findByMatiere, findBelowThreshold };
