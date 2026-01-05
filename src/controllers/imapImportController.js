'use strict';

const { imapImportService } = require('../services');

async function importUnseen(req, res, next) {
  try {
    const result = await imapImportService.importUnseenEmails();
    res.json({ ok: true, result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  importUnseen
};
