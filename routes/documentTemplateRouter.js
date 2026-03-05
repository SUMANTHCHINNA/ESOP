const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createDocumentTemplateController,getDefaultTemplateController} = require('../controllers/documentTemplateController')

router.use(middleware);
router.post('/createDocumentTemplate',createDocumentTemplateController)
router.get('/getDefaultTemplate',getDefaultTemplateController)

module.exports = router;