const express = require("express");
const controller = require("../../../controllers/reportes/seguros/reporteAPSMallas.seguros.reportes.controller");
const md_auth = require("../../../middleware/token.middleware");

const api = express.Router();

api.post(
  "/Seguros",
  [md_auth.AsegurarAutenticacionConToken],
  controller.APSMallas
);

module.exports = api;
