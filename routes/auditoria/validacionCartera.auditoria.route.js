const express = require("express");
const controller = require("../../controllers/auditoria/validacionCartera.auditoria.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

const api = express.Router();

api.post(
  "/Validar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Validar2
);
api.post(
  "/ObtenerInformacion",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ObtenerInformacion
);

module.exports = api;
