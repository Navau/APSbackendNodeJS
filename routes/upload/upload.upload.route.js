const express = require("express");
const controller = require("../../controllers/upload/upload.upload.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");
const md_files = require("../../middleware/files.middleware");
const md_files2 = require("../../middleware/validaArchivos.middleware");

const api = express.Router();

api.post(
  "/CargarArchivo",
  [
    md_auth.AsegurarAutenticacionConToken,
    md_files.subirArchivo,
    md_files.validarArchivo,
  ],
  controller.CargarArchivo
);

api.post(
  "/CargarArchivo2",
  [
    md_auth.AsegurarAutenticacionConToken,
    md_files2.subirArchivos,
    md_files2.formatearArchivos,
    md_files2.validarFormatoContenidoDeArchivos,
    md_files2.validarValoresContenidoDeArchivos,
  ],
  controller.CargarArchivo2
);

api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
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
