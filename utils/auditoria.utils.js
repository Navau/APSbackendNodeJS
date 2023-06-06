const { map, isUndefined, isEmpty } = require("lodash");
const pool = require("../database");
const { getDateTime } = require("../timezone");
const {
  VerificarPermisoUtil,
  EscogerInternoUtil,
  InsertarVariosUtil,
  InsertarUtil,
  EjecutarQuery,
  ActualizarUtil,
} = require("./consulta.utils");

async function VerificarPermisoTablaUsuarioAuditoria(params) {
  try {
    const { table, action, id, req, res } = params;
    const { id_usuario } = req.user;

    const paramsQuery = {
      where: [
        { key: "id_usuario", value: id_usuario },
        { key: "accion", value: action },
      ],
    };
    if (!isUndefined(id))
      paramsQuery.where.push({ key: "id_tabla", value: id });
    else if (!isUndefined(table))
      paramsQuery.where.push({ key: "tabla", value: table });

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
        throw err;
      });
  } catch (err) {
    throw err;
  }
}

async function ObtenerDatosCriticosAuditoria(params) {
  try {
    const { table, action } = params;
    const queryDatosCriticos = EscogerInternoUtil("APS_seg_view_critico", {
      where: [
        { key: "tabla", value: table },
        { key: "accion", value: action },
      ],
    });

    return await EjecutarQuery(queryDatosCriticos);
  } catch (err) {
    throw err;
  }
}

async function ObtenerInformacionAnteriorAuditoria(params) {
  try {
    const { nameTable, idInfo } = params;

    const queryDatosAnteriores = EscogerInternoUtil(nameTable, {
      select: ["*"],
      where: [{ key: idInfo.idKey, value: idInfo.idValue }],
    });

    return await EjecutarQuery(queryDatosAnteriores);
  } catch (err) {
    throw err;
  }
}

async function LogAuditoria(params) {
  const { id_registro, id_tabla_accion, id_accion, req } = params;
  try {
    const { id_usuario } = req.user;

    const queryLogs = InsertarUtil("APS_seg_log", {
      body: {
        id_usuario: id_usuario,
        id_tabla_accion: id_tabla_accion,
        id_accion: id_accion,
        fecha: getDateTime().toFormat("yyyy-MM-dd HH:mm:ss.SSS"),
        id_registro,
        activo: true,
      },
      returnValue: ["id_log"],
    });

    return await EjecutarQuery(queryLogs);
  } catch (err) {
    throw err;
  }
}

async function LogDetAuditoria(params) {
  const { id_log, registroAnterior, req } = params;
  try {
    const { body } = req;
    const datosNuevos = body;
    const queryLogsDet = InsertarVariosUtil("APS_seg_log_det", {
      body: map(datosNuevos, (item, index) => {
        const valorOriginal = registroAnterior?.[index] || undefined;
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
    return await EjecutarQuery(queryLogsDet);
  } catch (err) {
    throw err;
  }
}

//#region POR SI EXISTE ALGUN ERROR EN LAS OPERACIONES, SE LLAMA A ESTA FUNCION
async function ActualizarRegistroAInfoAnterior(nameTable, data, idInfo) {
  try {
    const queryAux = ActualizarUtil(nameTable, {
      body: data,
      idKey: idInfo.idKey,
      idValue: idInfo.idValue,
      returnValue: ["*"],
    });
    return await EjecutarQuery(queryAux);
  } catch (err) {
    throw err;
  }
}
//#endregion

module.exports = {
  VerificarPermisoTablaUsuarioAuditoria,
  ObtenerDatosCriticosAuditoria,
  ObtenerInformacionAnteriorAuditoria,
  LogAuditoria,
  LogDetAuditoria,
  ActualizarRegistroAInfoAnterior,
};
