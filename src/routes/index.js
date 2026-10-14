const router = require('express').Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/installation', require('./installationRoutes'));
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));

module.exports = router;
