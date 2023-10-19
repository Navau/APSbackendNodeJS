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
api.post(
  "/Desbloquear",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Desbloquear
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
api.post(
  "/ActualizarContraseniaAPS",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ActualizarContraseñaAPS
);

module.exports = api;
