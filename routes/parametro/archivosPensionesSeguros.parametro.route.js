const express = require("express");
const controller = require("../../controllers/parametro/archivosPensionesSeguros.parametro.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

const api = express.Router();

api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
api.post(
  "/SeleccionarArchivos",
  [md_auth.AsegurarAutenticacionConToken],
  controller.SeleccionarArchivos
);
api.post(
  "/SeleccionarArchivosBolsa",
  [md_auth.AsegurarAutenticacionConToken],
  controller.SeleccionarArchivosBolsa
);
api.post(
  "/SeleccionarArchivosValidar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.SeleccionarArchivosValidar
);
api.post(
  "/SeleccionarArchivosCustodio",
  [md_auth.AsegurarAutenticacionConToken],
  controller.SeleccionarArchivosCustodio2
);
api.post("/Buscar", [md_auth.AsegurarAutenticacionConToken], controller.Buscar);
api.post(
  "/Escoger",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Escoger
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
