const express = require("express");
const controller = require("../../controllers/seguro/seguroArchivo443.seguro.controller");
const md_auth = require("../../middleware/token.middleware");

const api = express.Router();

api.get("/Listar", [md_auth.AsegurarAutenticacionConToken], controller.Listar);
api.post("/Emisor", [md_auth.AsegurarAutenticacionConToken], controller.Emisor);
api.post(
  "/InsertarRentaVariable",
  [md_auth.AsegurarAutenticacionConToken],
  controller.InsertarRentaVariable
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
