const express = require("express");
const controller = require("../controllers/testApiExterna.controller");
const md_auth = require("../middleware/token.middleware");

const api = express.Router();

api.get("/EstadoJWT", controller.estadoJWT);
api.post("/ObtenerToken", controller.obtenerToken);
api.get("/ObtenerInfoUsuario", controller.obtenerInfoUsuario);
api.put(
  "/ActualizarContraseniaUsuario",
  controller.actualizarContraseñaUsuario
);

module.exports = api;
