const express = require("express");
const controller = require("../controllers/reportePrueba.controller");
const md_auth = require("../middleware/token.middleware");

const api = express.Router();

api.post("/", [md_auth.AsegurarAutenticacionConToken], controller.Reporte);

module.exports = api;
