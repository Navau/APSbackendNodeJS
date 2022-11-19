const pool = require("../../database");
const { EjecutarProcedimientoSQL } = require("../../utils/consulta.utils");
const {
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");

async function Validar(req, res) {
  const { fecha } = req.body;
  const params = {
    body: {
      fecha,
    },
  };
  const query = EjecutarProcedimientoSQL(`aps_proc_valoracion_cartera`, params);

  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

module.exports = {
  Validar,
};
