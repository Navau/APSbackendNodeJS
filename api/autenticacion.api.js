const {
  obtenerJwtEstadoApi,
  obtenerTokenApi,
  obtenerInfoUsuarioApi,
  actualizarContraseñaUsuarioApi,
} = require("../services/apsApiExterna.service");

async function estadoJWTAPS() {
  try {
    const resultApi = await obtenerJwtEstadoApi();
    return resultApi?.result;
  } catch (err) {
    throw err;
  }
}

async function obtenerTokenAPS(payload) {
  try {
    const resultApi = await obtenerTokenApi(payload);
    return resultApi?.result;
  } catch (err1) {
    throw err1;
  }
}

async function obtenerInfoUsuarioAPS(token, payload) {
  try {
    const resultApi = await obtenerInfoUsuarioApi(token, payload);
    return resultApi?.result || undefined;
  } catch (err) {
    throw err;
  }
}

async function actualizarContraseñaUsuarioAPS(token, data) {
  try {
    const resultApi = await actualizarContraseñaUsuarioApi(token, data);
    return resultApi?.result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  estadoJWTAPS,
  obtenerTokenAPS,
  obtenerInfoUsuarioAPS,
  actualizarContraseñaUsuarioAPS,
};
