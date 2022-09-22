const pool = require("../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ObtenerColumnasDeTablaUtil,
  EscogerInternoUtil,
} = require("../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
} = require("../utils/respuesta.utils");

//FUNCION PARA OBTENER TODOS LOS LOGDET DE SEGURIDAD
function Escogerinterno(req, res) {
  const { table, select, where, innerjoin, orderby } = req.body;
  let query = EscogerInternoUtil(table, { select, innerjoin, where, orderby });
  pool.query(query, (err, result) => {
    if (err) {
      respErrorServidor500(res, err);
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        respResultadoCorrecto200(res, result);
      }
    }
  });
}

module.exports = {
  Escogerinterno,
};
