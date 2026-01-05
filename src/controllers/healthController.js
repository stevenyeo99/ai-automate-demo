'use strict';

const { healthService } = require('../services');

function getHealth(req, res) {
  const status = healthService.getHealthStatus();
  res.json(status);
}

module.exports = {
  getHealth
};
