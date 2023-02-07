const { obtenerJwtEstadoApi } = require("../services/apsApiExterna.service");
const {
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
} = require("../utils/respuesta.utils");

async function TestEstadoJWT(req, res) {
  try {
    const result = await obtenerJwtEstadoApi();
    if (result.ok === null) throw result.err;
    respResultadoCorrectoObjeto200(res, result);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  TestEstadoJWT,
};
