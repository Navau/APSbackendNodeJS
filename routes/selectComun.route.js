const express = require("express");
const controller = require("../controllers/SelectComun.controller");
const md_auth = require("../middleware/token.middleware");

const api = express.Router();

api.post(
  "/",
  [md_auth.AsegurarAutenticacionConToken],
  controller.Escogerinterno
);

module.exports = api;
