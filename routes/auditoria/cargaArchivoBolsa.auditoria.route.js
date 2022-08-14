const express = require("express");
const controller = require("../../controllers/auditoria/cargaArchivoBolsa.auditoria.controller");
const md_auth = require("../../middleware/token.middleware");

const api = express.Router();

api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
api.post(
  "/ValorMaximo",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ValorMaximo
);
api.post(
  "/UltimaCarga",
  [md_auth.AsegurarAutenticacionConToken],
  controller.UltimaCarga
);
api.post(
  "/TipoDeCambio",
  [md_auth.AsegurarAutenticacionConToken],
  controller.tipoDeCambio
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
api.post(
  "/Deshabilitar",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Deshabilitar
);

module.exports = api;
