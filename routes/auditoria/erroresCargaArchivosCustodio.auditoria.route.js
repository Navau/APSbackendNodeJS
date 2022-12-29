const express = require("express");
const controller = require("../../controllers/auditoria/erroresCargaArchivosCustodio.auditoria.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

const api = express.Router();

api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
api.post(
  "/ValorMaximo",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ValorMaximo
);
api.post("/Buscar", [md_auth.AsegurarAutenticacionConToken], controller.Buscar);
api.post(
  "/Escoger",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Escoger
);
api.post(
  "/Reporte",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Reporte
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
api.post(
  "/Deshabilitar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Deshabilitar
);

module.exports = api;
