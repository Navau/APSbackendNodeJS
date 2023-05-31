const express = require("express");
const controller = require("../../controllers/seguridad/rol.seguridad.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

const api = express.Router();

api.get(
  "/ObtenerRol",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ObtenerRol
);
api.post(
  "/ObtenerRolPost",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ObtenerRol
);
api.get(
  "/ObtenerMenuAng",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ObtenerMenuAng
);
api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
api.post("/Buscar", [md_auth.AsegurarAutenticacionConToken], controller.Buscar);
api.post(
  "/Escoger",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Escoger
);
api.get(
  "/InfoUsuario",
  [md_auth.AsegurarAutenticacionConToken],
  controller.InfoUsuario
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
