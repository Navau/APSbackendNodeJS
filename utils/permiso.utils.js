const moment = require("moment");
const pool = require("../database");
const { VerificarPermisoUtil } = require("../utils/consulta.utils");
const {
  respResultadoVacio404,
  respErrorServidor500END,
} = require("./respuesta.utils");

const nameTable = "APS_seg_view_permiso_usuario";

async function VerificarPermisoTablaUsuario(params) {
  const { table, action, req, res } = params;
  const { id_usuario } = req.user;
  let resultPermiso = null;

  const paramsQuery = {
    where: [
      {
        key: "id_usuario",
        value: id_usuario,
      },
      {
        key: "tabla",
        value: table,
      },
      {
        key: "accion",
        value: action,
      },
    ],
  };
  query = VerificarPermisoUtil(nameTable, paramsQuery);
  await pool
    .query(query)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res, "Usuario no Autorizado");
      } else {
        resultPermiso = result;
      }
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
  return resultPermiso;
}

module.exports = {
  VerificarPermisoTablaUsuario,
};
