const express = require('express');
const apiController = require('../controllers/api');

const router = express.Router();

router.post('/store/form', apiController.postStoreForm);
router.get('/get/all', apiController.getCoursesData);

module.exports = router;