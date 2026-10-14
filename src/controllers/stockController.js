const stockService = require('../services/stockService');
const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');

const addEntry = asyncHandler(async (req, res) => {
  const movement = await stockService.addEntry(req.body, req.user.id);
  success(res, movement, 201);
});

const listMovements = asyncHandler(async (req, res) => {
  paginated(res, await stockService.listMovements(req.query));
});

module.exports = { addEntry, listMovements };