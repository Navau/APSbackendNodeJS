const express = require("express");
const controller = require("../../controllers/parametro/tipoInstrumento.parametro.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

const api = express.Router();

api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
api.get(
  "/ListarCompleto",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ListarCompleto
);
api.post("/Buscar", [md_auth.AsegurarAutenticacionConToken], controller.Buscar);
api.post(
  "/Escoger",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Escoger
);
api.post(
  "/SiglaDescripcion",
  [md_auth.AsegurarAutenticacionConToken],
  controller.SiglaDescripcion
);
api.post(
  "/TipoInstrumentoDetalle",
  [md_auth.AsegurarAutenticacionConToken],
  controller.TipoInstrumentoDetalle
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
