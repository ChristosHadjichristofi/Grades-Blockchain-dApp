const express = require('express');
const apiController = require('../controllers/api');

const router = express.Router();

router.post('/store/form', apiController.postStoreForm);
router.post('/get/all', apiController.postCoursesData);

module.exports = router;