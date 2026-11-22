const Joi = require('joi');
const { ORDER_STATUS } = require('../utils/constants');

const objectId = Joi.string().hex().length(24);

const linesSchema = Joi.array()
  .items(
    Joi.object({
      produit: objectId.required(),
      quantite: Joi.number().greater(0).required(), // strictement positive
    })
  )
  .min(1)
  .unique('produit')
  .messages({
    'array.min': 'Un ordre doit contenir au moins un produit',
    'array.unique': "Un produit ne peut figurer qu'une seule fois dans un ordre",
  });

const createSchema = Joi.object({
  lines: linesSchema.required(),
  operator: objectId.allow(null),
});

const updateSchema = Joi.object({
  lines: linesSchema,
  operator: objectId.allow(null),
}).min(1);

const listQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(ORDER_STATUS)),
  produit: objectId,
  operator: objectId,
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = { createSchema, updateSchema, listQuerySchema };
