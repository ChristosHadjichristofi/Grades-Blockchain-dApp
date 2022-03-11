const express = require('express');
const layoutController = require('../controllers/layout');

const router = express.Router();

router.get('/', layoutController.getIndex);
router.get('/form', layoutController.getForm);
router.get('/get/all', layoutController.getData);

module.exports = router;