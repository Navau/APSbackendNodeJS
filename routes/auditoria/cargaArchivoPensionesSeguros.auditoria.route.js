const express = require("express");
const controller = require("../../controllers/auditoria/cargaArchivoPensionesSeguros.auditoria.controller");
const md_auth = require("../../middleware/token.middleware");
const md_permissions = require("../../middleware/seguridad.middleware");
const { basename } = require("path");

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
  controller.UltimaCarga2
);
api.post(
  "/ReporteEnvio",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ReporteEnvio
);
api.post(
  "/ReporteExito",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ReporteExito
);
api.post(
  "/ReporteReproceso",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ReporteReproceso
);
api.post(
  "/ReporteControlEnvioPorTipoReporte",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ReporteControlEnvioPorTipoReporte
);
api.post(
  "/ReporteControlEnvioPorTipoReporteDescargas",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ReporteControlEnvioPorTipoReporteDescargas
);
api.post(
  "/NombreReporte",
  [md_auth.AsegurarAutenticacionConToken],
  controller.NombreReporte
);
api.post(
  "/Modalidades",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Modalidades
);
api.post("/Buscar", [md_auth.AsegurarAutenticacionConToken], controller.Buscar);
api.post(
  "/Entidades",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Entidades
);
api.post(
  "/HabilitarReproceso",
  [md_auth.AsegurarAutenticacionConToken],
  controller.HabilitarReproceso
);
api.post(
  "/ReporteInversionesContables",
  [md_auth.AsegurarAutenticacionConToken],
  controller.ReporteInversionesContables
);
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
