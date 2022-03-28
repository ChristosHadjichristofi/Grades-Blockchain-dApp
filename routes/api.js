const express = require('express');
const apiController = require('../controllers/api');

const router = express.Router();

router.post('/store/form', apiController.postStoreForm);
// router.post('/get/all', apiController.postCoursesData);
router.post('/validate', apiController.postValidate);
router.post('/add/node/permissions', apiController.postNodePermissions);
router.post('/vote/:address', apiController.postVote);

module.exports = router;