const express = require("express");
const controller = require("../../controllers/auditoria/fechaOperacion.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

const api = express.Router();

api.post(
  "/",
  [md_auth.AsegurarAutenticacionConToken],
  controller.obtenerFechaOperacion
);

module.exports = api;
