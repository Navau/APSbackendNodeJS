const express = require("express");
const controller = require("../../../controllers/reportes/seguros/estadisticas.seguros.reportes.controller");
const md_auth = require("../../../middleware/token.middleware");

const api = express.Router();

api.post(
  "/Inversiones",
  [md_auth.AsegurarAutenticacionConToken],
  controller.EstadisticasInversiones
);
api.post(
  "/NombreReporte",
  [md_auth.AsegurarAutenticacionConToken],
  controller.NombreReporte
);

module.exports = api;
