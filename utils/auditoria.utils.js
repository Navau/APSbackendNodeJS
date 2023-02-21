const { map, forEach } = require("lodash");
const moment = require("moment");
const pool = require("../database");
const {
  VerificarPermisoUtil,
  EscogerUtil,
  EscogerInternoUtil,
  InsertarVariosUtil,
  InsertarUtil,
  ValidarIDActualizarUtil,
} = require("./consulta.utils");
const {
  respResultadoVacio404,
  respErrorServidor500END,
} = require("./respuesta.utils");

async function VerificarPermisoTablaUsuarioAuditoria(params) {
  const { table, action, req, res } = params;
  const { id_usuario } = req.user;

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
  const query = VerificarPermisoUtil(
    "APS_seg_view_permiso_usuario",
    paramsQuery
  );
  return await pool
    .query(query)
    .then((result) => {
      if (result.rowCount > 0) return { ok: true, result };
      else return { ok: false, result };
    })
    .catch((err) => {
      console.log(err);
      return { ok: null, err };
    });
}

async function ObtenerDatosCriticosAuditoria(params) {
  try {
    const { table, action, req, res } = params;
    const queryDatosCriticos = EscogerInternoUtil("APS_seg_view_critico", {
      where: [
        { key: "tabla", value: table },
        { key: "accion", value: action },
      ],
    });

    return await pool
      .query(queryDatosCriticos)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
  } catch (err) {
    return { ok: null, err };
  }
}

async function ObtenerInformacionAnteriorAuditoria(params) {
  try {
    const { nameTable, idInfo, req, res } = params;
    const { body } = req;

    const queryDatosAnteriores = EscogerInternoUtil(nameTable, {
      select: ["*"],
      where: [{ key: idInfo.idKey, value: idInfo.idValue }],
    });

    return await pool
      .query(queryDatosAnteriores)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
  } catch (err) {
    return { ok: null, err };
  }
}

async function LogAuditoria(params) {
  try {
    const { id_registro, id_tabla_accion, id_accion, req, res } = params;
    const { id_usuario } = req.user;

    const queryLogs = InsertarUtil("APS_seg_log", {
      body: {
        id_usuario: id_usuario,
        id_tabla_accion: id_tabla_accion,
        id_accion: id_accion,
        id_registro,
        activo: true,
      },
      returnValue: ["id_log"],
    });

    return await pool
      .query(queryLogs)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
  } catch (err) {
    return { ok: null, err };
  }
}

async function LogDetAuditoria(params) {
  try {
    const { id_log, actualizacion, req, res } = params;
    const { body } = req;
    const datosNuevos = body;
    const queryLogsDet = InsertarVariosUtil("APS_seg_log_det", {
      body: map(datosNuevos, (item, index) => {
        const valorOriginal = actualizacion[0][index];
        return {
          id_log: id_log,
          columna: index,
          valor_original: valorOriginal,
          valor_nuevo: item,
          activo: true,
        };
      }),
      returnValue: ["id_log_det"],
    });
    return await pool
      .query(queryLogsDet)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
  } catch (err) {
    return { ok: null, err };
  }
}

module.exports = {
  VerificarPermisoTablaUsuarioAuditoria,
  ObtenerDatosCriticosAuditoria,
  ObtenerInformacionAnteriorAuditoria,
  LogAuditoria,
  LogDetAuditoria,
};
