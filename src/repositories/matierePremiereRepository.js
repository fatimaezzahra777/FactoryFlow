const MatierePremiere = require('../models/MatierePremiere');

const create = (data, session) =>
  MatierePremiere.create([data], { session }).then(([matiere]) => matiere);

const findAll = () =>
  MatierePremiere.find().sort({ name: 1 }).populate({ path: 'stock', select: '-mouvements' });

const findById = (id) =>
  MatierePremiere.findById(id).populate({ path: 'stock', select: '-mouvements' });

const updateById = (id, data) =>
  MatierePremiere.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate({
    path: 'stock',
    select: '-mouvements',
  });

module.exports = { create, findAll, findById, updateById };
