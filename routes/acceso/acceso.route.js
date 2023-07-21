const express = require("express");
const controller = require("../../controllers/acceso/acceso.controller");

const api = express.Router();

api.post("/Login", controller.Login);
api.post("/LoginApiExterna", controller.LoginApiExterna);
api.post("/TokenConRol", controller.TokenConRol);
api.post("/CaptchaKey", controller.CaptchaKey);
api.post("/TipoAmbiente", controller.TipoAmbiente);

module.exports = api;
