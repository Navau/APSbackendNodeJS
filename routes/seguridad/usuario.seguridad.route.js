const express = require("express");
const controller = require("../../controllers/seguridad/usuario.seguridad.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

const api = express.Router();

api.post(
  "/InstitucionConIDUsuario",
  [md_auth.AsegurarAutenticacionConToken],
  controller.InstitucionConIDUsuario
);
api.get(
  "/Listar",
  [
    md_auth.AsegurarAutenticacionConToken,
    (req, res, next) =>
      md_permissions.permisoUsuario(req, res, next, basename(__dirname)),
  ],
  controller.Listar
);
api.post("/Buscar", [md_auth.AsegurarAutenticacionConToken], controller.Buscar);
api.post(
  "/Escoger",
  [
    md_auth.AsegurarAutenticacionConToken,
    (req, res, next) =>
      md_permissions.permisoUsuario(req, res, next, basename(__dirname)),
  ],
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
