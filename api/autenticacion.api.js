const {
  obtenerJwtEstadoApi,
  obtenerTokenApi,
  obtenerInfoUsuarioApi,
} = require("../services/apsApiExterna.service");
const {
  respResultadoIncorrectoObjeto200,
  respErrorServidor500END,
} = require("../utils/respuesta.utils");

async function estadoJWT(res) {
  try {
    const resultApi = await obtenerJwtEstadoApi();
    if (resultApi.ok === false) throw resultApi;
    if (resultApi.ok === null) throw resultApi.err;
    return resultApi.result;
  } catch (err) {
    if (err.ok === false) respResultadoIncorrectoObjeto200(res, err, []);
    else respErrorServidor500END(res, err);
  }
}

async function obtenerToken(data, res) {
  try {
    const resultApi = await obtenerTokenApi(data);
    if (resultApi.ok === false) throw result;
    if (resultApi.ok === null) throw resultApi.err;
    return resultApi.result;
  } catch (err) {
    if (err.ok === false) respResultadoIncorrectoObjeto200(res, err, []);
    else respErrorServidor500END(res, err);
  }
}

async function obtenerInfoUsuario(token, data, res) {
  try {
    const resultApi = await obtenerInfoUsuarioApi(token, data);
    if (resultApi.ok === false) throw result;
    if (resultApi.ok === null) throw resultApi.err;
    return resultApi.result;
  } catch (err) {
    if (err.ok === false) respResultadoIncorrectoObjeto200(res, err, []);
    else respErrorServidor500END(res, err);
  }
}

module.exports = {
  estadoJWT,
  obtenerToken,
  obtenerInfoUsuario,
};
