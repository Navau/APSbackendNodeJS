const express = require("express");
const controller = require("../../controllers/auditoria/erroresCargaArchivosPensionesSeguros.auditoria.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

const api = express.Router();

api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
api.post("/Buscar", [md_auth.AsegurarAutenticacionConToken], controller.Buscar);
api.post(
  "/Escoger",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Escoger
);
api.post(
  "/EscogerValidacionPreliminar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.EscogerValidacionPreliminar
);
api.post(
  "/Reporte",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Reporte
);
api.post(
  "/EnviarCorreo",
  [md_auth.AsegurarAutenticacionConToken],
  controller.EnviarCorreo
);
api.post(
  "/Insertar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Insertar
);
api.post(
  "/Actualizar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Actualizar
);

module.exports = api;
