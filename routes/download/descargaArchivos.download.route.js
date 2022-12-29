const express = require("express");
const controller = require("../../controllers/download/descargarArchivos.download.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");
const md_files = require("../../middleware/files.middleware");

const api = express.Router();

api.post(
  "/ListarArchivos",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ListarArchivos
);
api.post(
  "/DescargarArchivos",
  [md_auth.AsegurarAutenticacionConToken],
  controller.DescargarArchivos
);
api.post(
  "/DescargarArchivosPorFecha",
  [md_auth.AsegurarAutenticacionConToken],
  controller.DescargarArchivosPorFecha
);

module.exports = api;
