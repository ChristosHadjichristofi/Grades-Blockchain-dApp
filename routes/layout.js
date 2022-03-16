const express = require('express');
const layoutController = require('../controllers/layout');

const router = express.Router();

router.get('/', layoutController.getIndex);
router.get('/form', layoutController.getForm);
router.get('/courses', layoutController.getCourses);
router.get('/course/:code', layoutController.getCourseByID);
router.get('/add/node/form', layoutController.getAddNodeForm);
router.get('/show/participants', layoutController.getShowParticipants);

module.exports = router;