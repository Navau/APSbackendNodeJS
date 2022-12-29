const { map } = require("lodash");
const moment = require("moment");
const pool = require("../database");
const {
  VerificarPermisoUtil,
  EscogerUtil,
  EscogerInternoUtil,
  InsertarVariosUtil,
  InsertarUtil,
  ValidarIDActualizarUtil,
} = require("../utils/consulta.utils");
const {
  respResultadoVacio404,
  respErrorServidor500END,
} = require("./respuesta.utils");

async function VerificarPermisoTablaUsuario(params) {
  const { table, action, req, res } = params;
  const { id_usuario } = req.user;
  let resultFinal = null;

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
  query = VerificarPermisoUtil("APS_seg_view_permiso_usuario", paramsQuery);
  await pool
    .query(query)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        resultFinal = { result, ok: false };
      } else {
        resultFinal = { result, ok: true };
      }
    })
    .catch((err) => {
      console.log(err);
      resultFinal = { err, ok: false };
    });
  return resultFinal;
}

async function DatosCriticos(params) {
  const { table, action, req, res } = params;
  let resultFinal = null;
  let queryDatosCriticos = EscogerInternoUtil("APS_seg_view_critico", {
    where: [
      {
        key: "tabla",
        value: table,
      },
      {
        key: "accion",
        value: action,
      },
    ],
  });

  await pool
    .query(queryDatosCriticos)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        resultFinal = { result, ok: false };
      } else {
        resultFinal = { result, ok: true };
      }
    })
    .catch((err) => {
      resultFinal = { err, ok: false };
    });

  return resultFinal;
}

async function DatosAnteriores(params) {
  const { table, newID, req, res } = params;
  const { body } = req;
  const idInfo = newID
    ? ValidarIDActualizarUtil(table, body, newID)
    : ValidarIDActualizarUtil(table, body);
  const { id_usuario } = req.user;
  let resultFinal = null;

  let bodyFinal = {
    [idInfo.idKey]: idInfo.idValue,
  };
  // let bodyFinal = body?.password
  //   ? {
  //       [idInfo.idKey]: idInfo.idValue,
  //       password: body?.password,
  //     }
  //   : {
  //       [idInfo.idKey]: idInfo.idValue,
  //     };

  let queryDatosAnteriores = EscogerUtil(table, {
    body: bodyFinal,
  });

  await pool
    .query(queryDatosAnteriores)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        resultFinal = { result, ok: false };
      } else {
        resultFinal = { result, ok: true };
      }
    })
    .catch((err) => {
      resultFinal = { err, ok: false };
    });

  return resultFinal;
}

async function Log(params) {
  const { id_tabla_accion, id_accion, resultAux, req, res } = params;
  const { id_usuario } = req.user;
  let resultFinal = null;

  const queryLogs = InsertarUtil("APS_seg_log", {
    body: {
      id_usuario: id_usuario,
      id_tabla_accion: id_tabla_accion,
      id_accion: id_accion,
      id_registro: 1,
      activo: true,
    },
    returnValue: ["id_log"],
  });

  await pool
    .query(queryLogs)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        resultFinal = { result, ok: false };
      } else {
        resultFinal = { result, ok: true };
      }
    })
    .catch((err) => {
      resultFinal = { err, ok: false };
    });

  return resultFinal;
}

async function LogDet(params) {
  const { id_log, datosAnteriores, req, res } = params;
  const { body } = req;
  const datosNuevos = body;
  let bodyQueryFinal = [];
  let resultFinal = null;

  map(datosNuevos, (item, index) => {
    let valorOriginal = datosAnteriores.result.rows[0][index];
    bodyQueryFinal.push({
      id_log: id_log,
      columna: index,
      valor_original: valorOriginal,
      valor_nuevo: item,
      activo: true,
    });
  });

  console.log(bodyQueryFinal);

  let queryLogsDet = InsertarVariosUtil("APS_seg_log_det", {
    body: bodyQueryFinal,
    returnValue: ["id_log_det"],
  });

  console.log(queryLogsDet);

  await pool
    .query(queryLogsDet)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        resultFinal = { result, ok: false };
      } else {
        resultFinal = { result, ok: true };
      }
    })
    .catch((err) => {
      resultFinal = { err, ok: false };
    });

  return resultFinal;
}

module.exports = {
  VerificarPermisoTablaUsuario,
  DatosCriticos,
  DatosAnteriores,
  Log,
  LogDet,
};
