const express = require("express");
const controller = require("../../../controllers/reportes/seguros/rir.seguros.reportes.controller");
const md_auth = require("../../../middleware/token.middleware");

const api = express.Router();

api.post(
  "/SegurosRIR",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ReporteRIR
);

module.exports = api;
