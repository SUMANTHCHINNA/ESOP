const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {auditFreezeController} = require('../controllers/auditController');



router.post('/activate',auditFreezeController.activateFreeze);
router.get('/active/:id',auditFreezeController.getActiveFreeze);
router.patch('/deactivate/:id',auditFreezeController.deactivateFreeze);

router.use(middleware);




module.exports = router;