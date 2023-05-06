const pool = require("../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  ObtenerColumnasDeTablaUtil,
} = require("../utils/consulta.utils");

const {
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respErrorServidor500END,
} = require("../utils/respuesta.utils");

// OBTENER TODOS LOS LOGDET DE SEGURIDAD
function CabecerasTabla(req, res) {
  const { table, select } = req.body;
  let query = ObtenerColumnasDeTablaUtil(table, { select });
  pool.query(query, (err, result) => {
    if (err) {
      respErrorServidor500END(res, err);
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
  CabecerasTabla,
};
