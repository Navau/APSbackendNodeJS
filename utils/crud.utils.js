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
  EscogerInternoUtil,
  ObtenerRolUtil,
  ObtenerMenuAngUtil,
  FormatearObtenerMenuAngUtil,
  InsertarVariosUtil,
  EjecutarVariosQuerys,
  AsignarInformacionCompletaPorUnaClave,
  formatearQuery,
  EjecutarQuery,
  EjecutarFuncionSQL,
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
  EscogerLlaveClasificadorUtil,
  ObtenerInstitucion,
  ObtenerUsuariosPorRol,
  EjecutarProcedimientoSQL,
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
  respDatosNoRecibidos400,
} = require("./respuesta.utils");
const { ValidarDatosValidacion } = require("./validacion.utils");
const {
  forEach,
  map,
  size,
  find,
  includes,
  isUndefined,
  filter,
  groupBy,
  difference,
  split,
  sortBy,
  toLower,
  minBy,
  maxBy,
  isEmpty,
  uniqBy,
  isNull,
  uniq,
} = require("lodash");
const jwt = require("../services/jwt.service");
const pool = require("../database");
const {
  formatearFecha,
  tipoReporteControlEnvio,
  validateEmail,
  agregarDias,
  agregarMeses,
} = require("./formatearDatos");
const nodemailer = require("nodemailer");
const dayjs = require("dayjs");
require("dayjs/locale/es");

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
async function ListarCompletoCRUD(paramsF) {
  const {
    req,
    res,
    nameTable,
    nameView,
    queryOptions,
    tableOptions = [],
    extraExecuteQueryOptions = {},
  } = paramsF;
  const action = "Listar";
  try {
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
      return;
    }
    const querys = [];
    for await (item of queryOptions) {
      let query = "";
      const tableAux = item.table;
      if (item?.where) {
        delete item.table;
        const queryParams = item;
        query = EscogerInternoUtil(tableAux, queryParams);
      } else {
        const activoAux = await CampoActivoAux(tableAux);
        query = isUndefined(activoAux)
          ? ListarUtil(tableAux, { activo: null })
          : ListarUtil(tableAux);
      }
      querys.push(query);
    }

    const resultQuerys = await EjecutarVariosQuerys(
      querys,
      extraExecuteQueryOptions
    );

    if (resultQuerys.ok === null) throw resultQuerys.result;
    if (resultQuerys.ok === false) throw resultQuerys.errors;

    const resultFinal = AsignarInformacionCompletaPorUnaClave(
      resultQuerys.result,
      tableOptions
    );
    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ListarCRUD(paramsF) {
  const { req, res, nameTable, nameView } = paramsF;
  const action = "Listar";
  try {
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
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
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ListarClasificadorCRUD(paramsF) {
  const { req, res, nameTable, nameView, idClasificadorComunGrupo, valueId } =
    paramsF;
  const action = "Listar";
  try {
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
      return;
    }
    const params = {
      clasificador: true,
      idClasificadorComunGrupo,
      valueId,
    };

    const query = isUndefined(await CampoActivoAux(nameTable))
      ? ListarUtil(nameView || nameTable, { ...params, activo: null })
      : ListarUtil(nameView || nameTable, params);

    await pool
      .query(query)
      .then((result) => {
        let resultFinalAux = result;
        forEach(resultFinalAux.rows, (item, index) => {
          forEach(item, (item2, index2) => {
            if (index2 === "id_clasificador_comun") {
              result.rows[index][valueId] = item2;
              delete result.rows[index][index2];
            }
          });
        });
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function BuscarCRUD(paramsF) {
  const { req, res, nameTable } = paramsF;
  const action = "Buscar";
  try {
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
      return;
    }
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const validateData = await ValidarDatosValidacion({
      nameTable,
      data: body,
      action,
    });
    if (validateData.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, [], validateData.errors);
      return;
    }
    const params = { body };
    const x = await CampoActivoAux(nameTable);
    if (isUndefined(x)) params.activo = null;
    const query = BuscarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function BuscarDiferenteCRUD(paramsF) {
  const { req, res, nameTable } = paramsF;
  const action = "Buscar";
  try {
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
      return;
    }
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const validateData = await ValidarDatosValidacion({
      nameTable,
      data: body,
      action,
    });
    if (validateData.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, [], validateData.errors);
      return;
    }

    const params = { body };
    const x = await CampoActivoAux(nameTable);
    if (isUndefined(x)) params.activo = null;
    const query = BuscarDiferenteUtil(nameTable, params);

    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function EscogerCRUD(paramsF) {
  const { req, res, nameTable } = paramsF;
  const action = "Escoger";
  try {
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
      return;
    }
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const validateData = await ValidarDatosValidacion({
      nameTable,
      data: body,
      action,
    });
    if (validateData.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, [], validateData.errors);
      return;
    }
    const params = { body };
    const activoAux = await CampoActivoAux(nameTable);
    if (isUndefined(activoAux)) params.activo = null;
    const query = EscogerUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function EscogerClasificadorCRUD(paramsF) {
  const {
    req,
    res,
    nameTable,
    idClasificadorComunGrupo,
    valueId,
    nameTableGroup,
  } = paramsF;
  const action = "Escoger";
  try {
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
      return;
    }
    const params = {
      clasificador: true,
      idClasificadorComunGrupo,
      valueId,
    };
    const paramsLlave = {
      idClasificadorComunGrupo,
    };
    const queryLlave = EscogerLlaveClasificadorUtil(
      nameTableGroup,
      paramsLlave
    );
    await pool
      .query(queryLlave)
      .then(async (result) => {
        if (result.rowCount > 0) {
          const query = EscogerUtil(nameTable, {
            ...params,
            key: result.rows[0].llave,
          });
          await pool
            .query(query)
            .then((result) => {
              respResultadoCorrectoObjeto200(res, result.rows);
            })
            .catch((err) => {
              throw err;
            });
        } else
          respResultadoVacioObject200(
            res,
            result.rows,
            `No existe ningún registro que contenga la llave: ${idClasificadorComunGrupo} o ${valueId}`
          );
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function InsertarCRUD(paramsF) {
  const { req, res, nameTable, newID = undefined } = paramsF;
  const action = "Insertar";
  try {
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
      return;
    }
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const validateData = await ValidarDatosValidacion({
      nameTable,
      data: body,
      action,
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
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ActualizarCRUD(paramsF) {
  try {
    const { req, res, nameTable, newID } = paramsF;
    const action = "Actualizar";
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
      return;
    }
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const validateData = await ValidarDatosValidacion({
      nameTable,
      data: body,
      action,
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
    const action = "Eliminar";
    // TO DO: EXTREMO!!! INFORMAR DE ESTO
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(res, null, action, nameTable);
      return;
    }
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }
    const validateData = await ValidarDatosValidacion({
      nameTable,
      data: body,
      action,
    });
    if (validateData.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, [], validateData.errors);
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
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function RealizarOperacionAvanzadaCRUD(paramsF) {
  const {
    req,
    res,
    nameTable,
    nameTableErrors,
    methodName,
    action = undefined,
  } = paramsF;
  try {
    if (!isUndefined(action)) {
      const permiso = await VerificarPermisoTablaUsuarioAuditoria({
        table: nameTable,
        action,
        req,
        res,
      });
      if (permiso.ok === false) {
        respUsuarioNoAutorizado200END(res, null, action, nameTable);
        return;
      }
    }
    //TO DO: Sanitizar las entradas de req.body, hay que crear una funcion en validacion.utils.js, que realize validaciones en yup basadas en las opciones que se le pase.

    const OPERATION = {
      InstitucionConIDUsuario_Usuario: async () => {
        const { id_usuario } = req.body;

        if (!id_usuario) {
          respDatosNoRecibidos400(
            res,
            "La información que se mando no es suficiente, falta el ID de usuario."
          );
          return;
        }
        const params = {
          select: [
            `"APS_seg_usuario".usuario`,
            `"APS_seg_institucion".institucion`,
            `"APS_seg_institucion".sigla`,
            `"APS_seg_institucion".codigo`,
            `"APS_param_clasificador_comun".descripcion`,
          ],
          innerjoin: [
            {
              table: "APS_seg_institucion",
              on: [
                {
                  table: "APS_seg_usuario",
                  key: "id_institucion",
                },
                {
                  table: "APS_seg_institucion",
                  key: "id_institucion",
                },
              ],
            },
            {
              table: "APS_param_clasificador_comun",
              on: [
                {
                  table: "APS_seg_institucion",
                  key: "id_tipo_entidad",
                },
                {
                  table: "APS_param_clasificador_comun",
                  key: "id_clasificador_comun",
                },
              ],
            },
          ],
          where: [{ key: `"APS_seg_usuario".id_usuario`, value: id_usuario }],
        };

        const query = EscogerInternoUtil(nameTable, params);
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      Desbloquear_Usuario: async () => {
        const { id_usuario, bloqueado } = req.body;
        const queryReinicio = ActualizarUtil("APS_seg_intentos_log", {
          body: { activo: false },
          idKey: "id_usuario",
          idValue: id_usuario,
          returnValue: ["*"],
        });
        await pool
          .query(queryReinicio)
          .then(async () => {
            const queryBloqueaUsuario = ActualizarUtil("APS_seg_usuario", {
              body: { bloqueado: bloqueado },
              idKey: "id_usuario",
              idValue: id_usuario,
              returnValue: ["*"],
            });
            const usuarioBloqueado = await pool
              .query(queryBloqueaUsuario)
              .then((result) => {
                return { ok: true, result: result.rows };
              })
              .catch((err) => {
                return { ok: null, err };
              });
            if (usuarioBloqueado.ok === null) throw usuarioBloqueado.err;
            respResultadoCorrectoObjeto200(
              res,
              [],
              `Usuario ${bloqueado ? "bloqueado" : "desbloqueado"} con éxito`
            );
          })
          .catch((err) => {
            throw err;
          });
      },
      ObtenerRol_Rol: async () => {
        const token = req?.headers?.authorization;
        const dataToken = jwt.decodedToken(token);
        if (!dataToken.id_usuario) {
          respDatosNoRecibidos400(
            res,
            "El token no contiene el ID de usuario."
          );
          return;
        }
        const query = ObtenerRolUtil("APS_seg_usuario_rol", dataToken, true);
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      InfoUsuario_Rol: async () => {
        const { id_usuario, id_rol } = req.user;
        const query = EscogerInternoUtil(nameTable, {
          select: [
            `"APS_seg_usuario".id_usuario`,
            `"APS_seg_rol".id_rol`,
            `"APS_seg_usuario".usuario`,
            `"APS_seg_rol".rol`,
            `"APS_seg_rol".descripcion`,
            `"APS_seg_usuario".activo`,
          ],
          innerjoin: [
            {
              table: `APS_seg_usuario_rol`,
              on: [
                {
                  table: `APS_seg_usuario_rol`,
                  key: "id_rol",
                },
                {
                  table: `APS_seg_rol`,
                  key: "id_rol",
                },
              ],
            },
            {
              table: `APS_seg_usuario`,
              on: [
                {
                  table: `APS_seg_usuario`,
                  key: "id_usuario",
                },
                {
                  table: `APS_seg_usuario_rol`,
                  key: "id_usuario",
                },
              ],
            },
          ],
          where: [
            { key: `"APS_seg_usuario".id_usuario`, value: id_usuario },
            { key: `"APS_seg_rol".id_rol`, value: id_rol },
          ],
        });

        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0)
              respResultadoCorrectoObjeto200(res, result.rows);
            else respResultadoIncorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      ObtenerMenuAng_Rol: async () => {
        const token = req?.headers?.authorization;

        const dataToken = jwt.decodedToken(token);
        if (!dataToken.id_usuario) {
          respDatosNoRecibidos400(
            res,
            "El token no contiene el ID de usuario."
          );
          return;
        }
        const querys = ObtenerMenuAngUtil(dataToken);
        await pool
          .query(querys.query)
          .then(async (result1) => {
            await pool
              .query(querys.querydet)
              .then((result2) => {
                if (result2.rowCount > 0) {
                  const resultData = FormatearObtenerMenuAngUtil({
                    result: result1.rows,
                    result2: result2.rows,
                  });
                  respResultadoCorrectoObjeto200(res, resultData);
                } else
                  respResultadoIncorrectoObjeto200(res, { result1, result2 });
              })
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => {
            throw err;
          });
      },
      CambiarPermisos_Permiso: async () => {
        const { permisos, id_rol } = req.body;
        const errors = []; //VARIABLE PARA CONTROLAR LOS QUERYS INICIALES
        //#region TABLA_ACCION
        const queryTablaAccion = EscogerInternoUtil("APS_seg_tabla_accion", {
          select: ["*"],
          where: [{ key: "activo", value: true }],
        });
        const tablaAccion = await pool
          .query(queryTablaAccion)
          .then((result) => {
            return { ok: true, result: result.rows };
          })
          .catch((err) => {
            return { ok: null, err };
          });
        //#endregion
        //#region PERMISOS
        const queryPermisos = EscogerInternoUtil("APS_seg_permiso", {
          select: ["*"],
          where: [{ key: "id_rol", value: id_rol }],
          orderby: {
            field: "id_permiso",
          },
        });
        const permisosDB = await pool
          .query(queryPermisos)
          .then((result) => {
            return { ok: true, result: result.rows };
          })
          .catch((err) => {
            return { ok: null, err };
          });
        //#endregion
        //#region ACCIONES
        const queryAcciones = EscogerInternoUtil("APS_seg_accion", {
          select: ["*"],
          where: [{ key: "activo", value: true }],
        });
        const acciones = await pool
          .query(queryAcciones)
          .then((result) => {
            return { ok: true, result: result.rows };
          })
          .catch((err) => {
            return { ok: null, err };
          });
        //#endregion

        //#region VERIFICACION DE ERRORES DE LOS QUERYS PARA OBTENER LOS DATOS NECESARISO
        forEach([permisosDB, tablaAccion, acciones], (item) => {
          if (item?.err) {
            errors.push({ err: item.err, message: item.err.message });
          }
        });
        if (size(errors) > 0) {
          throw errors;
        }
        //#endregion

        //#region FORMATEO DE LOS DATOS OBTENIDOS DESDE EL FRONTEND, ESTO SE HACE PARA QUE EXISTA UN MEJOR ORDEN CUANDO SE ESTE VALIDANDO ESTOS REGISTROS PARA REGISTRARLOS EN LAS TABLAS DE PERMISOS Y PERMISO
        const errorsAdmin = []; //VARIABLE DE ERRORES DE PERMISO
        const tablaAccionPermisosAuxArray = []; // VARIABLE AUXILIAR PARA ALMACENAR LOS DATOS FORMATEADOS
        forEach(permisos, (itemP) => {
          forEach(itemP.tablas, (itemP2) => {
            if (size(itemP2.data_tabla_accion) > 0) {
              forEach(itemP2.data_tabla_accion, (itemP3) => {
                forEach(tablaAccion.result, (itemTA) => {
                  if (itemP3.id_tabla_accion === itemTA.id_tabla_accion) {
                    tablaAccionPermisosAuxArray.push({
                      ...itemP3,
                      tabla: itemP2.tabla,
                      descripcion: itemP2.descripcion,
                      esCompleto: itemP2.esCompleto,
                      data_accion: find(
                        acciones.result,
                        (itemA) => itemA.id_accion === itemP3.id_accion
                      ),
                    });
                  }
                });
              });
            } else {
              if (itemP2.esCompleto === true) {
                errorsAdmin.push({
                  mensaje: `No existe información suficiente para cambiar el permiso de ${itemP2.descripcion}, porfavor, comuniquese con el administrador`,
                  tabla: itemP2.tabla,
                  id_rol,
                  descripcion: itemP2.descripcion,
                  tipo_error: `No existe registros en la tabla de APS_seg_tabla_accion, para cambiar permisos a la tabla "${itemP2.tabla}" de "${itemP2.descripcion}"`,
                });
              }
            }
          });
        });
        //#endregion

        //#region ERRORES ALMACENADOS EN LA VARIABLE "errorsAdmin" SI NO EXISTEN REGISTROS SUFICIENTES EN LA PERMISO
        if (size(errorsAdmin) > 0) {
          respResultadoIncorrectoObjeto200(res, null, errorsAdmin);
          return;
        }
        //#endregion

        //#region AGRUPACION DE LOS PERMISOS FORMATEADOS ANTERIORMENTE, ESTA AGRUPACION ES POR EL ID_TABLA Y LA TABLA
        const permisosAgrupadosPorTabla = groupBy(
          tablaAccionPermisosAuxArray,
          (item) => `${item.id_tabla}_${item.tabla}`
        );
        //#endregion

        const permisosAuxArray = []; // VARIABLE QUE ALMACENA LA INFORMACION PARA PREPARAR LOS QUERYS DE UPDATE PARA ACTUALIZAR LOS PERMISOS
        const errorsPermisosAuxArray = []; // VARIABLE QUE ALMACENA LA INFORMACION PARA PREPARAR LOS QUERYS DE UPDATE POR SI EXISTE ALGUN ERROR AL ACTUALIZAR EL PERMISO CUANDO SE ESTE EJECUTANDO LOS QUERYS PARA LA BASE DE DATOS
        const errorsPermisosTablaAccionAuxArray = []; // VARIABLE QUE ALMACENA LA INFORMACION PARA VALIDAR QUE LOS REGISTROS PARA EL ROL ACTUAL SEAN CORRECTOS Y EXISTAN EN LA TABLA DE APS_seg_permiso
        const errorsAdminRolNoExistenteAuxArray = []; // VARIABLE PARA MOSTRAR LOS MENSAJES DE LA VARIABLE: errorsPermisosTablaAccionAuxArray
        const errorsQuerys = [];
        const resultQuerys = [];
        const resultQuerysInsert = [];
        const errorsQuerysPermisos = [];

        // const insertarRegistrosAuxArray = []; //Inserta los registros cuando no existen en APS_seg_permiso, esto pasa porque el rol no esta registrado

        //#region SE HACEN ESTAS ITERACIONES CON LOS PERMISOS YA AGRUPADOS POR ID TABLA Y TABLA, DONDE ACA SE VERIFICA QUE SI ALGUN REGISTRO DE LA TABLA PERMISOS ESTA EN "FALSE" Y EL CAMBIO QUE SE QUIERE HACER ES "TRUE" CON EL FIN DE CAMBIAR EL PERMISO AL ROL SELECCIONADO SE ALMACENARA ESTA INFORMACION EN LAS VARIABLES AUXILIARES DECLARADAS ANTERIORMENTE

        forEach(permisosAgrupadosPorTabla, (itemPAPT) => {
          forEach(itemPAPT, (itemPAPT2) => {
            forEach(permisosDB.result, (itemPDB) => {
              if (
                itemPAPT2.id_tabla_accion === itemPDB.id_tabla_accion &&
                itemPAPT2.esCompleto === true
              ) {
                errorsPermisosTablaAccionAuxArray.push(itemPAPT2);
              }
              if (
                itemPAPT2.id_tabla_accion === itemPDB.id_tabla_accion &&
                itemPAPT2.esCompleto !== itemPDB.activo
              ) {
                permisosAuxArray.push({
                  id_permiso: itemPDB.id_permiso,
                  tabla: itemPAPT2.tabla,
                  descripcion: itemPAPT2.descripcion,
                  esCompleto: itemPAPT2.esCompleto,
                });
                errorsPermisosAuxArray.push({
                  id_permiso: itemPDB.id_permiso,
                  activo: itemPDB.activo,
                });
              }
            });
          });
        });
        //#endregion

        //#region SECCION PARA DIFERENCIAR LOS DATOS QUE LLEGAN DEL FRONTEND Y COMPARARLOS CON LOS PERMISOS QUE SE QUIEREN EDITAR, ESTO SIRVE PARA PODER CONTROLAR QUE LOS REGISTROS EXISTAN EN LA TABLA DE PERMISO JUNTO CON EL ROL SELECCIONADO. ESTOS PERMISOS DEBEN EXISTIR EN LA TABLA DE PERMISOS JUNTO AL ROL QUE SE QUIERE EDITAR, SI HAY ALGUNA DIFERENCIA ENTRE LO QUE LLEGA DEL FRONTEND Y LO QUE EXISTE EN LA BD, HABRA UN ERROR Y SE PROCEDERA A INSERTAR LOS NUEVOS REGISTROS.
        const diferenciasAux = groupBy(
          filter(
            difference(
              tablaAccionPermisosAuxArray,
              errorsPermisosTablaAccionAuxArray
            ),
            (itemF) => itemF.esCompleto === true
          ),
          (itemG) => `${itemG.id_tabla}-*-${itemG.tabla}-*-${itemG.descripcion}`
        );
        const insertarRegistrosAuxArray = map(
          diferenciasAux,
          (itemDIF, indexDIF) => {
            const separatorDeIndex = "-*-";
            const idTablaAux = split(indexDIF, separatorDeIndex)[0];
            const tablaAux = split(indexDIF, separatorDeIndex)[1];
            const descripcionAux = split(indexDIF, separatorDeIndex)[2];
            return map(itemDIF, (itemInsert) => {
              return itemInsert;
            });
            // errorsAdminRolNoExistenteAuxArray.push({
            //   mensaje: `No existe información suficiente para cambiar el permiso de ${descripcionAux}, porfavor, comuniquese con el administrador`,
            //   id_rol,
            //   tabla: tablaAux,
            //   descripcion: descripcionAux,
            //   tipo_error: `No existen registros en APS_seg_permiso con el rol "${id_rol}" para la tabla "${tablaAux}" de "${descripcionAux}"`,
            // });
          }
        );

        for await (const insert of insertarRegistrosAuxArray) {
          const queryInsertar = InsertarVariosUtil(nameTable, {
            body: map(insert, (itemInsert) => {
              return {
                id_rol,
                id_tabla_accion: itemInsert.id_tabla_accion,
                permiso: `${itemInsert.data_accion.accion} ${itemInsert.descripcion}`,
                activo: true,
              };
            }),
            returnValue: ["*"],
          });
          await pool
            .query(queryInsertar)
            .then((result) => {
              if (result.rowCount <= 0) {
                errorsQuerysPermisos.push({
                  mensaje: `No existe información suficiente para cambiar el permiso de ${insert.descripcion}, porfavor, comuniquese con el administrador`,
                  id_rol,
                  tabla: insert.tabla,
                  descripcion: insert.descripcion,
                  tipo_error: `No se inserto el permiso debido a que los registros para la tabla "${insert.tabla}" de "${insert.descripcion}" existen en APS_seg_tabla_accion, pero no existen en APS_seg_permiso`,
                });
              }
              resultQuerys.push({ id: result.id_permiso, result: result.rows });
            })
            .catch((err) => {
              errorsQuerys.push({ err });
            });
        }

        //#region CONTROL DE ERROR POR SI NO SE ACTUALIZO CORRECTAMENTE LOS PERMISOS DEBIDO A QUE NO EXISTEN LOS REGISTROS SUFICIENTES EN LAS TABLAS DE TABLA_ACCION Y PERMISO
        if (size(errorsQuerysPermisos) > 0) {
          respResultadoIncorrectoObjeto200(res, null, errorsQuerysPermisos);
          return;
        }
        //#endregion

        // if (size(resultQuerysInsert) > 0) {
        //   respResultadoCorrectoObjeto200(res, resultQuerysInsert); //RESULTADOS, SI SE INSERTO ALGO, ENTONCES MOSTRARA EL ID Y EL REGISTRO QUE SE INSERTO
        //   return;
        // }
        //#endregion

        // if (size(permisosAuxArray) > 0) ESTA VALIDACION NO ES NECESARIA, DEBIDO A QUE SI NO EXISTEN DATOS ENTONCES NO HARA ITERACIONES EN "map" (linea 228) PARA ARMAR LOS QUERYS, PERO SE COMENTO ESTO PARA PODER TENER UNA IDEA DE COMO ENTRAN LOS PERMISOS A LOS QUERYS

        //#region PREPARACION DE LOS QUERYS UPDATE, PARA ACTUALIZAR LOS PERMISOS, SE HACEN 5 QUERYS DEBIDO A LAS 5 ACCIONES
        const querys = map(permisosAuxArray, (item) => {
          console.log(item);
          return {
            id: item.id_permiso,
            text: ActualizarUtil("APS_seg_permiso", {
              body: { activo: item.esCompleto },
              idKey: "id_permiso",
              idValue: item.id_permiso,
              returnValue: ["*"],
            }),
            descripcion: item.descripcion,
            tabla: item.tabla,
          };
        });
        //#endregion

        //#region PREPARACION DE LOS QUERYS UPDATE, PARA ACTUALIZAR LOS PERMISOS, ESTOS QUERYS SE EJECUTAN SOLAMENTE SI EXISTE UN ERROR EN LOS QUERYS ANTERIORES, LOS CUALES LOS ANTERIORES SON LOS CORRECTOS Y LO QUE SE ESPERA DE LA FUNCIONALIDAD, EN CAMBIO ESTOS QUERYS ERRORS SON QUERYS PARA VOLVER A PONER EL ESTADO ANTERIOR EN EL QUE SE ENCONTRABA EL PERMISO, ASI ASEGURANDO DE QUE NINGUN PERMISO ESTE INCOMPLETO Y SE CAMBIEN SI O SI LAS 5 ACCIONES, SI ESTO NO SUCEDE CON LAS 5 ACCIONES ENTONCES SE VUELVE A SU ESTADO INICIAL
        const querysErrorsAux = map(errorsPermisosAuxArray, (item) => {
          console.log("CONSULTA QUE SE EJECUTA SI EXISTE ALGÚN ERRORE");
          return {
            id: item.id_permiso,
            text: ActualizarUtil("APS_seg_permiso", {
              body: { activo: item.activo },
              idKey: "id_permiso",
              idValue: item.id_permiso,
              returnValue: ["*"],
            }),
          };
        });
        //#endregion

        //#region EJECUCION DE LOS QUERYS

        for await (const query of querys) {
          await pool
            .query(query.text)
            .then((result) => {
              if (result.rowCount <= 0) {
                errorsQuerysPermisos.push({
                  mensaje: `No existe información suficiente para cambiar el permiso de ${itemP2.descripcion}, porfavor, comuniquese con el administrador`,
                  id_rol,
                  tabla: query.tabla,
                  descripcion: query.descripcion,
                  tipo_error: `No se actualizó el permiso debido a que los registros para la tabla "${query.tabla}" de "${query.descripcion}" existen en APS_seg_tabla_accion, pero no existen en APS_seg_permiso`,
                });
              }
              resultQuerys.push({ id: query.id, result: result.rows });
            })
            .catch((err) => {
              errorsQuerys.push({ err });
            });
        }
        //#endregion

        //#region CONTROL DE ERROR POR SI NO SE ACTUALIZO CORRECTAMENTE LOS PERMISOS DEBIDO A QUE NO EXISTEN LOS REGISTROS SUFICIENTES EN LAS TABLAS DE TABLA_ACCION Y PERMISO
        if (size(errorsQuerysPermisos) > 0) {
          respResultadoIncorrectoObjeto200(res, null, errorsQuerysPermisos);
          return;
        }
        //#endregion

        //#region EJECUCION DE LOS QUERYS POR SI HUBO ALGUN ERROR
        if (size(errorsQuerys) > 0) {
          for await (const query of querysErrorsAux) {
            await pool
              .query(query.text)
              .then((result) => {})
              .catch((err) => {
                errorsQuerys.push({ id: query.id, err });
              })
              .finally(() => {
                throw errorsQuerys;
              });
          }
          throw errorsQuerys;
        }
        //#endregion

        respResultadoCorrectoObjeto200(res, resultQuerys); //RESULTADOS, SI SE ACTUALIZO ALGO, ENTONCES MOSTRARA EL ID Y EL REGISTRO QUE SE ACTUALIZO, SI NO, DEVOLVERA UN ARRAY VACIO
      },
      ListarPermisos_Permiso: async () => {
        const { id_rol } = req.body;
        const errors = [];
        //#region MODULOS
        const queryModulo = EscogerInternoUtil("APS_seg_modulo", {
          select: ["*"],
          where: [{ key: "activo", value: true }],
          orderby: {
            field: "orden",
          },
        });
        const modulos = await pool
          .query(queryModulo)
          .then((result) => {
            return { ok: true, result: result.rows };
          })
          .catch((err) => {
            return { ok: null, err };
          });
        //#endregion
        //#region TABLAS
        const queryTablas = EscogerInternoUtil("APS_seg_tabla", {
          select: ["*"],
          where: [{ key: "activo", value: true }],
          orderby: {
            field: "orden",
          },
        });
        const tablas = await pool
          .query(queryTablas)
          .then((result) => {
            return { ok: true, result: result.rows };
          })
          .catch((err) => {
            return { ok: null, err };
          });
        //#endregion
        //#region TABLA_ACCION
        const queryTablaAccion = EscogerInternoUtil("APS_seg_tabla_accion", {
          select: ["*"],
          where: [{ key: "activo", value: true }],
        });
        const tablaAccion = await pool
          .query(queryTablaAccion)
          .then((result) => {
            return { ok: true, result: result.rows };
          })
          .catch((err) => {
            return { ok: null, err };
          });
        //#endregion
        //#region PERMISOS
        const queryPermisos = EscogerInternoUtil("APS_seg_permiso", {
          select: ["*"],
          where: [{ key: "activo", value: true }],
        });
        const permisos = await pool
          .query(queryPermisos)
          .then((result) => {
            return { ok: true, result: result.rows };
          })
          .catch((err) => {
            return { ok: null, err };
          });
        //#endregion
        //#region ACCIONES
        const queryAcciones = EscogerInternoUtil("APS_seg_accion", {
          select: ["*"],
          where: [{ key: "activo", value: true }],
        });
        const acciones = await pool
          .query(queryAcciones)
          .then((result) => {
            return { ok: true, result: result.rows };
          })
          .catch((err) => {
            return { ok: null, err };
          });
        //#endregion

        forEach([modulos, tablas, permisos, tablaAccion, acciones], (item) => {
          if (item?.err) {
            errors.push({ err: item.err, message: item.err.message });
          }
        });
        if (size(errors) > 0) {
          throw errors;
        }
        //#region FORMATEO DE LOS DATOS PARA QUE LA JERARQUIA QUEDE CORRECTA:
        //[MODULOS -> [TABLAS -> [TABLA_ACCION -> [PERMISOS, ACCIONES]]]]
        const modulosTablasArray = [];
        forEach(modulos.result, (itemMO) => {
          const resultTablas = filter(
            tablas.result,
            (itemF) => itemF.id_modulo === itemMO.id_modulo
          );
          if (size(resultTablas) > 0) {
            modulosTablasArray.push({
              id_modulo: itemMO.id_modulo,
              modulo: itemMO.modulo,
              descripcion: itemMO.descripcion,
              data_tabla: map(resultTablas, (itemT) => {
                return {
                  id_tabla: itemT.id_tabla,
                  tabla: itemT.tabla,
                  descripcion: itemT.descripcion,
                  data_tabla_accion: map(
                    filter(
                      tablaAccion.result,
                      (itemTA) => itemT.id_tabla === itemTA.id_tabla
                    ),
                    (itemTAMap) => {
                      return {
                        id_tabla_accion: itemTAMap.id_tabla_accion,
                        id_tabla: itemTAMap.id_tabla,
                        id_accion: itemTAMap.id_accion,
                        data_permisos: filter(
                          permisos.result,
                          (itemP) =>
                            itemTAMap.id_tabla_accion ===
                              itemP.id_tabla_accion && itemP.id_rol === id_rol
                        ),
                        // data_acciones: filter(
                        //   acciones.result,
                        //   (itemA) => itemTAMap.id_accion === itemA.id_accion
                        // ),
                      };
                    }
                  ),
                };
              }),
            });
          }
        });
        //#endregion

        //#region PREPARACIÓN FINAL DE LOS DATOS, PARA MANDAR AL FRONTEND
        const resultFinal = map(modulosTablasArray, (item, index) => {
          let esCompleto = true;
          forEach(item.data_tabla, (itemEC) => {
            if (size(itemEC.data_tabla_accion) <= 0) esCompleto = false;
            forEach(itemEC.data_tabla_accion, (itemEC2) => {
              if (size(itemEC2.data_permisos) <= 0) esCompleto = false;
            });
          });
          return {
            id_modulo: index + 1,
            modulo: item.modulo,
            descripcion: item.descripcion,
            esCompleto,
            esTodoCompleto: esCompleto,
            tablas: map(item.data_tabla, (itemDT, indexDT) => {
              let completado = false;
              forEach(itemDT.data_tabla_accion, (itemDT2) => {
                if (size(itemDT2.data_permisos) >= 1) completado = true;
                else completado = false;
              });
              return {
                id_tabla: itemDT.id_tabla,
                tabla: itemDT.tabla,
                descripcion: itemDT.descripcion,
                esCompleto: completado,
                data_tabla_accion: map(itemDT.data_tabla_accion, (itemDT2) => {
                  return {
                    id_tabla_accion: itemDT2.id_tabla_accion,
                    id_tabla: itemDT2.id_tabla,
                    id_accion: itemDT2.id_accion,
                  };
                }),
              };
            }),
          };
        });
        //#endregion

        respResultadoCorrectoObjeto200(res, resultFinal);
      },
      SeleccionarArchivos_ArchivosPensionesSeguros: async () => {
        const { fecha_operacion, periodicidad } = req.body;
        const id_rol = req.user.id_rol;
        const id_usuario = req.user.id_usuario;

        if (!id_usuario || !id_rol) {
          respDatosNoRecibidos400(res, "ID usuario y ID rol requeridos");
          return;
        }
        const values = [
          fecha_operacion,
          fecha_operacion,
          fecha_operacion,
          fecha_operacion,
          fecha_operacion,
          fecha_operacion,
          periodicidad,
          id_usuario,
          id_rol,
        ];
        const query = formatearQuery(
          `SELECT replace(replace(replace(replace(replace(replace(replace(replace(replace(
            "APS_param_archivos_pensiones_seguros".nombre::text, 
            'nnn'::text, "APS_seg_institucion".codigo::text),
            'aaaa'::text, EXTRACT(year FROM TIMESTAMP %L)::text),
            'mm'::text, lpad(EXTRACT(month FROM TIMESTAMP %L)::text, 2, '0'::text)),
            'dd'::text, lpad(EXTRACT(day FROM TIMESTAMP %L)::text, 2, '0'::text)),
            'AA'::text, substring(EXTRACT(year FROM TIMESTAMP %L)::text from 3 for 2)),
            'MM'::text, lpad(EXTRACT(month FROM TIMESTAMP %L)::text, 2, '0'::text)),
            'DD'::text, lpad(EXTRACT(day FROM TIMESTAMP %L)::text, 2, '0'::text)),
            'nntt'::text, "APS_seg_institucion".codigo::text ||
            "APS_param_archivos_pensiones_seguros".codigo::text),
            'nn'::text, "APS_seg_institucion".codigo::text) AS archivo,
            "APS_seg_usuario".id_usuario,
            "APS_param_archivos_pensiones_seguros".archivo_vacio 
            FROM "APS_param_archivos_pensiones_seguros" 
            JOIN "APS_param_clasificador_comun" 
            ON "APS_param_archivos_pensiones_seguros".id_periodicidad = "APS_param_clasificador_comun".id_clasificador_comun 
            JOIN "APS_seg_usuario_rol" 
            ON "APS_seg_usuario_rol".id_rol = "APS_param_archivos_pensiones_seguros".id_rol 
            JOIN "APS_seg_usuario" 
            ON "APS_seg_usuario".id_usuario = "APS_seg_usuario_rol".id_usuario 
            JOIN "APS_seg_institucion" 
            ON "APS_seg_institucion".id_institucion = "APS_seg_usuario".id_institucion 
            WHERE "APS_param_clasificador_comun".id_clasificador_comun = %L 
            AND "APS_seg_usuario".id_usuario = %L 
            AND "APS_seg_usuario_rol".id_rol = %L 
            AND "APS_param_archivos_pensiones_seguros".activo = true;`,
          values
        );

        await pool
          .query(query)
          .then((result) => {
            const resultArray = sortBy(result.rows, (row) =>
              toLower(row.archivo)
            );
            respResultadoCorrectoObjeto200(res, resultArray);
          })
          .catch((err) => {
            throw err;
          });
      },
      SeleccionarArchivosBolsa_ArchivosPensionesSeguros: async () => {
        const { fecha_operacion } = req.body;
        const id_rol = req.user.id_rol;
        const id_usuario = req.user.id_usuario;

        if (!fecha_operacion) {
          respDatosNoRecibidos400(res, "Se requiere la fecha_operacion");
          return;
        }
        const valuesFeriado = [fecha_operacion, fecha_operacion];

        const queryFeriado = formatearQuery(
          `SELECT CASE WHEN EXTRACT (DOW FROM TIMESTAMP %L) IN (6,0) OR (SELECT COUNT(*) FROM public."APS_param_feriado" WHERE fecha = %L) > 0 THEN 0 ELSE 1 END;`,
          valuesFeriado
        );
        const workingDay = await EjecutarQuery(queryFeriado);

        let periodicidad = [154]; //VALOR POR DEFECTO

        if (parseInt(workingDay?.[0].case) === 0) {
          periodicidad = [154]; // DIARIOS
        } else {
          periodicidad = [154, 219]; // DIAS HABILES
        }

        const values = [
          fecha_operacion,
          fecha_operacion,
          fecha_operacion,
          fecha_operacion,
          fecha_operacion,
          fecha_operacion,
          periodicidad,
          id_usuario,
          id_rol,
        ];

        const query = formatearQuery(
          `SELECT replace(replace(replace(replace(replace(replace(replace(replace(replace(
          "APS_param_archivos_pensiones_seguros".nombre::text, 
          'nnn'::text, "APS_seg_institucion".codigo::text),
          'aaaa'::text, EXTRACT(year FROM TIMESTAMP %L)::text),
          'mm'::text, lpad(EXTRACT(month FROM TIMESTAMP %L)::text, 2, '0'::text)),
          'dd'::text, lpad(EXTRACT(day FROM TIMESTAMP %L)::text, 2, '0'::text)),
          'AA'::text, substring(EXTRACT(year FROM TIMESTAMP %L)::text from 3 for 2)),
          'MM'::text, lpad(EXTRACT(month FROM TIMESTAMP %L)::text, 2, '0'::text)),
          'DD'::text, lpad(EXTRACT(day FROM TIMESTAMP %L)::text, 2, '0'::text)),
          'nntt'::text, "APS_seg_institucion".codigo::text ||
          "APS_param_archivos_pensiones_seguros".codigo::text),
          'nn'::text, "APS_seg_institucion".codigo::text) AS archivo,
          "APS_seg_usuario".id_usuario,
          "APS_param_archivos_pensiones_seguros".archivo_vacio 
          FROM "APS_param_archivos_pensiones_seguros" 
          JOIN "APS_param_clasificador_comun" 
          ON "APS_param_archivos_pensiones_seguros".id_periodicidad = "APS_param_clasificador_comun".id_clasificador_comun 
          JOIN "APS_seg_usuario_rol" 
          ON "APS_seg_usuario_rol".id_rol = "APS_param_archivos_pensiones_seguros".id_rol 
          JOIN "APS_seg_usuario" 
          ON "APS_seg_usuario".id_usuario = "APS_seg_usuario_rol".id_usuario 
          JOIN "APS_seg_institucion" 
          ON "APS_seg_institucion".id_institucion = "APS_seg_usuario".id_institucion 
          WHERE "APS_param_clasificador_comun".id_clasificador_comun in (%L) 
          AND "APS_seg_usuario".id_usuario = %L 
          AND "APS_seg_usuario_rol".id_rol = %L 
          AND "APS_param_archivos_pensiones_seguros".activo = true;`,
          values
        );

        await pool
          .query(query)
          .then((result) => {
            const resultArray = sortBy(result.rows, (row) =>
              toLower(row.archivo)
            );
            respResultadoCorrectoObjeto200(res, resultArray);
          })
          .catch((err) => {
            throw err;
          });
      },
      SeleccionarArchivosCustodio_ArchivosPensionesSeguros: async () => {
        const { fecha_operacion, tipo } = req.body;
        if (!fecha_operacion || !tipo) {
          respDatosNoRecibidos400(res, "fecha_operacion y tipo requeridos");
          return;
        }
        const query = EjecutarFuncionSQL(
          tipo === "seguros"
            ? "aps_fun_archivos_custodio_seguros"
            : "aps_fun_archivos_custodio_pensiones",
          { body: { fecha_operacion } }
        );
        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0) {
              const resultFinal = map(result.rows, (item) => {
                return {
                  archivo: item.nombre,
                  archivo_vacio: item.archivo_vacio,
                };
              });
              respResultadoCorrectoObjeto200(res, resultFinal);
            } else respResultadoIncorrectoObjeto200(res, null, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      SeleccionarArchivosValidar_ArchivosPensionesSeguros: async () => {
        const { fecha, id_rol } = req.body;
        const idRolFinal = id_rol ? id_rol : req.user.id_rol;
        if (!fecha) {
          respDatosNoRecibidos400(res, "fecha requerido");
          return;
        }
        const query = EjecutarFuncionSQL("aps_archivos_a_validar", {
          body: {
            fecha,
            idRolFinal,
          },
        });

        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0)
              respResultadoCorrectoObjeto200(res, result.rows);
            else respResultadoIncorrectoObjeto200(res, null, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      LimitesSeguros_Limite: async () => {
        const { body } = req;
        if (Object.entries(body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const query = EjecutarFuncionSQL("aps_limites_seguros", { body });
        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0)
              respResultadoCorrectoObjeto200(res, result.rows);
            else respResultadoIncorrectoObjeto200(res, null, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      TipoReporte_Reportes: async () => {
        const { id_rol } = req.body;
        const idRolFinal = id_rol ? id_rol : req.user.id_rol;
        const query = EjecutarFuncionSQL("aps_reportes", {
          body: {
            idRolFinal,
          },
        });
        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0)
              respResultadoCorrectoObjeto200(res, result.rows);
            else respResultadoIncorrectoObjeto200(res, null, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      SiglaDescripcion_TipoInstrumento: async () => {
        const query = EscogerInternoUtil(nameTable, {
          select: ["*", "sigla ||'-'|| descripcion AS sigla_descripcion"],
          where: [
            { key: "id_tipo_renta", valuesWhereIn: [136], whereIn: true },
            { key: "activo", value: true },
          ],
          orderby: { field: "sigla ASC" },
        });
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      TipoInstrumentoDetalle_TipoInstrumento: async () => {
        const { body } = req;
        let whereAux = [
          { key: "es_seriado", value: true },
          { key: "id_tipo_renta", valuesWhereIn: [135, 136], whereIn: true },
          { key: "activo", value: true },
          {
            key: "id_grupo",
            valuesWhereIn: [111, 119, 121, 126, 127],
            whereIn: true,
            searchCriteriaWhereIn: "NOT IN",
          },
        ];
        if (body?.id_tipo_instrumento)
          whereAux = [
            ...whereAux,
            {
              key: "id_tipo_instrumento",
              valuesWhereIn: body.id_tipo_instrumento,
              whereIn: true,
            },
          ];
        const query = EscogerInternoUtil(nameTable, {
          select: ["*"],
          where: whereAux,
          orderby: {
            field: "sigla",
          },
        });
        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0)
              respResultadoCorrectoObjeto200(res, result.rows);
            else respResultadoIncorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      EscogerPorTipoInstrumentoDetalle_Emision: async () => {
        const { id_emisor, id_tipo_instrumento } = req.body;

        //#region TIPO INSTRUMENTO DETALLE
        const queryTipoInstrumentoDetalle = EscogerInternoUtil(
          "APS_param_tipo_instrumento",
          {
            select: ["*"],
            where: [
              { key: "id_tipo_instrumento", value: id_tipo_instrumento },
              { key: "es_seriado", value: true },
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135, 136],
                whereIn: true,
              },
              { key: "activo", value: true },
              {
                key: "id_grupo",
                valuesWhereIn: [111, 119, 121, 126, 127],
                whereIn: true,
                searchCriteriaWhereIn: "NOT IN",
              },
            ],
            orderby: {
              field: "sigla",
            },
          }
        );
        const tipoInstrumentoDetalle = await EjecutarQuery(
          queryTipoInstrumentoDetalle
        );
        //#endregion

        const instrumentos = map(
          tipoInstrumentoDetalle.result,
          (instrumento) => instrumento.id_tipo_instrumento
        );
        const whereAuxEmision = [{ key: "id_emisor", value: id_emisor }];
        if (size(instrumentos) > 0)
          whereAuxEmision.push({
            key: "id_tipo_instrumento",
            valuesWhereIn: instrumentos,
            whereIn: true,
          });
        else {
          respResultadoIncorrectoObjeto200(
            res,
            instrumentos,
            "Tipo Instrumento no válido"
          );
          return;
        }
        const query = EscogerInternoUtil(nameTable, {
          select: ["*"],
          where: whereAuxEmision,
        });

        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0)
              respResultadoCorrectoObjeto200(res, result.rows);
            else
              respResultadoCorrectoObjeto200(
                res,
                result.rows,
                "No existe ninguna emisión registrada"
              );
          })
          .catch((err) => {
            throw err;
          });
      },
      Insertar_Emision: async () => {
        const body = req.body;
        if (Object.entries(body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const id = ValidarIDActualizarUtil(nameTable, body);
        delete body[id.idKey];
        const queryExist = EscogerUtil(nameTable, {
          body: {
            id_emisor: body.id_emisor,
            id_tipo_instrumento: body.id_tipo_instrumento,
            denominacion: body.denominacion,
          },
          activo: null,
        });
        const exist = await EjecutarQuery(queryExist);
        if (size(exist) > 0) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            exist.result,
            "La información ya existe"
          );
          return;
        }
        const query = InsertarUtil(nameTable, {
          body,
        });
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      Insertar_EmisorPatrimonio: async () => {
        const body = req.body;

        if (Object.entries(body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const id = ValidarIDActualizarUtil(nameTable, body);
        delete body[id.idKey];
        const queryExist = EscogerUtil(nameTable, {
          body: {
            id_emisor: body.id_emisor,
            fecha_actualizacion: body.fecha_actualizacion,
          },
        });
        const exist = await EjecutarQuery(queryExist);
        if (size(exist) > 0) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            exist.result,
            "La información ya existe"
          );
          return;
        }
        const query = InsertarUtil(nameTable, {
          body,
        });
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
            throw err;
          });
      },
      EmisorTGN_OtrosActivos: async () => {
        const query = EscogerInternoUtil(nameTable, {
          select: ["*"],
          where: [
            { key: "id_pais", value: 8, operator: "<>" },
            { key: "codigo_rmv", value: "TGN", operatorSQL: "OR" },
          ],
        });
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      ActualizarPlazoDias_RentaFija: async () => {
        const {
          id_calificacion,
          id_calificadora,
          id_moneda,
          id_emisor,
          id_plazo,
        } = req.body;
        const values = [id_calificacion, id_calificadora, id_moneda, id_emisor];
        const query = formatearQuery(
          `UPDATE public."${nameTable}" SET id_calificacion = %L, id_calificadora = %L, id_moneda = %L WHERE id_emisor = %L AND id_tipo_instrumento = 13 ${
            id_plazo === "CP"
              ? "AND plazo_dias <= 360"
              : id_plazo === "LP"
              ? "AND plazo_dias > 360"
              : ""
          } RETURNING *;`,
          values
        );

        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      UltimoRegistro_TipoCambio: async () => {
        const { id_moneda } = req.body;
        const query = ValorMaximoDeCampoUtil(nameTable, {
          fieldMax: "fecha",
          where: [
            {
              key: "id_moneda",
              value: id_moneda,
            },
          ],
        });

        const maxFecha = await EjecutarQuery(query);

        if (!maxFecha?.[0]?.max) {
          respResultadoVacio404END(
            res,
            "No se encontró ninguna fecha para esta moneda"
          );
          return;
        }

        const queryLastInfo = ObtenerUltimoRegistro(nameTable, {
          where: [
            {
              key: "fecha",
              value: formatearFecha(maxFecha[0].max),
            },
            {
              key: "id_moneda",
              value: id_moneda,
            },
          ],
          orderby: {
            field: "id_tipo_cambio",
          },
        });

        const lastInfo = await EjecutarQuery(queryLastInfo);
        if (size(lastInfo) === 0) {
          respResultadoVacio404END(
            res,
            "No se encontró ninguna fecha para esta moneda"
          );
          return;
        }

        respResultadoCorrectoObjeto200(res, lastInfo);
      },
      ValorMaximo_CargaArchivoBolsa: async () => {
        const { max, reproceso } = req.body;
        const { id_rol } = req.user;
        const wherePushAux =
          reproceso === true
            ? [
                { key: "reproceso", value: true },
                { key: "reprocesado", value: false },
              ]
            : [{ key: "cargado", value: true }];
        const whereFinal = [{ key: "id_rol", value: id_rol }, ...wherePushAux];
        const params = {
          select: ["*"],
          where: whereFinal,
        };
        const query = EscogerInternoUtil(nameTable, params);
        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0) {
              const value =
                reproceso === true
                  ? minBy(result.rows, "fecha_operacion")
                  : maxBy(result.rows, "fecha_operacion");

              if (isUndefined(value)) {
                respResultadoVacio404END(
                  "No existe una fecha válida disponible"
                );
                return;
              }
              if (reproceso === true) {
                let dayOfMonth = value.fecha_operacion?.getDate();
                dayOfMonth--;
                value.fecha_operacion.setDate(dayOfMonth);
              }
              respResultadoCorrectoObjeto200(res, [
                { max: value.fecha_operacion },
              ]);
            } else respResultadoVacio404END(res);
          })
          .catch((err) => {
            throw err;
          });
      },
      UltimaCarga_CargaArchivoBolsa: async () => {
        const { fecha_operacion } = req.body;
        const { id_rol } = req.user;

        const query = formatearQuery(
          `SELECT CASE 
        WHEN maxid > 0 
            THEN nro_carga 
            ELSE 0 
        END AS nroCarga, 
        CASE 
        WHEN maxid > 0 
            THEN cargado 
            ELSE false 
        END AS Cargado 
        FROM (
          SELECT coalesce(max(id_carga_archivos), 0) AS maxid 
          FROM public."APS_aud_carga_archivos_bolsa" AS bolsa
          WHERE bolsa.id_rol = %L 
          AND bolsa.fecha_operacion = %L) AS max_id 
          LEFT JOIN "APS_aud_carga_archivos_bolsa" AS datos 
          ON max_id.maxid = datos.id_carga_archivos;`,
          [id_rol, fecha_operacion]
        );
        const defaultValueAux = {
          nrocarga: 0,
          cargado: false,
        };
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(
              res,
              result.rows?.[0] || defaultValueAux
            );
          })
          .catch((err) => {
            throw err;
          });
      },
      HabilitarReproceso_CargaArchivoBolsa: async () => {
        const { fecha } = req.body;
        const queryUpdate = formatearQuery(
          `UPDATE public."APS_aud_carga_archivos_bolsa" SET cargado = false, fecha_carga = now(), reproceso = true WHERE fecha_operacion = %L AND cargado = true RETURNING *;`,
          [dayjs(fecha).format("YYYY-MM-DD")]
        );
        const querys = [
          queryUpdate,
          EjecutarFuncionSQL("aps_fun_borra_tablas_bolsa", {
            body: { fecha },
          }),
        ];
        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        respResultadoCorrectoObjeto200(res, {
          actualizacion: results.result[0].data,
          eliminacion: results.result[1].data,
        });
      },
      ReporteExito_CargaArchivoBolsa: async () => {
        const { id_carga_archivos } = req.body;
        await pool
          .query(
            EscogerInternoUtil(nameTable, {
              select: ["*"],
              where: [
                { key: "id_carga_archivos", value: id_carga_archivos },
                { key: "cargado", value: true },
              ],
            })
          )
          .then((result) => {
            respResultadoCorrectoObjeto200(
              res,
              map(result.rows, (item) => {
                return {
                  cod_institucion: "BBV",
                  descripcion: "La información esta correcta",
                  fecha_carga: item.fecha_carga,
                };
              })
            );
          })
          .catch((err) => {
            throw err;
          });
      },
      ValorMaximo_CargaArchivoPensionesSeguros: async () => {
        const { max, periodicidad } = req.body;
        const { id_rol } = req.user;
        if (!periodicidad) {
          respDatosNoRecibidos400(res, "No se envio la periodicidad.");
          return;
        }
        const cod_institucion = await ObtenerInstitucion(req.user);
        if (cod_institucion.ok === false) {
          respResultadoVacio404END(
            res,
            "No existe ninguna institución para este usuario."
          );
          return;
        }
        const whereFinal = [
          { key: "id_rol", value: id_rol },
          { key: "id_periodo", value: periodicidad },
          { key: "cod_institucion", value: cod_institucion.result.codigo },
          { key: "cargado", value: true },
        ];
        const query = ValorMaximoDeCampoUtil(nameTable, {
          fieldMax: max ? max : "fecha_operacion",
          where: whereFinal,
        });
        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0)
              result.rows[0]?.max === null
                ? respResultadoVacio404END(
                    res,
                    "No existe una fecha válida disponible"
                  )
                : respResultadoCorrectoObjeto200(res, result.rows);
            else respResultadoVacio404END(res);
          })
          .catch((err) => {
            throw err;
          });
      },
      UltimaCarga_CargaArchivoPensionesSeguros: async () => {
        const { fecha_operacion, periodicidad, id_rol } = req.body;
        const { id_usuario } = req.user;

        const query = formatearQuery(
          `SELECT CASE 
          WHEN maxid > 0 
              THEN nro_carga 
              ELSE 0 
          END AS nroCarga, 
          CASE 
          WHEN maxid > 0 
              THEN null 
              ELSE false 
          END AS Cargado 
          FROM ( 
            SELECT coalesce(max(id_carga_archivos), 0) AS maxid 
            FROM public."APS_aud_carga_archivos_pensiones_seguros" AS pen 
            INNER JOIN "APS_seg_institucion" AS int 
            ON int.codigo = pen.cod_institucion 
            INNER JOIN "APS_seg_usuario" AS usuario 
            ON usuario.id_institucion = int.id_institucion 
            WHERE usuario.id_usuario=%L 
            AND pen.id_periodo=%L 
            AND pen.fecha_operacion = %L${
              id_rol ? ` AND pen.id_rol = %L` : ""
            }) AS max_id 
            LEFT JOIN "APS_aud_carga_archivos_pensiones_seguros" AS datos 
            ON max_id.maxid = datos.id_carga_archivos`,
          [id_usuario, periodicidad, fecha_operacion, id_rol]
        );
        const defaultValueAux = {
          nrocarga: 0,
          cargado: false,
        };
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(
              res,
              result.rows?.[0] || defaultValueAux
            );
          })
          .catch((err) => {
            throw err;
          });
      },
      ReporteEnvio_CargaArchivoPensionesSeguros: async () => {
        const { fecha, id_rol, cargado, estado, tipo } = req.body;
        const idRolFinal = id_rol ? id_rol : req.user.id_rol;
        const cargadoFinal =
          cargado === true || cargado === false ? cargado : null;
        const estadoFinal = isEmpty(estado) ? null : estado;
        if (Object.entries(req.body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const queryValida = formatearQuery(
          `SELECT COUNT(*) 
          FROM public."APS_aud_valida_archivos_pensiones_seguros" 
          WHERE fecha_operacion = %L 
          AND validado=true 
          AND id_usuario IN (CAST((
            SELECT DISTINCT cod_institucion 
            FROM public."APS_aud_carga_archivos_pensiones_seguros" 
            WHERE cargado = true 
            AND fecha_operacion = %L 
            AND id_rol = %L) AS INTEGER))`,
          [fecha, fecha, id_rol]
        );
        const queryValora = formatearQuery(
          `SELECT COUNT(*) 
          FROM public."APS_aud_valora_archivos_pensiones_seguros" 
          WHERE fecha_operacion = %L 
          AND valorado=true 
          AND id_usuario IN (CAST((
            SELECT DISTINCT cod_institucion 
            FROM public."APS_aud_carga_archivos_pensiones_seguros" 
            WHERE cargado = true 
            AND fecha_operacion = %L 
            AND id_rol = %L) AS INTEGER))`,
          [fecha, fecha, id_rol]
        );
        const params = {
          body: {
            fecha,
            idRolFinal,
          },
        };
        if (cargadoFinal !== null || estadoFinal !== null) params.where = [];
        if (cargadoFinal !== null)
          params.where = [
            ...params.where,
            { key: "cargado", value: cargadoFinal },
          ];
        if (estadoFinal !== null)
          params.where = [
            ...params.where,
            { key: "estado", value: estadoFinal },
          ];
        const querys = [];
        querys.push(EjecutarFuncionSQL("aps_reporte_control_envio", params));
        tipo === "validacion"
          ? querys.push(queryValida)
          : tipo === "valoracion"
          ? querys.push(queryValora)
          : null;
        tipo === "valoracion"
          ? id_rol === 10
            ? querys.push(EscogerInternoUtil("APS_view_existe_valores_seguros"))
            : id_rol === 7
            ? querys.push(
                EscogerInternoUtil("APS_view_existe_valores_pensiones")
              )
            : null
          : null;

        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        respResultadoCorrectoObjeto200(res, results.result[0].data);
      },
      Modalidades_CargaArchivoPensionesSeguros: async () => {
        const { fecha, id_tipo_modalidad, id_rol } = req.body;
        const viewModalidad =
          id_rol === 7
            ? "aps_view_modalidad_pensiones"
            : "aps_view_modalidad_seguros";
        const querys = [
          EscogerInternoUtil(viewModalidad, {
            select: ["*"],
            where: [{ key: "id_tipo_entidad", value: id_tipo_modalidad }],
          }),
        ];
        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        results.result[0].data = uniqBy(results.result[0].data, "codigo");
        const modalidadesArray = map(results.result, (item, index) => {
          return {
            id_modalidad: index + 1,
            titulo: "Todas",
            fecha,
            descripcion: "Todas las entidades",
            esCompleto: false,
            esTodoCompleto: false,
            modalidades: map(results.result?.[0].data, (item) => {
              return {
                id_tipo_modalidad: item.id_tipo_entidad,
                esCompleto: false,
                descripcion: item.descripcion,
                codigo: item.codigo,
                institucion: item.institucion,
                sigla: item.sigla,
              };
            }),
          };
        });
        respResultadoCorrectoObjeto200(res, modalidadesArray);
      },
      ReporteControlEnvio_CargaArchivoPensionesSeguros: async () => {
        const {
          fecha,
          id_rol,
          iid_reporte,
          periodo,
          modalidades,
          id_rol_cargas,
        } = req.body;
        const querys = [];
        const queryInstituciones = ListarUtil(
          id_rol === 10
            ? "aps_view_modalidad_seguros"
            : "aps_view_modalidad_pensiones",
          { activo: null }
        );
        const instituciones = uniqBy(
          await EjecutarQuery(queryInstituciones),
          "codigo"
        );
        //SEGUROS
        if (iid_reporte === 6) {
          if (!periodo) {
            respDatosNoRecibidos400(res, "No se envio la periodicidad");
            return;
          }
          // VALIDACION PRELIMINAR
          const aux = map(instituciones.result, (item) => {
            return EjecutarFuncionSQL("aps_reporte_validacion_preliminar", {
              body: { fecha, cod_institucion: item.codigo, periodo: periodo },
            });
          });
          forEach(aux, (item) => querys.push(item));
        } else if (iid_reporte === 7) {
          //VALIDACION
          const query = EscogerInternoUtil(
            "APS_aud_valida_archivos_pensiones_seguros",
            {
              select: ["*"],
              where: [
                { key: "fecha_operacion", value: fecha },
                {
                  key: "cod_institucion",
                  valuesWhereIn: map(instituciones, (item) => item.codigo),
                  whereIn: true,
                },
              ],
            }
          );
          querys.push(query);
        } else if (iid_reporte === 8) {
          //VALORACION CARTERA
          const query = EscogerInternoUtil(
            "APS_aud_valora_archivos_pensiones_seguros",
            {
              select: ["*"],
              where: [
                { key: "fecha_operacion", value: fecha },
                {
                  key: "cod_institucion",
                  valuesWhereIn: map(instituciones, (item) => item.codigo),
                  whereIn: true,
                },
              ],
            }
          );
          querys.push(query);
        } else if (iid_reporte === 25) {
          //CUSTODIO
          const codigos = [];
          forEach(modalidades, (item) =>
            filter(item.modalidades, (modalidad) => {
              if (modalidad.esCompleto === true) codigos.push(modalidad.codigo);
            })
          );
          const paramsAux = { body: { fecha } };
          if (size(codigos) > 0) {
            paramsAux.where = [
              {
                key: "cod_institucion",
                valuesWhereIn: codigos,
                whereIn: true,
              },
            ];

            const query = EjecutarFuncionSQL(
              "aps_fun_reporte_custodio",
              paramsAux
            );
            querys.push(query);
          }
        } else if (iid_reporte === 26) {
          //CARTERA VALORADA
          const query = EjecutarFuncionSQL("aps_fun_reporte_cartera_valorada", {
            body: { fecha },
          });
          querys.push(query);
        }

        //PENSIONES
        if (iid_reporte === 31) {
          //CARTERA VALORADA
          const query = EjecutarFuncionSQL(
            id_rol === 10
              ? "aps_fun_reporte_cartera_valorada"
              : "aps_fun_reporte_cartera_valorada_pensiones",
            { body: { fecha } }
          );
          querys.push(query);
        } else if (iid_reporte === 30) {
          //CUSTODIO
          const codigos = [];
          forEach(modalidades, (item) =>
            filter(item.modalidades, (modalidad) => {
              if (modalidad.esCompleto === true) codigos.push(modalidad.codigo);
            })
          );
          const paramsAux = { body: { fecha } };
          if (size(codigos) > 0) {
            paramsAux.where = [
              {
                key: "cod_institucion",
                valuesWhereIn: codigos,
                whereIn: true,
              },
            ];

            const query = EjecutarFuncionSQL(
              "aps_fun_reporte_custodio",
              paramsAux
            );
            querys.push(query);
          }
        } else if (iid_reporte === 32) {
          //VALIDACION CONTABLE
          const query = EscogerInternoUtil(
            "APS_aud_valida_archivos_pensiones_seguros",
            {
              select: ["*"],
              where: [
                { key: "fecha_operacion", value: fecha },
                {
                  key: "cod_institucion",
                  valuesWhereIn: map(instituciones, (item) => item.codigo),
                  whereIn: true,
                },
                {
                  key: "id_rol_carga",
                  valuesWhereIn: id_rol_cargas,
                  whereIn: true,
                },
              ],
            }
          );
          querys.push(query);
        } else if (iid_reporte === 28) {
          //VALIDACION INVERSIONES
          const query = EscogerInternoUtil(
            "APS_aud_valida_archivos_pensiones_seguros",
            {
              select: ["*"],
              where: [
                { key: "fecha_operacion", value: fecha },
                {
                  key: "cod_institucion",
                  valuesWhereIn: map(instituciones, (item) => item.codigo),
                  whereIn: true,
                },
                {
                  key: "id_rol_carga",
                  valuesWhereIn: id_rol_cargas,
                  whereIn: true,
                },
              ],
            }
          );
          querys.push(query);
        } else if (iid_reporte === 27) {
          if (!periodo) {
            respDatosNoRecibidos400(res, "No se envio la periodicidad");
            return;
          }
          // VALIDACION PRELIMINAR
          const aux = map(instituciones.result, (item) => {
            return EjecutarFuncionSQL("aps_reporte_validacion_preliminar", {
              body: { fecha, cod_institucion: item.codigo, periodo: periodo },
              where: id_rol_cargas && [
                {
                  key: "id_rol",
                  valuesWhereIn: id_rol_cargas,
                  whereIn: true,
                },
              ],
            });
          });
          forEach(aux, (item) => querys.push(item));
        } else if (iid_reporte === 29) {
          //VALORACION CARTERA
          const query = EscogerInternoUtil(
            "APS_aud_valora_archivos_pensiones_seguros",
            {
              select: ["*"],
              where: [
                { key: "fecha_operacion", value: fecha },
                {
                  key: "cod_institucion",
                  valuesWhereIn: map(instituciones, (item) => item.codigo),
                  whereIn: true,
                },
              ],
            }
          );
          querys.push(query);
        }
        querys.push(ListarUtil("APS_seg_usuario"));
        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        let resultAux = [];
        forEach(results.result, (item) => {
          if (item.table !== "APS_seg_usuario")
            resultAux = [...resultAux, ...item.data];
        });
        const usuarios = find(
          results.result,
          (item) => item.table === "APS_seg_usuario"
        );

        const resultFinal = map(resultAux, (item) => {
          if (iid_reporte === 6) {
            // VALIDACION PRELIMINAR SEGUROS
            return {
              id: item.id_carga_archivos,
              descripcion: item.descripcion,
              estado: item.resultado,
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: item.usuario,
              id_carga_archivos: item.id_carga_archivos,
              id_rol: item.id_rol,
              reproceso: item.reproceso,
              cargado: item.cargado,
            };
          } else if (iid_reporte === 7) {
            // VALIDACION SEGUROS
            return {
              id: item.id_valida_archivos,
              estado: item.validado ? "Con Éxito" : "Con Error",
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: find(
                usuarios.data,
                (itemF) => item.id_usuario === itemF.id_usuario
              )?.usuario,
              id_valida_archivos: item.id_valida_archivos,
              id_rol: item.id_rol,
              validado: item.validado,
            };
          } else if (iid_reporte === 8) {
            //VALORACION CARTERA
            return {
              id: item.id_valora_archivos,
              estado: item.valorado ? "Con Éxito" : "Con Error",
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: find(
                usuarios.data,
                (itemF) => item.id_usuario === itemF.id_usuario
              )?.usuario,
              id_valora_archivos: item.id_valora_archivos,
              id_rol: item.id_rol,
              valorado: item.valorado,
            };
          } else if (iid_reporte === 25) {
            return {
              Código: item.cod_institucion,
              Fecha: item.fecha_informacion,
              Instrumento: item.tipo_instrumento,
              Serie: item.serie,
              Total_MO_EDV: item.total_mo_edv,
              Total_MO_APS: item.total_mo_aps,
              Diferencia_Total: item.diferencia_total,
              Cantidad_EDV: item.cantidad_edv,
              Cantidad_APS: item.cantidad_aps,
              Diferencia_Cantidad: item.diferencia_cantidad,
            };
          } else if (iid_reporte === 26) {
            return {
              Código: item.cod_institucion,
              Fecha: item.fecha_informacion,
              Instrumento: item.tipo_instrumento,
              Serie: item.serie,
              Total_MO: item.total_mo,
              Total_APS: item.total_aps,
              Diferencia_Total: item.diferencia_total,
              Cantidad: item.cantidad,
              Cantidad_APS: item.cantidad_aps,
              Diferencia_Cantidad: item.diferencia_cantidad,
            };
          } else if (iid_reporte === 27) {
            //VALIDACION PRELIMINAR PENSIONES
            return {
              id: item.id_carga_archivos,
              tipo_informacion: item.id_rol === 4 ? "Inversiones" : "Contable",
              descripcion: item.descripcion,
              estado: item.resultado,
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: item.usuario,
              id_carga_archivos: item.id_carga_archivos,
              id_rol: item.id_rol,
              reproceso: item.reproceso,
              cargado: item.cargado,
            };
          } else if (iid_reporte === 28) {
            //VALIDACION INVERSIONES PENSIONES
            return {
              id: item.id_valida_archivos,
              tipo_informacion:
                item.id_rol_carga === 4 ? "Inversiones" : "Contable",
              estado: item.validado ? "Con Éxito" : "Con Error",
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: find(
                usuarios.data,
                (itemF) => item.id_usuario === itemF.id_usuario
              )?.usuario,
              id_valida_archivos: item.id_valida_archivos,
              id_rol: item.id_rol,
              id_rol_carga: item.id_rol_carga,
              validado: item.validado,
              reproces: item.reproceso,
            };
          } else if (iid_reporte === 29) {
            //VALORACION CARTERA PENSIONES
            return {
              id: item.id_valora_archivos,
              estado: item.valorado ? "Con Éxito" : "Con Error",
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: find(
                usuarios.data,
                (itemF) => item.id_usuario === itemF.id_usuario
              )?.usuario,
              id_valora_archivos: item.id_valora_archivos,
              id_rol: item.id_rol,
              valorado: item.valorado,
            };
          } else if (iid_reporte === 30) {
            //CUSTODIO PENSIONES
            return {
              Código: item.cod_institucion,
              Fecha: item.fecha_informacion,
              Instrumento: item.tipo_instrumento,
              Serie: item.serie,
              Total_MO_EDV: item.total_mo_edv,
              Total_MO_APS: item.total_mo_aps,
              Diferencia_Total: item.diferencia_total,
              Cantidad_EDV: item.cantidad_edv,
              Cantidad_APS: item.cantidad_aps,
              Diferencia_Cantidad: item.diferencia_cantidad,
            };
          } else if (iid_reporte === 31) {
            return {
              Código: item.cod_institucion,
              Fecha: item.fecha_informacion,
              Instrumento: item.tipo_instrumento,
              Serie: item.serie,
              Total_MO: item.total_mo,
              Total_APS: item.total_aps,
              Diferencia_Total: item.diferencia_total,
              Cantidad: item.cantidad,
              Cantidad_APS: item.cantidad_aps,
              Diferencia_Cantidad: item.diferencia_cantidad,
            };
          } else if (iid_reporte === 32) {
            //VALIDACION CONTABLES PENSIONES
            return {
              id: item.id_valida_archivos,
              tipo_informacion:
                item.id_rol_carga === 4 ? "Inversiones" : "Contable",
              estado: item.validado ? "Con Éxito" : "Con Error",
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: find(
                usuarios.data,
                (itemF) => item.id_usuario === itemF.id_usuario
              )?.usuario,
              id_valida_archivos: item.id_valida_archivos,
              id_rol: item.id_rol,
              id_rol_carga: item.id_rol_carga,
              validado: item.validado,
            };
          }
        });
        if (
          iid_reporte === 25 ||
          iid_reporte === 26 ||
          iid_reporte === 31 ||
          iid_reporte === 30
        ) {
          if (size(resultFinal) > 0) {
            const wb = new xl.Workbook(defaultOptionsReportExcel());
            const keysResult = keys(resultFinal?.[0]);
            const { folder, nameSheet, nameExcel } =
              tipoReporteControlEnvio(iid_reporte);
            SimpleReport({
              wb,
              data: { headers: keysResult, values: resultFinal },
              nameSheet,
            });
            const pathExcel = path.join(`reports/${folder}`, nameExcel);

            wb.write(pathExcel, (err, stats) => {
              if (err) {
                throw err;
              } else {
                respDescargarArchivos200(res, pathExcel, nameExcel);
              }
            });
            return;
          }
          respResultadoIncorrectoObjeto200(
            res,
            null,
            resultFinal,
            "No existen registros para obtener el reporte"
          );
          return;
        }

        respResultadoCorrectoObjeto200(res, sortBy(resultFinal, ["id"]));
      },
      ReporteReproceso_CargaArchivoPensionesSeguros: async () => {
        const { fecha, id_rol, periodo, reproceso } = req.body;
        const id_rol_final = req.user.id_rol;
        const id_usuario_token = req.user.id_usuario;

        const instituciones = await EjecutarVariosQuerys([
          EscogerInternoUtil("aps_view_modalidad_seguros", {
            select: ["*"],
            where: [
              { key: "id_usuario", value: id_usuario_token },
              { key: "id_rol", value: id_rol_final },
            ],
          }),
          EscogerInternoUtil("aps_view_modalidad_pensiones", {
            select: ["*"],
            where: [
              { key: "id_usuario", value: id_usuario_token },
              { key: "id_rol", value: id_rol_final },
            ],
          }),
        ]);

        if (instituciones.ok === null) throw instituciones.result;
        if (instituciones.ok === false) throw instituciones.errors;

        if (!periodo) {
          respDatosNoRecibidos400(res, "No se envio la periodicidad");
          return;
        }

        const institucionesSeguros = instituciones.result[0].data;
        const institucionesPensiones = instituciones.result[1].data;
        const institucionesFinal =
          size(institucionesSeguros) > 0
            ? institucionesSeguros
            : institucionesPensiones;

        if (size(institucionesFinal) <= 0) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            institucionesFinal,
            "No existe información registrada para esta fecha"
          );
          return;
        }

        const whereAux = [
          {
            key: "id_periodo",
            valuesWhereIn: split(periodo, ","),
            whereIn: true,
          },
          { key: "reproceso", valuesWhereIn: reproceso, whereIn: true },
          {
            key: "cod_institucion",
            valuesWhereIn: map(institucionesFinal, (item) => `${item.codigo}`),
            whereIn: true,
          },
          { key: "fecha_operacion", value: fecha },
        ];
        if (id_rol_final === 4 || id_rol_final === 5)
          whereAux.push({
            key: "id_rol",
            value: id_rol_final,
          });
        const querys = [
          EscogerInternoUtil(nameTable, {
            select: ["*"],
            where: whereAux,
          }),
          ListarUtil("APS_seg_usuario"),
        ];
        const results = await EjecutarVariosQuerys(querys);

        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;

        const usuarios = find(
          results.result,
          (item) => item.table === "APS_seg_usuario"
        );
        respResultadoCorrectoObjeto200(
          res,
          map(results.result[0].data, (item) => {
            return {
              id: item.id_carga_archivos,
              descripcion: item.id_periodo === 154 ? "Diaria" : "Mensual",
              estado: item.cargado ? "Con Éxito" : "Con Error",
              resultado:
                item.reproceso === true && item.cargado === false
                  ? "Reproceso"
                  : item.cargado
                  ? "Con Éxito"
                  : "Con Error",
              reproceso: item.reproceso,
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: find(
                usuarios.data,
                (itemF) => item.id_usuario === itemF.id_usuario
              )?.usuario,
              id_carga_archivos: item.id_carga_archivos,
              id_rol: item.id_rol,
              cargado: item.cargado,
            };
          })
        );
      },
      ReporteExito_CargaArchivoPensionesSeguros: async () => {
        const { id_carga_archivos } = req.body;
        await pool
          .query(
            EscogerInternoUtil(nameTable, {
              select: ["*"],
              where: [
                { key: "id_carga_archivos", value: id_carga_archivos },
                { key: "cargado", value: true },
              ],
            })
          )
          .then((result) => {
            respResultadoCorrectoObjeto200(
              res,
              map(result.rows, (item) => {
                return {
                  cod_institucion: item.cod_institucion,
                  descripcion: "La información fue validada correctamente",
                  fecha_carga: item.fecha_carga,
                };
              })
            );
          })
          .catch((err) => {
            throw err;
          });
      },
      NombreReporte_CargaArchivoPensionesSeguros: async () => {
        const { reporte } = req.body;

        respResultadoCorrectoObjeto200(
          res,
          tipoReporteControlEnvio(reporte)?.nameExcel || "Reporte"
        );
      },
      Entidades_CargaArchivoPensionesSeguros: async () => {
        const { id_tipo_modalidad, id_rol } = req.body;
        const viewModalidad =
          id_rol === 7
            ? "aps_view_modalidad_pensiones"
            : "aps_view_modalidad_seguros";
        const querys = [
          EscogerInternoUtil(viewModalidad, {
            select: ["*"],
            where: [{ key: "id_tipo_entidad", value: id_tipo_modalidad }],
          }),
        ];
        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        results.result[0].data = uniqBy(results.result[0].data, "codigo");
        respResultadoCorrectoObjeto200(res, results.result[0].data);
      },
      HabilitarReproceso_CargaArchivoPensionesSeguros: async () => {
        const { fecha, periodicidad, codigo_entidad, tipo_informacion } =
          req.body;
        const querys = [];
        if (tipo_informacion) {
          const values = [fecha, tipo_informacion, codigo_entidad];
          const queryUpdate = formatearQuery(
            `UPDATE public."APS_aud_carga_archivos_pensiones_seguros" SET cargado = false, fecha_carga = now(), reproceso = true WHERE fecha_operacion = %L AND id_rol = %L AND cod_institucion = %L AND cargado = true RETURNING *;`,
            values
          );
          querys.push(queryUpdate);
          querys.push(
            tipo_informacion === 4
              ? EjecutarFuncionSQL(
                  "aps_fun_borra_tablas_inversiones_pensiones",
                  {
                    body: { fecha, codigo_entidad },
                  }
                )
              : EjecutarFuncionSQL("aps_fun_borra_tablas_contable_pensiones", {
                  body: { fecha, codigo_entidad },
                })
          );
        } else {
          const values = [fecha, periodicidad, codigo_entidad];
          const queryUpdate = formatearQuery(
            `UPDATE public."APS_aud_carga_archivos_pensiones_seguros" SET cargado = false, fecha_carga = now(), reproceso = true WHERE fecha_operacion = %L AND id_periodo = %L AND cod_institucion = %L AND cargado = true RETURNING *;`,
            values
          );
          querys.push(queryUpdate);
          querys.push(
            periodicidad === "154"
              ? EjecutarFuncionSQL("aps_fun_borra_tablas_diarias_seguro", {
                  body: { fecha, codigo_entidad },
                })
              : EjecutarFuncionSQL("aps_fun_borra_tablas_mensuales_seguro", {
                  body: { fecha, codigo_entidad },
                })
          );
        }
        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        respResultadoCorrectoObjeto200(res, {
          actualizacion: results.result[0].data,
          eliminacion: results.result[1].data,
        });
      },
      ValorMaximo_CargaArchivoCustodio: async () => {
        const { max } = req.body;
        const { id_rol } = req.user;
        const whereFinal = [
          { key: "cargado", value: true },
          { key: "id_rol", value: id_rol },
        ];
        const params = {
          fieldMax: max ? max : "fecha_operacion",
          where: whereFinal,
        };
        const query = ValorMaximoDeCampoUtil(nameTable, params);
        await pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0)
              result.rows[0]?.max === null
                ? respResultadoVacio404END(
                    res,
                    "No existe una fecha válida disponible"
                  )
                : respResultadoCorrectoObjeto200(res, result.rows);
            else respResultadoVacio404END(res);
          })
          .catch((err) => {
            throw err;
          });
      },
      UltimaCarga_CargaArchivoCustodio: async () => {
        const { fecha_operacion } = req.body;
        const { id_rol } = req.user;

        const query = formatearQuery(
          `SELECT CASE 
          WHEN maxid > 0 
              THEN nro_carga 
              ELSE 0 
          END AS nroCarga, 
          CASE 
          WHEN maxid > 0 
              THEN cargado 
              ELSE false 
          END AS Cargado 
          FROM (
            SELECT coalesce(max(id_carga_archivos), 0) as maxid
            FROM public."APS_aud_carga_archivos_custodio" as cust
            WHERE cust.fecha_operacion = %L) as max_id
            LEFT JOIN "APS_aud_carga_archivos_custodio" as datos 
            ON max_id.maxid = datos.id_carga_archivos
            WHERE datos.id_rol = %L;`,
          [fecha_operacion, id_rol]
        );
        const defaultValueAux = {
          nrocarga: 0,
          cargado: false,
        };
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(
              res,
              result.rows?.[0] || defaultValueAux
            );
          })
          .catch((err) => {
            throw err;
          });
      },
      Reporte_CargaArchivoCustodio: async () => {
        const { fecha, id_rol } = req.body;
        const idRolFinal = id_rol ? id_rol : req.user.id_rol;
        const querys = [];
        const query = EscogerInternoUtil(nameTable, {
          select: ["*"],
          where: [
            { key: "fecha_operacion", value: fecha },
            { key: "id_rol", value: idRolFinal },
          ],
        });
        querys.push(query);
        querys.push(ListarUtil("APS_seg_usuario"));
        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        let resultAux = [];
        forEach(results.result, (item) => {
          if (item.table !== "APS_seg_usuario")
            resultAux = [...resultAux, ...item.data];
        });
        const usuarios = find(
          results.result,
          (item) => item.table === "APS_seg_usuario"
        );

        const resultFinal = map(resultAux, (item) => {
          return {
            id: item.id_carga_archivos,
            id_carga_archivos: item.id_carga_archivos,
            estado: item.cargado ? "Con Éxito" : "Con Error",
            cargado: item.cargado,
            fecha_operacion: item.fecha_operacion,
            fecha_entrega: item.fecha_entrega,
            fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
            nro_carga: item.nro_carga,
            usuario: find(
              usuarios.data,
              (itemF) => item.id_usuario === itemF.id_usuario
            )?.usuario,
            id_rol: item.id_rol,
          };
        });
        respResultadoCorrectoObjeto200(res, sortBy(resultFinal, ["id"]));
      },
      ReporteExito_CargaArchivoCustodio: async () => {
        const { id_carga_archivos } = req.body;

        await pool
          .query(
            EscogerInternoUtil(nameTable, {
              select: ["*"],
              where: [
                { key: "id_carga_archivos", value: id_carga_archivos },
                { key: "cargado", value: true },
              ],
            })
          )
          .then((result) => {
            respResultadoCorrectoObjeto200(
              res,
              map(result.rows, (item) => {
                return {
                  cod_institucion: "EDV",
                  descripcion: "La información esta correcta",
                  fecha_carga: item.fecha_carga,
                };
              })
            );
          })
          .catch((err) => {
            throw err;
          });
      },
      Reporte_ErroresCargaArchivoBolsa: async () => {
        const body = req.body;

        if (Object.entries(body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const params = { body };
        const query = EscogerUtil(nameTable.replace("errores_", ""), params);
        const cargaArchivos = (await EjecutarQuery(query)?.[0]) || undefined;
        if (isUndefined(cargaArchivos)) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            cargaArchivos,
            `No existe ningún registro de carga para la fecha seleccionada`
          );
          return null;
        }

        const paramsErrores = {
          select: ["*"],
          where: [
            {
              key: "id_carga_archivos",
              value: cargaArchivos?.id_carga_archivos - 1,
            },
          ],
        };
        const queryErrores = EscogerInternoUtil(nameTable, paramsErrores);
        await pool
          .query(queryErrores)
          .then((result) => {
            if (result.rowCount > 0)
              respResultadoCorrectoObjeto200(res, result.rows);
            else
              respResultadoIncorrectoObjeto200(
                res,
                null,
                result.rows,
                `No existen errores registrados para esa fecha`
              );
          })
          .catch((err) => {
            throw err;
          });
      },
      EscogerValidacionPreliminar_ErroresCargaArchivosPensionesSeguros:
        async () => {
          const { id_carga_archivos } = req.body;
          const querys = [
            EscogerInternoUtil("APS_aud_carga_archivos_pensiones_seguros", {
              select: ["*"],
              where: [{ key: "id_carga_archivos", value: id_carga_archivos }],
            }),
            EscogerUtil(nameTable, {
              activo: null,
              body: { id_carga_archivos },
            }),
          ];
          const results = await EjecutarVariosQuerys(querys);
          if (results.ok === null) throw results.result;
          if (results.ok === false) throw results.errors;
          const carga = results.result[0].data?.[0];
          if (!carga) {
            respResultadoIncorrectoObjeto200(
              res,
              null,
              [],
              `No existe ningún registro con el ID: ${id_carga_archivos}`
            );
            return;
          }

          if (carga.cargado === true && carga.reproceso === false) {
            respResultadoIncorrectoObjeto200(
              res,
              null,
              [],
              "La Validación Preliminar fue exitosa"
            );
            return;
          } else if (carga.cargado === false && carga.reproceso === true) {
            respResultadoIncorrectoObjeto200(
              res,
              null,
              [
                {
                  id: carga.id_carga_archivos,
                  cod_institucion: carga.cod_institucion,
                  descripcion: "Hubo Autorización de Reproceso",
                  fecha_carga: carga.fecha_carga,
                },
              ],
              `Hubo Autorización de Reproceso ${dayjs(carga.fecha_carga)
                .locale("es")
                .format("[el día] DD [de] MMMM [de] YYYY [a las] HH:mm")}`
            );
            return;
          }

          const erroresDeCarga = results.result[1].data;
          if (size(erroresDeCarga) > 0)
            respResultadoCorrectoObjeto200(res, erroresDeCarga);
          else
            respResultadoIncorrectoObjeto200(
              res,
              null,
              erroresDeCarga,
              "No existe información disponible de los errores"
            );
        },
      Reporte_ErroresCargaArchivosPensionesSeguros: async () => {
        const { fecha, periodo, resultado } = req.body;
        const { id_rol } = req.user;
        const resultadoFinal =
          resultado === "Con Éxito" || resultado === "Con Error"
            ? resultado
            : null;

        if (Object.entries(req.body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const cod_institucion = await ObtenerInstitucion(req.user);
        const params = {
          body: {
            fecha,
            cod_institucion: cod_institucion.result.codigo,
            periodo,
          },
          where:
            resultadoFinal !== null
              ? [
                  { key: "resultado", value: resultadoFinal },
                  { key: "id_rol", value: id_rol },
                ]
              : [{ key: "id_rol", value: id_rol }],
        };
        const query = EjecutarFuncionSQL(
          "aps_reporte_validacion_preliminar",
          params
        );

        pool
          .query(query)
          .then((result) => {
            if (result.rowCount > 0) {
              const resultFinal = [];
              forEach(result.rows, (item) => {
                resultFinal.push({
                  ...item,
                  fecha_carga: formatearFecha(new Date(item.fecha_carga)),
                });
              });
              respResultadoCorrectoObjeto200(res, resultFinal);
            } else
              respResultadoIncorrectoObjeto200(
                res,
                null,
                result.rows,
                `No existen errores registrados para esa fecha`
              );
          })
          .catch((err) => {
            throw err;
          });
      },
      EnviarCorreo_ErroresCargaArchivosPensionesSeguros: async () => {
        const { email, subject, description, id_rol } = req.body;
        const idRolFinal = id_rol ? id_rol : req.user.id_rol;
        const resultArray = [];
        const errorsArray = [];
        const users = await ObtenerUsuariosPorRol({ id_rol: idRolFinal });
        if (users.err)
          errorsArray.push({
            message: users?.err?.message && users?.err.message,
            err: users?.err,
          });

        const usersFinal = users.result;

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "contactojosegutierrez10@gmail.com",
            // user: "admin-jose-aps",
            pass: "svslrhedrsdtwlar",
          },
        });

        if (size(usersFinal) > 0) {
          for await (const item of usersFinal) {
            const emailFinal = email ? email : item.email;
            // const emailFinal = "milibrolunadepluton344@gmail.com";

            if (!validateEmail(emailFinal)) {
              errorsArray.push({ message: "Email no válido", emailFinal });
            } else {
              const mailOptions = {
                from: "APS validaciones",
                to: emailFinal,
                subject: subject ? subject : "Asunto APS",
                html: `
              <div>
                <h3>${description}</h3>
              </div>
              `,
              };

              await transporter
                .sendMail(mailOptions)
                .then((result) => {
                  resultArray.push(result);
                })
                .catch((err) => {
                  errorsArray.push({
                    message: err?.message && err.message,
                    err,
                  });
                });
            }
          }
        }

        if (errorsArray.length > 0) {
          throw errorsArray;
        }
        respResultadoCorrectoObjeto200(
          res,
          resultArray,
          `Correos enviados correctamente`
        );
      },
      ObtenerFechaOperacion_FechaOperacion: async () => {
        const { tipo_periodo, tipo_archivo, reproceso } = req.body; //tipo_archivo = PENSIONES O BOLSA
        let lastDateFinal;
        let tipoArchivoFinal;
        tipoArchivoFinal = tipo_archivo;
        const { id_rol, id_usuario } = req.user;
        const fechaOperacionMensual = () => {
          const year = lastDateFinal.getFullYear(); //2022
          const month = lastDateFinal.getMonth(); //06
          const day = lastDateFinal.getDay(); //30
          const firstDayMonth = new Date(year, month, 1); // 2022-06-01
          const lastDayMonth = agregarMeses(firstDayMonth, 2); // 2022-08-01
          const fechaOperacion = agregarDias(lastDayMonth, -1); // 2022-07-31

          return fechaOperacion;
        };
        const fechaOperacionDiaria = () => {
          if (tipoArchivoFinal === "PENSIONES") {
            const fechaOperacion = agregarDias(lastDateFinal, 1); //VIERNES + 1 = SABADO
            return fechaOperacion;
          }
          if (tipoArchivoFinal === "SEGUROS") {
            const fechaOperacion = agregarDias(lastDateFinal, 1); //VIERNES + 1 = SABADO
            return fechaOperacion;
          } else if (tipoArchivoFinal === "BOLSA") {
            const checkDate =
              reproceso === true
                ? lastDateFinal
                : agregarDias(lastDateFinal, 1); //VIERNES + 1 = SABADO
            let fechaOperacion = null;
            fechaOperacion = checkDate;
            return fechaOperacion;
          } else if (tipoArchivoFinal === "CUSTODIO") {
            const checkDate = agregarDias(lastDateFinal, 1); //VIERNES + 1 = SABADO
            let fechaOperacion = null;
            fechaOperacion = checkDate;
            return fechaOperacion;
          } else {
            return null;
          }
        };
        const FECHA_OPERACION = {
          M: fechaOperacionMensual,
          D: fechaOperacionDiaria,
        };

        let cod_institucion = undefined;
        if (tipo_archivo !== "BOLSA") {
          cod_institucion = (await ObtenerInstitucion(req.user)) || undefined;
          if (isUndefined(cod_institucion)) {
            respResultadoVacio404END(
              res,
              "No existe ninguna institución para este usuario."
            );
            return;
          }
        }

        if (nameTable === null) {
          respErrorServidor500END(res, {
            message: "No se especificó el tipo_archivo",
            value: FECHA_OPERACION[tipo_periodo],
          });
          return;
        }
        if (!tipo_periodo) {
          respDatosNoRecibidos400(res, "No se especifico el tipo periodo.");
          return;
        }
        let whereMax = [];
        if (tipo_archivo === "BOLSA") {
          whereMax = [{ key: "id_rol", value: id_rol }];
          if (reproceso === true)
            whereMax.push(
              { key: "reproceso", value: true },
              { key: "reprocesado", value: false },
              { key: "cargado", value: false }
            );
          else whereMax.push({ key: "cargado", value: true });
        } else if (tipo_archivo === "PENSIONES") {
          whereMax = [
            { key: "id_rol", value: id_rol },
            { key: "cod_institucion", value: cod_institucion.codigo },
            {
              key: "id_periodo",
              value:
                tipo_periodo === "D" ? 154 : tipo_periodo === "M" ? 155 : null,
            },
            { key: "cargado", value: true },
          ];
        } else if (tipo_archivo === "SEGUROS") {
          whereMax = [
            { key: "id_rol", value: id_rol },
            { key: "cod_institucion", value: cod_institucion.codigo },
            {
              key: "id_periodo",
              value:
                tipo_periodo === "D" ? 154 : tipo_periodo === "M" ? 155 : null,
            },
            { key: "cargado", value: true },
          ];
        } else if (tipo_archivo === "CUSTODIO") {
          whereMax = [
            { key: "id_rol", value: id_rol },
            { key: "cargado", value: true },
          ];
        }

        let queryMax;
        let maxFechaOperacion;
        if (tipo_archivo === "BOLSA" && reproceso === true) {
          queryMax = EscogerInternoUtil(nameTable, {
            select: ["fecha_operacion"],
            where: whereMax,
          });
          const resultQuery = await EjecutarQuery(queryMax);
          if (size(resultQuery) > 0) {
            const value = minBy(resultQuery, "fecha_operacion");
            if (isUndefined(value))
              throw new Error("No existe una fecha válida");
            maxFechaOperacion = value.fecha_operacion;
          } else maxFechaOperacion = null;
        } else {
          queryMax = ValorMaximoDeCampoUtil(nameTable, {
            fieldMax: "fecha_operacion",
            where: whereMax,
          });
          const resultQuery = await EjecutarQuery(queryMax);
          if (size(resultQuery) > 0 && !isNull(resultQuery?.[0]?.max))
            maxFechaOperacion = resultQuery[0].max;
          else maxFechaOperacion = null;
        }
        if (maxFechaOperacion === null) {
          respResultadoVacio404END(
            res,
            "No existe una fecha válida disponible"
          );
          return;
        }

        lastDateFinal = new Date(maxFechaOperacion);
        const result = FECHA_OPERACION[tipo_periodo]();
        if (isNaN(Date.parse(result)))
          throw new Error("Hubo un error al obtener la fecha de operación");
        else respResultadoCorrectoObjeto200(res, result);
      },
      Reporte_ValidaArchivoPensionesSeguros: async () => {
        const { fecha, id_rol, id_rol_cargas, cargado, estado } = req.body;
        const idRolFinal = id_rol ? id_rol : req.user.id_rol;
        const cargadoFinal =
          cargado === true || cargado === false ? cargado : null;
        const estadoFinal = isEmpty(estado) ? null : estado;

        if (Object.entries(req.body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }

        const queryValida = formatearQuery(
          `SELECT COUNT(*) 
          FROM public."APS_aud_valida_archivos_pensiones_seguros" 
          WHERE fecha_operacion=%L 
          AND validado=true 
          AND cod_institucion IN (
            SELECT DISTINCT cod_institucion 
            FROM public."APS_aud_carga_archivos_pensiones_seguros" 
            WHERE cargado = true 
            AND fecha_operacion = %L 
            AND id_rol IN (%L))`,
          [fecha, fecha, id_rol_cargas]
        );

        const params = { body: { fecha, idRolFinal } };
        if (cargadoFinal !== null || estadoFinal !== null) params.where = [];
        if (cargadoFinal !== null)
          params.where = [
            ...params.where,
            { key: "cargado", value: cargadoFinal },
          ];
        if (estadoFinal !== null)
          params.where = [
            ...params.where,
            { key: "estado", value: estadoFinal },
          ];

        const querys = [
          EjecutarFuncionSQL("aps_reporte_control_envio", params),
          EscogerInternoUtil("APS_aud_valida_archivos_pensiones_seguros", {
            select: ["*"],
            where: [
              { key: "fecha_operacion", value: fecha },
              { key: "validado", value: true },
              { key: "id_rol", value: idRolFinal },
            ],
          }),
          queryValida,
        ];
        querys.push(ListarUtil("APS_seg_usuario"));

        const results = await EjecutarVariosQuerys(querys);

        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        const usuarios = find(
          results.result,
          (item) => item.table === "APS_seg_usuario"
        );
        const counterRegistros = results.result?.[2]?.data?.[0]?.count;
        if (counterRegistros > 0) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            map(results.result[1].data, (item) => {
              return {
                id: item.id_valida_archivos,
                descripcion: "Diaria",
                estado: item.validado ? "Con Éxito" : "Con Error",
                cod_institucion: item.cod_institucion,
                fecha_operacion: item.fecha_operacion,
                nro_carga: item.nro_carga,
                fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
                usuario: find(
                  usuarios.data,
                  (itemF) => item.id_usuario === itemF.id_usuario
                )?.usuario,
                id_valida_archivos: item.id_valida_archivos,
                id_rol: item.id_rol,
                validado: item.validado,
              };
            }),
            "La información ya fue validada"
          );
          return;
        }
        const counterInformacion = results.result?.[0]?.data;
        if (size(counterInformacion) === 0) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            counterInformacion,
            "No existe ningún registro cargado para la fecha seleccionada"
          );
          return;
        }
        respResultadoCorrectoObjeto200(
          res,
          map(results.result[0].data, (item) => {
            return { id: item.id_carga_archivo, ...item };
          })
        );
      },
      ReporteInversionesContables_ValidaArchivoPensionesSeguros: async () => {
        const { fecha, periodo, id_rol_cargas, cargado, id_rol } = req.body;
        const idRolFinal = id_rol ? id_rol : req.user.id_rol;
        const whereAux = [];
        if (periodo)
          whereAux.push({
            key: "id_periodo",
            valuesWhereIn: map(
              filter(split(periodo, ","), (item) => size(item) > 0 && item),
              (item) => item
            ),
            whereIn: true,
          });
        if (size(id_rol_cargas) > 0)
          whereAux.push({
            key: "id_rol",
            valuesWhereIn: id_rol_cargas,
            whereIn: true,
          });
        if (size(cargado) > 0)
          whereAux.push({
            key: "cargado",
            valuesWhereIn: cargado,
            whereIn: true,
          });
        whereAux.push({ key: "fecha_operacion", value: fecha });
        const queryValida = formatearQuery(
          `SELECT COUNT(*) 
          FROM public."APS_aud_valida_archivos_pensiones_seguros" 
          WHERE fecha_operacion= %L
          AND validado=true 
          AND cod_institucion IN (
            SELECT DISTINCT cod_institucion 
            FROM public."APS_aud_carga_archivos_pensiones_seguros" 
            WHERE cargado = true 
            AND fecha_operacion = %L 
            AND id_rol IN (%L))`,
          [fecha, fecha, id_rol_cargas]
        );
        const querys = [
          EscogerInternoUtil("APS_aud_carga_archivos_pensiones_seguros", {
            select: ["*"],
            where: whereAux,
          }),
          EscogerInternoUtil(nameTable, {
            select: ["*"],
            where: [
              { key: "fecha_operacion", value: fecha },
              { key: "validado", value: true },
              { key: "id_rol", value: idRolFinal },
            ],
          }),
          queryValida,
          ListarUtil("APS_seg_usuario"),
        ];

        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        const usuarios = find(
          results.result,
          (item) => item.table === "APS_seg_usuario"
        );
        const counterRegistros = results.result?.[2]?.data?.[0]?.count;
        if (counterRegistros > 0) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            map(results.result[1].data, (item) => {
              return {
                id: item.id_valida_archivos,
                descripcion: "Diaria",
                estado: item.validado ? "Con Éxito" : "Con Error",
                cod_institucion: item.cod_institucion,
                fecha_operacion: item.fecha_operacion,
                nro_carga: item.nro_carga,
                fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
                usuario: find(
                  usuarios.data,
                  (itemF) => item.id_usuario === itemF.id_usuario
                )?.usuario,
                id_valida_archivos: item.id_valida_archivos,
                id_rol: item.id_rol,
                validado: item.validado,
              };
            }),
            "La información ya fue validada"
          );
          return;
        }
        const counterInformacion = results.result?.[0]?.data;
        if (size(counterInformacion) === 0) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            counterInformacion,
            "No existe ningún registro cargado para la fecha seleccionada"
          );
          return;
        }

        respResultadoCorrectoObjeto200(
          res,
          map(results.result[0].data, (item) => {
            return {
              id: item.id_carga_archivos,
              tipo_informacion: item.id_rol === 4 ? "Inversiones" : "Contables",
              descripcion: item.id_periodo === 154 ? "Diaria" : "Mensual",
              estado: item.cargado ? "Con Éxito" : "Con Error",
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: find(
                usuarios.result,
                (itemF) => item.id_usuario === itemF.id_usuario
              )?.usuario,
              id_carga_archivos: item.id_carga_archivos,
              id_rol: item.id_rol,
              cargado: item.cargado,
            };
          })
        );
      },
      Validar_ValidaArchivoPensionesSeguros: async () => {
        const { fecha, id_rol_valida, id_rol_archivos } = req.body;
        const { id_rol, id_usuario } = req.user;
        //#region SELECCIONANDO ARCHIVOS REQUERIDOS
        const idRolFinal = id_rol_archivos ? id_rol_archivos : req.user.id_rol;
        const params = { body: { fecha, idRolFinal } };
        const queryFilesRequired = EjecutarFuncionSQL(
          "aps_archivos_a_validar",
          params
        );
        const filesRequired = await EjecutarQuery(queryFilesRequired);
        if (size(filesRequired) === 0) {
          respResultadoVacio404END(res, "No existen archivos a validar");
          return;
        }
        //#endregion
        const idValidaArchivos = [];
        const institucionesError = [];
        //#region SELECCIONANDO LOS ERRORES
        const nameTableErrorsValida =
          id_rol_archivos === 7
            ? id_rol_valida === 4
              ? "aps_valida_pensiones_inversiones"
              : "aps_valida_pensiones_contables"
            : "aps_valida";
        const queryErrores = EjecutarFuncionSQL(nameTableErrorsValida, {
          body: { fecha },
        });
        const errores = await EjecutarQuery(queryErrores);
        forEach(errores, (item, index) => {
          institucionesError.push(item.cod_institucion);
        });
        //#endregion

        if (size(errores) > 0) {
          console.log("CON ERRORES");
          isError = true;
          const institucionesUnicas = uniq(
            map(filesRequired, (item) => item.cod_institucion)
          );
          for (let index = 0; index < institucionesUnicas.length; index++) {
            const item = institucionesUnicas[index];
            //#region NUMEROS DE CARGA POR INSTITUCION QUE VIENE DE LOS ERRORES
            const queryNroCarga = ValorMaximoDeCampoUtil(nameTable, {
              fieldMax: "nro_carga",
              where: [
                { key: "id_rol", value: id_rol },
                { key: "fecha_operacion", value: fecha },
                { key: "id_usuario", value: id_usuario },
                { key: "cod_institucion", value: item },
              ],
            });
            const cargaAux =
              (await EjecutarQuery(queryNroCarga)?.[0]?.max) || undefined;
            const carga = isUndefined(cargaAux)
              ? { nroCarga: 0, cod_institucion: item }
              : { nroCarga: cargaAux?.[0]?.max };
            //#endregion
            //#region INSERTANDO EN LA TABLA APS_aud_valida_archivos_pensiones_seguros
            const queryInsertValida = InsertarVariosUtil(nameTable, {
              body: [
                {
                  fecha_operacion: fecha,
                  cod_institucion: item,
                  nro_carga: parseInt(carga?.nroCarga) + 1,
                  fecha_carga: new Date(),
                  validado: false,
                  id_rol: id_rol,
                  id_usuario: id_usuario,
                  id_rol_carga: id_rol_valida,
                },
              ],
              returnValue: ["id_valida_archivos"],
            });

            const audInsertValida =
              (await EjecutarQuery(queryInsertValida)?.[0]) || undefined;
            if (isUndefined(audInsertValida))
              throw new Error("Error al registrar las validaciones");
            idValidaArchivos.push({
              cod_institucion: item,
              id_valida_archivos: audInsertValida?.id_valida_archivos,
            });
            //#endregion
            //#region INSERTANDO LOS ERRORES DE LOS METODOS DE CALIFICADORA RF, RV, OA, Custodio, 411, 412, 413 en la tabla APS_aud_errores_valida_archivos_pensiones_seguros
            const erroresInsertArray = [];
            forEach(errores, (itemError) => {
              if (itemError.cod_institucion === item) {
                erroresInsertArray.push({
                  id_valida_archivos: audInsertValida.id_valida_archivos,
                  archivo: itemError.archivo,
                  tipo_error: itemError.tipo_error,
                  descripcion: itemError.mensaje,
                  valor: itemError.valor,
                  enviada: itemError.enviada,
                  aps: itemError.aps,
                  fecha_informacion: itemError.fecha_informacion,
                  cod_institucion: item,
                });
              }
            });
            const queryInsertErrors = InsertarVariosUtil(nameTableErrors, {
              body: erroresInsertArray,
              returnValue: ["id_valida_archivos"],
            });
            const audInsertErrorsValida = await EjecutarQuery(
              queryInsertErrors
            );
            //#endregion
          }
        } else {
          console.log("SIN ERRORES");
          isError = false;
          const institucionesUnicas = uniq(
            map(filesRequired, (item) => item.cod_institucion)
          );
          for (let index = 0; index < institucionesUnicas.length; index++) {
            const item = institucionesUnicas[index];
            //#region NUMEROS DE CARGA POR INSTITUCION QUE VIENE DE LOS ERRORES
            const queryNroCarga = ValorMaximoDeCampoUtil(nameTable, {
              fieldMax: "nro_carga",
              where: [
                { key: "id_rol", value: id_rol },
                { key: "fecha_operacion", value: fecha },
                { key: "id_usuario", value: id_usuario },
                { key: "cod_institucion", value: item },
              ],
            });
            const cargaAux =
              (await EjecutarQuery(queryNroCarga)?.[0]?.max) || undefined;
            const carga = isUndefined(cargaAux)
              ? { nroCarga: 0, cod_institucion: item }
              : { nroCarga: cargaAux?.[0]?.max };
            //#endregion
            //#region INSERTANDO EN LA TABLA APS_aud_valida_archivos_pensiones_seguros
            const queryInsertValida = InsertarVariosUtil(nameTable, {
              body: [
                {
                  fecha_operacion: fecha,
                  cod_institucion: item,
                  nro_carga: parseInt(carga?.nroCarga) + 1,
                  fecha_carga: new Date(),
                  validado: true,
                  id_rol: id_rol,
                  id_usuario: id_usuario,
                  id_rol_carga: id_rol_valida,
                },
              ],
              returnValue: ["id_valida_archivos"],
            });

            const audInsertValida =
              (await EjecutarQuery(queryInsertValida)?.[0]) || undefined;
            if (isUndefined(audInsertValida))
              throw new Error("Error al registrar las validaciones");
            idValidaArchivos.push({
              cod_institucion: item,
              id_valida_archivos: audInsertValida?.id_valida_archivos,
            });
            //#endregion
          }
        }

        if (size(errores) > 0)
          respResultadoCorrectoObjeto200(
            res,
            {
              idValidaArchivos,
              errores: errores,
            },
            "Existen errores al válidar"
          );
        else
          respResultadoCorrectoObjeto200(
            res,
            {
              idValidaArchivos,
              errores: errores,
              validacion: map(filesRequired, (item) => {
                return {
                  archivo: item.nombre,
                  mensaje: `La información está correcta`,
                  fecha,
                };
              }),
            },
            "No existen errores al válidar"
          );
      },
      Validar_ValoraArchivoPensionesSeguros: async () => {
        const { fecha, id_rol_valora } = req.body;
        const { id_rol, id_usuario } = req.user;
        const idRolFinal = id_rol_valora ? id_rol_valora : id_rol;
        const querys = [
          EjecutarProcedimientoSQL(
            idRolFinal === 10
              ? "aps_proc_valoracion_cartera_seguros"
              : "aps_proc_valoracion_cartera_pensiones",
            {
              body: {
                fecha,
              },
            }
          ),
          EjecutarFuncionSQL("aps_valida_valoracion_cartera", {
            body: { fecha },
          }),
        ];
        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
        const valoracion = results.result[1].data;
        if (size(valoracion) > 0) {
          //#region INSTITUCIONES
          const instituciones = uniq(
            map(valoracion, (item) => item.cod_institucion)
          );
          //#endregion
          //#region CARGAS
          const queryCargas = EscogerInternoUtil(nameTable, {
            select: ["fecha_operacion, nro_carga, cod_institucion"],
            where: [
              { key: "fecha_operacion", value: fecha },
              { key: "id_rol", value: idRolFinal },
              { key: "id_usuario", value: id_usuario },
              {
                key: "cod_institucion",
                valuesWhereIn: map(instituciones, (item) => `'${item}'`),
                whereIn: true,
              },
            ],
            orderby: { field: "nro_carga DESC" },
          });
          const cargas = uniqBy(
            (await EjecutarQuery(queryCargas)) || [],
            "cod_institucion"
          );
          //#endregion
          //#region NUEVAS CARGAS
          const queryNuevaCarga = InsertarVariosUtil(nameTable, {
            body: map(instituciones, (codigo) => {
              const maxAux = max(
                filter(cargas, (itemF) => itemF.cod_institucion === codigo),
                (item) => {
                  return item.nro_carga;
                }
              );
              return {
                fecha_operacion: fecha,
                cod_institucion: codigo,
                nro_carga: size(cargas) > 0 ? maxAux.nro_carga + 1 : 1,
                fecha_carga: new Date(),
                valorado: false,
                id_rol: idRolFinal,
                id_usuario,
              };
            }),
            returnValue: ["*"],
          });
          const nuevaCarga = await EjecutarQuery(queryNuevaCarga);
          //#endregion
          //#region INSERCION DE ERRORES
          const InsertarErroresArray = [];
          forEach(nuevaCarga, (itemCarga) => {
            const erroresAux = filter(
              valoracion,
              (itemF) => itemF.cod_institucion === itemCarga.cod_institucion
            );
            InsertarErroresArray.push(
              ...map(erroresAux, (itemAux) => {
                return {
                  id_valida_archivos: itemCarga.id_valora_archivos,
                  tipo_instrumento: itemAux.tipo_instrumento,
                  serie: itemAux.serie,
                  descripcion: itemAux.descripcion,
                  enviada: itemAux.enviada,
                  aps: itemAux.aps,
                  cod_institucion: itemCarga.cod_institucion,
                  fecha_informacion: itemCarga.fecha_operacion,
                };
              })
            );
          });
          const queryInsertarErrores = InsertarVariosUtil(nameTableErrors, {
            body: InsertarErroresArray,
            returnValue: ["*"],
          });
          const insersionErrores = await EjecutarQuery(queryInsertarErrores);
          //#endregion

          respResultadoCorrectoObjeto200(res, {
            cargas: nuevaCarga,
            errores: insersionErrores,
          });
        } else {
          //#region OBTENER COD_INSTITUCION
          const queryInstitucion = EscogerInternoUtil(
            "APS_aud_carga_archivos_pensiones_seguros",
            {
              select: ["*"],
              where: [
                { key: "fecha_operacion", value: fecha },
                { key: "cargado", value: true },
                { key: "id_periodo", value: "154" },
                { key: "id_rol", value: 8 },
              ],
            }
          );
          const institucion = await EjecutarQuery(queryInstitucion);
          //#endregion
          //#region INSTITUCIONES
          const instituciones = uniq(
            map(institucion, (item) => item.cod_institucion)
          );
          //#endregion
          //#region CARGAS
          const queryCargas = EscogerInternoUtil(nameTable, {
            select: ["fecha_operacion, nro_carga, cod_institucion"],
            where: [
              { key: "fecha_operacion", value: fecha },
              { key: "id_rol", value: idRolFinal },
              { key: "id_usuario", value: id_usuario },
              {
                key: "cod_institucion",
                valuesWhereIn: map(instituciones, (item) => `'${item}'`),
                whereIn: true,
              },
            ],
            orderby: { field: "nro_carga DESC" },
          });
          const cargas = uniqBy(
            (await EjecutarQuery(queryCargas)) || [],
            "cod_institucion"
          );
          //#endregion
          //#region NUEVAS CARGAS
          const queryNuevaCarga = InsertarVariosUtil(nameTable, {
            body: map(instituciones, (codigo) => {
              const maxAux = max(
                filter(cargas, (itemF) => itemF.cod_institucion === codigo),
                (item) => {
                  return item.nro_carga;
                }
              );
              return {
                fecha_operacion: fecha,
                cod_institucion: codigo,
                nro_carga: cargas.ok === false ? 1 : maxAux.nro_carga + 1,
                fecha_carga: new Date(),
                valorado: true,
                id_rol: idRolFinal,
                id_usuario,
              };
            }),
            returnValue: ["*"],
          });
          const nuevaCarga = await EjecutarQuery(queryNuevaCarga);
          //#endregion

          respResultadoCorrectoObjeto200(res, {
            cargas: nuevaCarga,
            errores: [],
          });
        }
      },
      ObtenerInformacion_ValoraArchivoPensionesSeguros: async () => {
        const { fecha, id_rol, id_rol_cargas, cargado, estado } = req.body;
        if (!fecha) {
          respDatosNoRecibidos400(res, "La fecha es obligatorio");
          return;
        }
        const querys = [
          EscogerInternoUtil("APS_aud_carga_archivos_pensiones_seguros", {
            select: ["*"],
            where: [
              { key: "fecha_operacion", value: fecha },
              { key: "cargado", value: cargado },
              { key: "id_rol", valuesWhereIn: id_rol_cargas, whereIn: true },
              { key: "id_periodo", value: 154 },
            ],
          }),
          EscogerInternoUtil("APS_oper_tipo_cambio", {
            select: ["*"],
            where: [{ key: `fecha`, value: fecha }],
          }),
          EscogerInternoUtil("APS_oper_archivo_n", {
            select: ["*"],
            where: [{ key: `fecha`, value: fecha }],
          }),
          formatearQuery(
            `SELECT COUNT(*) FROM public."APS_aud_valora_archivos_pensiones_seguros" WHERE fecha_operacion=%L AND valorado=true AND cod_institucion IN (SELECT DISTINCT cod_institucion FROM public."APS_aud_carga_archivos_pensiones_seguros" WHERE cargado = true AND fecha_operacion = %L AND id_rol IN (%L))`,
            [fecha, fecha, id_rol_cargas]
          ),
        ];
        id_rol === 10
          ? querys.push(
              `SELECT * FROM public."APS_view_existe_valores_seguros";`
            )
          : id_rol === 7
          ? querys.push(
              `SELECT * FROM public."APS_view_existe_valores_pensiones"`
            )
          : null;

        querys.push(ListarUtil("APS_seg_usuario"));
        console.log(querys);
        const results = await EjecutarVariosQuerys(querys);

        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;

        const messages = [];
        let dataFinalAux = null;

        if (size(results.result[1].data) === 0)
          messages.push("No existe Tipo de Cambio para la Fecha seleccionada");

        if (size(results.result[2].data) === 0)
          messages.push("No existe información en la Bolsa (Archivo N)");

        const counterRegistros = results.result?.[3]?.data?.[0]?.count;
        if (counterRegistros > 0)
          messages.push("La información ya fue valorada");

        const counterVistas = results.result?.[4]?.data;
        if (size(counterVistas) > 0) {
          dataFinalAux = counterVistas;
          messages.push(
            "No existen características para los siguientes valores, favor registrar"
          );
        }
        if (size(results.result?.[0]) === 0)
          messages.push("No existen registros en valoracion cartera");

        if (size(messages) > 0) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            dataFinalAux || [],
            messages
          );
          return;
        }

        respResultadoCorrectoObjeto200(
          res,
          map(results.result?.[0].data, (item) => {
            return {
              descripcion:
                item.id_periodo === 154
                  ? "Diaria"
                  : `Mensual ${item.id_periodo}`,
              estado: item.cargado ? "Con Éxito" : "Con Error",
              cod_institucion: item.cod_institucion,
              fecha_operacion: item.fecha_operacion,
              nro_carga: item.nro_carga,
              fecha_carga: dayjs(item.fecha_carga).format("YYYY-MM-DD HH:mm"),
              usuario: find(
                results.result?.[5].data,
                (itemF) => item.id_usuario === itemF.id_usuario
              )?.usuario,
              id_carga_archivo: item.id_carga_archivos,
              id_rol: item.id_rol,
              cargado: item.cargado,
            };
          })
        );
      },
      ReporteExito_ValorArchivoPensionesSeguros: async () => {
        const { id_valora_archivos } = req.body;
        await pool
          .query(
            EscogerInternoUtil(nameTable, {
              select: ["*"],
              where: [
                { key: "id_valora_archivos", value: id_valora_archivos },
                { key: "valorado", value: true },
              ],
            })
          )
          .then((result) => {
            respResultadoCorrectoObjeto200(
              res,
              map(result.rows, (item) => {
                return {
                  cod_institucion: item.cod_institucion,
                  descripcion: "La información fue valorada correctamente",
                  fecha_carga: item.fecha_carga,
                };
              })
            );
          })
          .catch((err) => {
            throw err;
          });
      },
    };

    await OPERATION?.[methodName]();
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  ListarCRUD,
  ListarClasificadorCRUD,
  BuscarCRUD,
  BuscarDiferenteCRUD,
  EscogerCRUD,
  EscogerClasificadorCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  EliminarCRUD,
  RealizarOperacionAvanzadaCRUD,
  ListarCompletoCRUD,
};
