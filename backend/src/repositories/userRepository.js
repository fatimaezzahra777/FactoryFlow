const User = require('../models/User');
const { ROLES } = require('../utils/constants');

const create = (data, session) =>
  User.create([data], { session }).then(([user]) => user);

const findByEmail = (email) => User.findOne({ email }).select('+passwordHash');

const findById = (id) => User.findById(id);

const findOperators = () => User.find({ role: ROLES.OPERATEUR }).sort({ name: 1 });

module.exports = { create, findByEmail, findById, findOperators };