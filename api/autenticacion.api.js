const {
  obtenerJwtEstadoApi,
  obtenerTokenApi,
  obtenerInfoUsuarioApi,
  actualizarContraseñaUsuarioApi,
} = require("../services/apsApiExterna.service");

async function estadoJWT() {
  try {
    const resultApi = await obtenerJwtEstadoApi();
    return resultApi?.result;
  } catch (err) {
    throw err;
  }
}

async function obtenerToken(res, data, numeroDeIntentos, ip) {
  try {
    const resultApi = await obtenerTokenApi(data);
    return resultApi?.result;
  } catch (err1) {
    const { usuario, password } = data;
    try {
      const aux = await numeroDeIntentos(res, usuario, password, ip);
      if (aux.ok === false) {
        aux.resp();
        return null;
      }
    } catch (err2) {
      throw err2;
    }
    throw err1;
  }
}

async function obtenerInfoUsuario(token, data) {
  try {
    const resultApi = await obtenerInfoUsuarioApi(token, data);
    return resultApi?.result;
  } catch (err) {
    throw err;
  }
}

async function actualizarContraseñaUsuario(token, data) {
  try {
    const resultApi = await actualizarContraseñaUsuarioApi(token, data);
    return resultApi?.result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  estadoJWT,
  obtenerToken,
  obtenerInfoUsuario,
  actualizarContraseñaUsuario,
};
