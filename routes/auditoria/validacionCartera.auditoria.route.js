const express = require("express");
const controller = require("../../controllers/auditoria/validacionCartera.auditoria.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

const api = express.Router();

api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
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
api.post(
  "/ReporteExito",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ReporteExito
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
