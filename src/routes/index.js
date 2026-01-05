'use strict';

const express = require('express');
const health = require('./health');
const imapImport = require('./imapImport');

const router = express.Router();

router.use('/health', health);
router.use('/imap', imapImport);

module.exports = router;
