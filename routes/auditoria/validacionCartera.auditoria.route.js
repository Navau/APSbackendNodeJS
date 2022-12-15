const express = require("express");
const controller = require("../../controllers/auditoria/validacionCartera.auditoria.controller");
const md_auth = require("../../middleware/token.middleware");

const api = express.Router();

api.post(
  "/Validar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Validar
);
api.post(
  "/ObtenerInformacion",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ObtenerInformacion
);

module.exports = api;
