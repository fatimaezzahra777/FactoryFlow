const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');

const create = asyncHandler(async (req, res) => {
  success(res, await orderService.create(req.body, req.user.id), 201);
});

const list = asyncHandler(async (req, res) => {
  paginated(res, await orderService.list(req.validatedQuery, req.user));
});

const stats = asyncHandler(async (req, res) => {
  success(res, await orderService.stats());
});

const listOperators = asyncHandler(async (req, res) => {
  success(res, await orderService.listOperators());
});

const getById = asyncHandler(async (req, res) => {
  success(res, await orderService.getById(req.params.id, req.user));
});

const update = asyncHandler(async (req, res) => {
  success(res, await orderService.update(req.params.id, req.body));
});

const cancel = asyncHandler(async (req, res) => {
  success(res, await orderService.cancel(req.params.id));
});

const start = asyncHandler(async (req, res) => {
  success(res, await orderService.start(req.params.id, req.user));
});

const complete = asyncHandler(async (req, res) => {
  success(res, await orderService.complete(req.params.id, req.user));
});

module.exports = { create, list, stats, listOperators, getById, update, cancel, start, complete };
