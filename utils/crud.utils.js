const { size, find, includes, isUndefined } = require("lodash");
const pool = require("../database");
const {
  ListarUtil,
  ListarCamposDeTablaUtil,
  BuscarUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  EliminarUtil,
  EscogerUtil,
  BuscarDiferenteUtil,
} = require("./consulta.utils");
const {
  ObtenerDatosCriticosAuditoria,
  ObtenerInformacionAnteriorAuditoria,
  LogAuditoria,
  LogDetAuditoria,
  VerificarPermisoTablaUsuarioAuditoria,
} = require("./auditoria.utils");
const {
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respDatosNoRecibidos200END,
  respResultadoVacio404END,
  respUsuarioNoAutorizado200END,
  respResultadoIncorrectoObjeto200,
} = require("./respuesta.utils");
const { ValidarDatosValidacion } = require("./validacion.utils");

async function CampoActivoAux(nameTable) {
  const fields = await pool
    .query(ListarCamposDeTablaUtil(nameTable))
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  const existFieldActive = find(fields, (item) =>
    includes(item.column_name, "activo")
  );
  return existFieldActive;
}

// TO DO: Cambiar el nombre de Util por Consulta, por ejemplo de ListarUtil, cambiar a ListarConsulta o ListarQuery
async function ListarCRUD(paramsF) {
  const { req, res, nameTable, nameView } = paramsF;
  try {
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action: "Listar",
      req,
      res,
    });
    if (permiso.ok === null) throw permiso.err;
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res);
      return;
    }
    const query = isUndefined(await CampoActivoAux(nameTable))
      ? ListarUtil(nameView || nameTable, { activo: null })
      : ListarUtil(nameView || nameTable);

    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function BuscarCRUD(paramsF) {
  const { req, res, nameTable } = paramsF;
  try {
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const params = { body };
    if (isUndefined(CampoActivoAux(nameTable))) params.activo = null;
    const query = BuscarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function BuscarDiferenteCRUD(paramsF) {
  const { req, res, nameTable } = paramsF;
  try {
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const params = { body };
    if (isUndefined(CampoActivoAux(nameTable))) params.activo = null;
    const query = BuscarDiferenteUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function EscogerCRUD(paramsF) {
  const { req, res, nameTable } = paramsF;
  try {
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const params = { body };
    if (isUndefined(CampoActivoAux(nameTable))) params.activo = null;
    const query = EscogerUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function InsertarCRUD(paramsF) {
  const { req, res, nameTable, newID = undefined } = paramsF;
  try {
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const validateData = await ValidarDatosValidacion({
      nameTable,
      data: body,
      action: "Insertar",
    });
    if (validateData.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, [], validateData.errors);
      return;
    }
    const params = { body, newID };
    const query = InsertarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(
          res,
          result.rows,
          "Información guardada correctamente"
        );
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ActualizarCRUD(paramsF) {
  const { req, res, nameTable, newID } = paramsF;
  try {
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const validateData = await ValidarDatosValidacion({
      nameTable,
      data: body,
      action: "Actualizar",
    });
    if (validateData.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, [], validateData.errors);
      return;
    }
    const idInfo = ValidarIDActualizarUtil(nameTable, body, newID);
    //#region POR SI EXISTE ALGUN ERROR EN LAS OPERACIONES, SE LLAMA A ESTA FUNCION
    const ActualizarRegistroAInfoAnterior = async (data) => {
      const queryAux = ActualizarUtil(nameTable, {
        body: data,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
        returnValue: ["*"],
      });
      return await pool
        .query(queryAux)
        .then((result) => {
          return { ok: true, result: result.rows };
        })
        .catch((err) => {
          return { ok: null, err };
        });
    };
    //#endregion

    //#region OBTENIENDO INFORMACION ANTERIOR, ESTA INFORMACION SE OBTIENE MEDIANTE EL ID QUE SE QUIERE ACTUALIZAR
    const infoAnterior = await ObtenerInformacionAnteriorAuditoria({
      req,
      res,
      nameTable,
      idInfo,
    });
    if (infoAnterior.ok === false) {
      respResultadoVacio404END(
        res,
        "No existe la información que se desea actualizar"
      );
      return;
    }
    if (infoAnterior.ok === null) throw infoAnterior.err;
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
      return;
    }
    //#endregion

    //#region OBTENIENDO LOS DATOS CRITICOS, PARA REALIZAR LAS OPERACIONES DE AUDITORIA
    const criticos = await ObtenerDatosCriticosAuditoria({
      req,
      res,
      table: nameTable,
      action: "Actualizar",
    });

    if (criticos.ok === null) throw infoAnterior.err;
    //#endregion

    //#region AQUI SE REALIZA LA OPERACION DE ACTUALIZAR EL REGISTRO ESPECIFICADO
    const params = {
      body: body,
      idKey: idInfo.idKey,
      idValue: idInfo.idValue,
      returnValue: ["*"],
    };

    const query = ActualizarUtil(nameTable, params);

    const actualizacion = await pool
      .query(query)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    if (actualizacion.ok === null) throw actualizacion.err;
    //#endregion

    //#region REGISTRANDO EN LAS TABLAS DE LOG Y LOGDET
    // console.log(criticos, infoAnterior);
    if (size(criticos.result) > 0 && size(infoAnterior.result) > 0) {
      console.log("-----------------------------------");
      console.log("======================");
      console.log("REGISTRANDO AUDITORIA");
      console.log("======================");
      console.log("===INICIO AUDITORIA===");
      const idTablaAccion = criticos.result[0].id_tabla_accion;
      const idAccion = criticos.result[0].id_accion;
      const log = await LogAuditoria({
        req,
        res,
        id_registro: idInfo.idValue,
        id_tabla_accion: idTablaAccion ? idTablaAccion : 12,
        id_accion: idAccion,
      });
      if (log.ok === null) {
        const actualizacionAux = await ActualizarRegistroAInfoAnterior(
          actualizacion.result[0]
        );
        if (actualizacionAux.ok === false)
          throw new Error("Error al actualizar a la información anterior");
        else if (actualizacionAux.ok === null) throw actualizacionAux.err;
        else throw log.err;
      }
      if (log.ok === false) {
        const actualizacionAux = await ActualizarRegistroAInfoAnterior(
          actualizacion.result[0]
        );
        if (actualizacionAux.ok === false)
          throw new Error("Error al actualizar a la información anterior");
        else if (actualizacionAux.ok === null) throw actualizacionAux.err;
        else respResultadoVacio404END(res, "No se registro ningún log");
        return;
      }
      const logDet = await LogDetAuditoria({
        req,
        res,
        actualizacion: actualizacion.result,
        id_log: log?.result?.[0].id_log || undefined,
      });
      if (logDet.ok === null) {
        const actualizacionAux = await ActualizarRegistroAInfoAnterior(
          actualizacion.result[0]
        );
        if (actualizacionAux.ok === false)
          throw new Error("Error al actualizar a la información anterior");
        else if (actualizacionAux.ok === null) throw actualizacionAux.err;
        else throw logDet.err;
      }
      if (logDet.ok === false) {
        const actualizacionAux = await ActualizarRegistroAInfoAnterior(
          actualizacion.result[0]
        );
        if (actualizacionAux.ok === false)
          throw new Error("Error al actualizar a la información anterior");
        else if (actualizacionAux.ok === null) throw actualizacionAux.err;
        else respResultadoVacio404END(res, "No se registro ningún log det");
        return;
      }
      console.log("=====FIN AUDITORIA====");
    }
    //#endregion
    respResultadoCorrectoObjeto200(
      res,
      actualizacion.result,
      "Información actualizada correctamente"
    );
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function EliminarCRUD(paramsF) {
  try {
    const { req, res, nameTable } = paramsF;
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const params = { where: body };
    const query = EliminarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(
          res,
          result.rows,
          "Información eliminada correctamente"
        );
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  ListarCRUD,
  BuscarCRUD,
  BuscarDiferenteCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  EliminarCRUD,
};
