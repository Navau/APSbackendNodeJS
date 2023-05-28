const {
  obtenerJwtEstadoApi,
  obtenerTokenApi,
  obtenerInfoUsuarioApi,
} = require("../services/apsApiExterna.service");

async function estadoJWT() {
  try {
    return await obtenerJwtEstadoApi();
  } catch (err) {
    throw err;
  }
}

async function obtenerToken(data) {
  try {
    return await obtenerTokenApi(data);
  } catch (err) {
    throw err;
  }
}

async function obtenerInfoUsuario(token, data, res) {
  try {
    return await obtenerInfoUsuarioApi(token, data);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  estadoJWT,
  obtenerToken,
  obtenerInfoUsuario,
};
