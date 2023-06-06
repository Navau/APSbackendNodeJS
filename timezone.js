// timezone.js

const { DateTime } = require("luxon");

// Definir la zona horaria deseada
const timezone = "America/La_Paz";

// Crear una función que devuelve una instancia de DateTime en la zona horaria especificada
const getDateTime = () => DateTime.now().setZone(timezone);

module.exports = { getDateTime };
