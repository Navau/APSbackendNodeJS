const express = require("express");
const controller = require("../../../controllers/reportes/seguros/estadisticas.seguros.reportes.controller");
const md_auth = require("../../../middleware/token.middleware");

const api = express.Router();

api.post(
  "/Inversiones",
  [md_auth.AsegurarAutenticacionConToken],
  controller.estadisticasInversiones3
);
api.post(
  "/NombreReporte",
  [md_auth.AsegurarAutenticacionConToken],
  controller.nombreReporte
);

module.exports = api;
