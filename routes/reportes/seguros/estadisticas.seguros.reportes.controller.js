const express = require("express");
const controller = require("../../../controllers/reportes/seguros/estadisticas.seguros.reportes.controller");
const md_auth = require("../../../middleware/token.middleware");

const api = express.Router();

api.post(
  "/Inversiones",
  [md_auth.AsegurarAutenticacionConToken],
  controller.estadisticasInversiones2
);

module.exports = api;
