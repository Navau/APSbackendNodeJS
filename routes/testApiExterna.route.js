const express = require("express");
const controller = require("../controllers/testApiExterna.controller");
const md_auth = require("../middleware/token.middleware");

const api = express.Router();

api.get("/", controller.TestEstadoJWT);

module.exports = api;
