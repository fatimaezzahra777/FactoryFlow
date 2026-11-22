const router = require('express').Router();
const controller = require('../controllers/orderController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constants');
const { createSchema, updateSchema, listQuerySchema } = require('../validators/orderValidator');

router.use(authenticate);

// Routes fixes AVANT /:id, sinon "stats" serait lu comme un identifiant
router.get('/stats', authorize(ROLES.ADMIN), controller.stats);
router.get('/operators', authorize(ROLES.ADMIN), controller.listOperators);

router.post('/', authorize(ROLES.ADMIN), validate(createSchema), controller.create);
router.get('/', authorize(ROLES.ADMIN, ROLES.OPERATEUR), validate(listQuerySchema, 'query'), controller.list);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.OPERATEUR), controller.getById);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateSchema), controller.update);
router.post('/:id/cancel', authorize(ROLES.ADMIN), controller.cancel);

// L'exécution est réservée à l'Opérateur, sur ses propres ordres
router.post('/:id/start', authorize(ROLES.OPERATEUR), controller.start);
router.post('/:id/complete', authorize(ROLES.OPERATEUR), controller.complete);

module.exports = router;
