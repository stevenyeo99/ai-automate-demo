'use strict';

const express = require('express');
const { imapImportController } = require('../controllers');

const router = express.Router();

router.post('/import', imapImportController.importUnseen);

module.exports = router;
