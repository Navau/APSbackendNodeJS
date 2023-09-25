const nodemailer = require("nodemailer");
const jwt = require("../services/jwt.service");
const pool = require("../database");
const fs = require("fs");
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
  join,
  replace,
  chain,
  flatMap,
  differenceBy,
  differenceWith,
  intersectionBy,
  intersectionWith,
  every,
  take,
  some,
  mapValues,
  merge,
  isInteger,
} = require("lodash");
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
  EliminarMultiplesTablasUtil,
  AlterarSequenciaMultiplesTablasUtil,
  AlterarSequenciaUtil,
} = require("./consulta.utils");
const {
  ObtenerDatosCriticosAuditoria,
  ObtenerInformacionAnteriorAuditoria,
  LogAuditoria,
  LogDetAuditoria,
  VerificarPermisoTablaUsuarioAuditoria,
  VerificarPermisoVariasTablasUsuarioAuditoria,
  ActualizarRegistroAInfoAnterior,
} = require("./auditoria.utils");
const {
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respDatosNoRecibidos200END,
  respResultadoVacio404END,
  respUsuarioNoAutorizado200END,
  respResultadoIncorrectoObjeto200,
  respDatosNoRecibidos400,
  respDescargarArchivos200,
  respResultadoVacioObject200,
  respArchivoErroneo415,
  respArchivoErroneo200,
  respIDNoRecibido400,
} = require("./respuesta.utils");
const { ValidarDatosValidacion } = require("./validacion.utils");
const {
  formatearFecha,
  tipoReporteControlEnvio,
  validateEmail,
  agregarDias,
  agregarMeses,
} = require("./formatearDatos");
const { formatoArchivo } = require("./formatoCamposArchivos.utils");
const dayjs = require("dayjs");
const { KEY_AUX } = require("../config");
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
    id = undefined,
    queryOptions,
    tableOptions = [],
    extraExecuteQueryOptions = {},
  } = paramsF;
  const action = "Listar";
  const {
    query: { key, limit, offset },
  } = req;
  try {
    if (key !== KEY_AUX) {
      // const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      //   table: nameTable,
      //   action,
      //   id,
      //   req,
      //   res,
      // });
      // if (permiso.ok === false) {
      //   respUsuarioNoAutorizado200END(res, null, action, nameTable);
      //   return;
      // }
    }
    const querys = [];
    let activoAuxMain = undefined;
    for await (item of queryOptions) {
      let query = "";
      const tableAux = item.table;
      const queryUrl = item.main === true ? { limit, offset } : {};
      if (item?.where) {
        delete item.table;
        const queryParams = item;
        query = EscogerInternoUtil(tableAux, queryParams);
      } else {
        const activoAux = await CampoActivoAux(tableAux);
        query = isUndefined(activoAux)
          ? ListarUtil(tableAux, { activo: null, ...queryUrl })
          : ListarUtil(tableAux, { ...queryUrl });
        activoAuxMain = item.main === true ? activoAux : undefined;
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
    const tableMain = find(queryOptions, (item) => item.main);
    if (isUndefined(tableMain))
      throw new Error("Error al ejecutar la consulta a la BD");
    const queryTotal = isUndefined(activoAuxMain)
      ? ListarUtil(tableMain.table, { activo: null })
      : ListarUtil(tableMain.table);
    const totalData = await EjecutarQuery(queryTotal);
    respResultadoCorrectoObjeto200(res, {
      result: resultFinal,
      sizeData: size(totalData),
    });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ListarCRUD(paramsF) {
  const { req, res, nameTable, nameView, id = undefined } = paramsF;
  const action = "Listar";
  const {
    query: { key, limit, offset },
  } = req;
  try {
    if (key !== KEY_AUX) {
      // const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      //   table: nameTable,
      //   action,
      //   id,
      //   req,
      //   res,
      // });
      // if (permiso.ok === false) {
      //   respUsuarioNoAutorizado200END(res, null, action, nameTable);
      //   return;
      // }
    }
    const query = isUndefined(await CampoActivoAux(nameTable))
      ? ListarUtil(nameView || nameTable, { activo: null, limit, offset })
      : ListarUtil(nameView || nameTable, { limit, offset });

    const dataTotal = await EjecutarQuery(
      isUndefined(await CampoActivoAux(nameTable))
        ? ListarUtil(nameView || nameTable, { activo: null })
        : ListarUtil(nameView || nameTable)
    );

    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, {
          result: result.rows,
          sizeData: size(dataTotal),
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ListarClasificadorCRUD(paramsF) {
  const {
    req,
    res,
    nameTable,
    nameView,
    id = undefined,
    idClasificadorComunGrupo,
    valueId,
  } = paramsF;
  const action = "Listar";
  const {
    query: { key, limit, offset },
  } = req;
  try {
    if (key !== KEY_AUX) {
      // const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      //   table: nameTable,
      //   action,
      //   id,
      //   req,
      //   res,
      // });
      // if (permiso.ok === false) {
      //   respUsuarioNoAutorizado200END(res, null, action, nameTable);
      //   return;
      // }
    }
    const params = {
      clasificador: true,
      idClasificadorComunGrupo,
      valueId,
    };

    const query = isUndefined(await CampoActivoAux(nameTable))
      ? ListarUtil(nameView || nameTable, {
          ...params,
          activo: null,
          limit,
          offset,
        })
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
  const { req, res, nameTable, id = undefined } = paramsF;
  const action = "Buscar";
  const {
    body: { key },
    query: { limit, offset },
  } = req;
  try {
    if (key !== KEY_AUX) {
      // const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      //   table: nameTable,
      //   action,
      //   id,
      //   req,
      //   res,
      // });
      // if (permiso.ok === false) {
      //   respUsuarioNoAutorizado200END(res, null, action, nameTable);
      //   return;
      // }
    }
    const body = req.body;
    delete body?.key;
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
    if (!isUndefined(limit)) params.limit = limit;
    if (!isUndefined(offset)) params.offset = offset;
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
  const { req, res, nameTable, id = undefined } = paramsF;
  const action = "Buscar";
  const {
    body: { key },
    query: { limit, offset },
  } = req;
  try {
    if (key !== KEY_AUX) {
      // const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      //   table: nameTable,
      //   action,
      //   id,
      //   req,
      //   res,
      // });
      // if (permiso.ok === false) {
      //   respUsuarioNoAutorizado200END(res, null, action, nameTable);
      //   return;
      // }
    }
    const body = req.body;
    delete body?.key;
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
    if (!isUndefined(limit)) params.limit = limit;
    if (!isUndefined(offset)) params.offset = offset;
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
  const { req, res, nameTable, id = undefined, login } = paramsF;
  const action = "Escoger";
  const {
    body: { key },
    query: { limit, offset },
  } = req;
  try {
    if (isUndefined(login) && key !== KEY_AUX) {
      // const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      //   table: nameTable,
      //   action,
      //   id,
      //   req,
      //   res,
      // });
      // if (permiso.ok === false) {
      //   respUsuarioNoAutorizado200END(res, null, action, nameTable);
      //   return;
      // }
    }
    const body = req.body;
    delete body?.login;
    delete body?.key;
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
    const totalData = await EjecutarQuery(EscogerUtil(nameTable, params));
    if (!isUndefined(limit)) params.limit = limit;
    if (!isUndefined(offset)) params.offset = offset;
    const query = EscogerUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, {
          result: result.rows,
          sizeData: size(totalData),
        });
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
    id = undefined,
    idClasificadorComunGrupo,
    valueId,
    nameTableGroup,
  } = paramsF;
  const action = "Escoger";
  const {
    body: { key },
  } = req;
  try {
    if (key !== KEY_AUX) {
      // const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      //   table: nameTable,
      //   action,
      //   id,
      //   req,
      //   res,
      // });
      // if (permiso.ok === false) {
      //   respUsuarioNoAutorizado200END(res, null, action, nameTable);
      //   return;
      // }
    }
    delete req.body?.key;
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
  const { req, res, nameTable, newID = undefined, id = undefined } = paramsF;
  const action = "Insertar";
  const { key } = req.body;
  try {
    if (key !== KEY_AUX) {
      const permiso = await VerificarPermisoTablaUsuarioAuditoria({
        table: nameTable,
        action,
        id,
        req,
        res,
      });
      if (permiso.ok === false) {
        respUsuarioNoAutorizado200END(res, null, action, nameTable);
        return;
      }
    }
    delete req.body?.key;
    const body = req.body;
    if (size(body) === 0) {
      respDatosNoRecibidos200END(res);
      return;
    }

    const tablasUsuarioRegistrador = await EjecutarQuery(
      EscogerInternoUtil("APS_seg_view_tablas_id_usuario_registro")
    );

    if (
      find(tablasUsuarioRegistrador, (table) => table.table_name === nameTable)
    )
      body.id_usuario = req.user.id_usuario;

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
  const { req, res, nameTable, id = undefined, newID } = paramsF;
  let registroAnterior = undefined;
  let idInfo = undefined;
  const { key } = req.body;
  try {
    const action = "Actualizar";
    if (key !== KEY_AUX) {
      const permiso = await VerificarPermisoTablaUsuarioAuditoria({
        table: nameTable,
        action,
        id,
        req,
        res,
      });
      if (permiso.ok === false) {
        respUsuarioNoAutorizado200END(res, null, action, nameTable);
        return;
      }
    }
    delete req.body?.key;
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
    idInfo = ValidarIDActualizarUtil(nameTable, body, newID);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
      return;
    }

    //#region OBTENIENDO INFORMACION ANTERIOR, ESTA INFORMACION SE OBTIENE MEDIANTE EL ID QUE SE QUIERE ACTUALIZAR
    const infoAnterior = await ObtenerInformacionAnteriorAuditoria({
      nameTable,
      idInfo,
    });
    if (size(infoAnterior) <= 0) {
      respResultadoVacio404END(
        res,
        "No existe la información que se desea actualizar"
      );
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
    //#endregion

    //#region AQUI SE REALIZA LA OPERACION DE ACTUALIZAR EL REGISTRO ESPECIFICADO
    const params = {
      body: body,
      idKey: idInfo.idKey,
      idValue: idInfo.idValue,
      returnValue: ["*"],
    };
    const query = ActualizarUtil(nameTable, params);
    const queryRegisotrAnterior = EscogerInternoUtil(nameTable, {
      select: ["*"],
      where: [{ key: idInfo.idKey, value: idInfo.idValue }],
    });
    registroAnterior =
      (await EjecutarQuery(queryRegisotrAnterior))?.[0] || undefined;
    const actualizacion = (await EjecutarQuery(query))?.[0] || undefined;
    if (isUndefined(registroAnterior))
      throw new Error("Error al obtener el registro anterior");

    if (
      (!isUndefined(body?.password) ||
        !isNull(body?.password) ||
        !isEmpty(body?.password)) &&
      !isUndefined(req.user?.token_api)
    ) {
      const { token_api } = req.user;
      const token = {
        token_value: token_api.access_token,
        token_type: token_api.token_type,
      };
      const data = {
        usuario: registroAnterior.usuario,
        app: APP_GUID,
        // oldPassword: old_password,
        // newPassword: new_password,
      };
      // await actualizarContraseñaUsuario(token, data);
    }
    //#endregion

    //#region REGISTRANDO EN LAS TABLAS DE LOG Y LOGDET
    if (size(criticos) > 0 && size(infoAnterior) > 0) {
      console.log("-----------------------------------");
      console.log("======================");
      console.log("REGISTRANDO AUDITORIA");
      console.log("======================");
      console.log("===INICIO AUDITORIA===");
      const idTablaAccion = criticos[0].id_tabla_accion;
      const idAccion = criticos[0].id_accion;
      const log =
        (
          await LogAuditoria({
            req,
            res,
            id_registro: idInfo.idValue,
            id_tabla_accion: idTablaAccion ? idTablaAccion : 12,
            id_accion: idAccion,
          })
        )?.[0] || undefined;
      if (isUndefined(log)) throw new Error("Error al obtener el log");
      const logDet = await LogDetAuditoria({
        req,
        res,
        registroAnterior,
        id_log: log.id_log || undefined,
      });
      console.log("=====FIN AUDITORIA====");
    }
    //#endregion
    respResultadoCorrectoObjeto200(
      res,
      actualizacion,
      "Información actualizada correctamente"
    );
  } catch (err) {
    !isUndefined(registroAnterior) &&
      !isUndefined(idInfo) &&
      (await ActualizarRegistroAInfoAnterior(
        nameTable,
        registroAnterior,
        idInfo
      ));
    respErrorServidor500END(res, err);
  }
}

async function EliminarCRUD(paramsF) {
  const { req, res, nameTable, id = undefined } = paramsF;
  try {
    const action = "Eliminar";
    // TO DO: EXTREMO!!! INFORMAR DE ESTO
    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: nameTable,
      action,
      id,
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
    id = undefined,
    methodName,
    action = undefined,
  } = paramsF;
  let key = undefined;
  if (!isUndefined(req.body.key)) key = req.body.key;
  if (!isUndefined(req.query.key)) key = req.query.key;
  try {
    if (
      (!isUndefined(action) &&
        (!isUndefined(nameTable) || !isUndefined(id)) &&
        key !== KEY_AUX &&
        action === "Insertar") ||
      action === "Actualizar"
    ) {
      const permiso = await VerificarPermisoTablaUsuarioAuditoria({
        table: nameTable,
        action,
        id,
        req,
        res,
      });
      if (permiso.ok === false) {
        respUsuarioNoAutorizado200END(res, null, action, nameTable);
        return;
      }
    }
    //TODO: Sanitizar las entradas de req.body, hay que crear una funcion en validacion.utils.js, que realize validaciones en yup basadas en las opciones que se le pase.

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
          where: [
            {
              key: `"APS_seg_usuario".id_usuario`,
              value: id_usuario,
            },
          ],
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
            {
              key: `"APS_seg_usuario".id_usuario`,
              value: id_usuario,
            },
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
        const { id_rol } = req.user;
        const modulos = await EjecutarQuery(
          EscogerInternoUtil("APS_view_modulos_menu", {
            select: ["*"],
            where: [{ key: "id_rol", value: id_rol }],
          })
        );
        const submodulos = await EjecutarQuery(
          EscogerInternoUtil("APS_view_submodulos_menu", {
            select: ["*"],
            where: [{ key: "id_rol", value: id_rol }],
          })
        );
        const menuFinal = FormatearObtenerMenuAngUtil(modulos, submodulos);
        respResultadoCorrectoObjeto200(res, menuFinal);
      },
      CambiarPermisos_Permiso: async () => {
        const { permisos, id_rol } = req.body;
        //*#region INFORMACION INICIAL
        const permisosFiltrados = sortBy(
          filter(permisos, (permiso) => {
            return every(
              permiso.submodulos,
              (submodulo) =>
                !isNull(submodulo.id_submodulo) && !isNull(submodulo.id_tabla)
            );
          }),
          "id_modulo"
        );
        const submodulos = [];
        const permisosFinales = {
          insercionesMenus: [],
          actualizacionesMenus: [],
          insercionesPermisos: [],
          actualizacionesPermisos: [],
        };
        //#endregion

        //*#region ACTUALIZAR LOS PERMISOS DE LOS MENUS DE UN ID_ROL
        forEach(permisosFiltrados, (permiso) =>
          submodulos.push(...permiso.submodulos)
        );
        const queryPermisoMenu = EscogerInternoUtil(
          "APS_seg_permiso_menu_rol",
          {
            select: ["*"],
            where: [{ key: "id_rol", value: id_rol }],
          }
        );
        const permisosMenus = await EjecutarQuery(queryPermisoMenu);
        const diferenciasSubmodulosMenus = differenceBy(
          submodulos,
          permisosMenus,
          "id_submodulo"
        );
        //? INSERTAR REGISTROS SI ES QUE NO EXISTEN EN LA TABLA APS_seg_permiso_menu_rol
        if (size(diferenciasSubmodulosMenus) > 0) {
          const queryInsertNuevosPermisosMenus = InsertarVariosUtil(
            "APS_seg_permiso_menu_rol",
            {
              body: map(diferenciasSubmodulosMenus, (submodulo) => ({
                id_rol,
                id_submodulo: submodulo.id_submodulo,
                permiso: submodulo.esCompleto,
              })),
              returnValue: ["*"],
            }
          );
          const permisosNuevos = await EjecutarQuery(
            queryInsertNuevosPermisosMenus
          );
          permisosFinales.insercionesMenus = permisosNuevos;
        }

        //? ACTUALIZAR LOS REGISTROS DE PERMISOS SI ES QUE HAY DIFERENCIAS ENTRE LO QUE VIENE Y LO QUE ESTA REGISTRADO
        const diferenciasPermisosMenus = differenceWith(
          permisosMenus,
          submodulos,
          (value1, value2) => {
            return (
              value1.permiso === value2.esCompleto &&
              value1.id_submodulo === value2.id_submodulo
            );
          }
        );
        const querysUpdate = map(diferenciasPermisosMenus, (permisoMenu) => {
          return ActualizarUtil("APS_seg_permiso_menu_rol", {
            body: { permiso: !permisoMenu.permiso },
            idKey: "id_permiso_menu",
            idValue: permisoMenu.id_permiso_menu,
            returnValue: ["*"],
          });
        });
        await Promise.all(
          map(querysUpdate, async (query) => await EjecutarQuery(query))
        )
          .then((response) => {
            permisosFinales.actualizacionesMenus = map(
              response,
              (item) => item[0]
            );
          })
          .catch((err) => {
            throw err;
          });
        //#endregion

        //*#region INSERTAR REGISTROS EN LA TABLA APS_seg_tabla_accion
        await EjecutarQuery(
          EjecutarFuncionSQL("insertar_registros_tabla_accion")
        );
        //#endregion

        //*#region CONSULTAS DE PERMISOS Y TABLAS ACCIONES
        const permisosBD = await EjecutarQuery(
          EscogerInternoUtil("APS_seg_permiso", {
            select: ["*"],
            where: [{ key: "id_rol", value: id_rol }],
          })
        );
        const idsTablas = map(
          flatMap(permisosFiltrados, "submodulos"),
          (submodulo) => submodulo.id_tabla
        );
        const tablasAcciones = await EjecutarQuery(
          EscogerInternoUtil("APS_view_tabla_accion_descripcion", {
            select: ["*"],
            where: [
              { key: "id_tabla", valuesWhereIn: idsTablas, whereIn: true },
            ],
          })
        );
        //#endregion

        //*#region ACTUALIZAR LOS PERMISOS DE LAS ACCIONES
        const submodulosAux = map(
          flatMap(permisosFiltrados, "submodulos"),
          (submodulo) => submodulo
        );
        const tablasAccionesConEspecificaciones = map(
          tablasAcciones,
          (itemTA) => {
            const submoduloFind = find(
              submodulosAux,
              (submodulo) => submodulo.id_tabla === itemTA.id_tabla
            );
            return {
              ...itemTA,
              esCompleto: submoduloFind?.esCompleto || false,
              tabla: submoduloFind?.tabla,
            };
          }
        );

        const insertarNuevosPermisos = [];
        const actualizarNuevosPermisos = [];

        forEach(tablasAccionesConEspecificaciones, (itemTA) => {
          const permiso = find(
            permisosBD,
            (permisoBD) => permisoBD.id_tabla_accion === itemTA.id_tabla_accion
          );

          const objectToPush = {
            id_rol,
            id_tabla_accion: itemTA?.id_tabla_accion,
            permiso: `${itemTA?.accion} ${itemTA?.tabla}`,
            activo: itemTA?.esCompleto,
          };

          if (isUndefined(permiso)) {
            if (itemTA.esCompleto === true) {
              insertarNuevosPermisos.push(objectToPush);
            }
          } else {
            if (itemTA.esCompleto !== permiso.activo) {
              actualizarNuevosPermisos.push({
                ...objectToPush,
                id_permiso: permiso.id_permiso,
              });
            }
          }
        });
        // console.log("insertarNuevosPermisos", insertarNuevosPermisos);
        // console.log("actualizarNuevosPermisos", actualizarNuevosPermisos);
        //? INSERTAR REGISTROS SI ES QUE NO EXISTEN EN LA TABLA APS_seg_permiso
        if (size(insertarNuevosPermisos) > 0) {
          const queryInsertNuevosPermisos = InsertarVariosUtil(
            "APS_seg_permiso",
            {
              body: insertarNuevosPermisos,
              returnValue: ["*"],
            }
          );
          const permisosNuevos = await EjecutarQuery(queryInsertNuevosPermisos);
          permisosFinales.insercionesPermisos = permisosNuevos;
        }

        //? ACTUALIZAR LOS REGISTROS DE PERMISOS SI ES QUE HAY DIFERENCIAS ENTRE LO QUE VIENE Y LO QUE ESTA REGISTRADO
        if (size(actualizarNuevosPermisos) > 0) {
          const queryActualizarPermisos = map(
            actualizarNuevosPermisos,
            (permiso) => {
              return ActualizarUtil("APS_seg_permiso", {
                body: permiso,
                idKey: "id_permiso",
                idValue: permiso.id_permiso,
                returnValue: ["*"],
              });
            }
          );
          await Promise.all(
            map(
              queryActualizarPermisos,
              async (query) => await EjecutarQuery(query)
            )
          )
            .then((response) => {
              permisosFinales.actualizacionesPermisos = map(
                response,
                (item) => item[0]
              );
            })
            .catch((err) => {
              throw err;
            });
        }

        //#endregion

        respResultadoCorrectoObjeto200(
          res,
          permisosFinales,
          "Permisos actualizados correctamente"
        );
      },
      ListarPermisos_Permiso: async () => {
        const { id_rol } = req.body;
        const queryModulos = EscogerInternoUtil("APS_seg_view_listar_modulos");
        const queryPermisoMenu = EscogerInternoUtil(
          "APS_seg_permiso_menu_rol",
          {
            select: ["*"],
            where: [
              { key: "id_rol", value: id_rol },
              { key: "permiso", value: true },
            ],
          }
        );
        const modulosPrincipales = await EjecutarQuery(queryModulos);
        const permisosMenus = await EjecutarQuery(queryPermisoMenu);

        const resultModulos = chain(modulosPrincipales)
          .groupBy("id_modulo")
          .map((modulos) => ({
            id_modulo: modulos[0].id_modulo,
            modulo: modulos[0].modulo,
            descripcion_modulo: modulos[0].descripcion_modulo,
            esCompleto: true,
            esTodoCompleto: true,
            submodulos: chain(modulos)
              .groupBy("id_submodulo")
              .map((submodulos) => ({
                id_submodulo: submodulos[0].id_submodulo,
                submodulo: submodulos[0].submodulo,
                id_tabla: submodulos[0].id_tabla,
                tabla: submodulos[0].tabla,
                descripcion_tabla: submodulos[0].descripcion_tabla,
                esCompleto: false,
              }))
              .value(),
          }))
          .value();
        forEach(resultModulos, (modulo) => {
          forEach(modulo.submodulos, (submodulo) => {
            const menuDataIntersection = find(
              permisosMenus,
              (permisoMenu) =>
                permisoMenu.id_submodulo === submodulo.id_submodulo
            );
            submodulo.esCompleto = !isUndefined(menuDataIntersection);
          });
        });
        forEach(resultModulos, (modulo) => {
          forEach(modulo.submodulos, (submodulo) => {
            if (submodulo.esCompleto === false) {
              modulo.esCompleto = false;
              modulo.esTodoCompleto = false;
              return;
            }
          });
        });
        respResultadoCorrectoObjeto200(res, resultModulos);
      },
      SeleccionarArchivos_ArchivosPensionesSeguros: async () => {
        const { fecha_operacion, periodicidad } = req.body;
        const id_rol = req.user.id_rol;
        const id_usuario = req.user.id_usuario;

        if (!id_usuario || !id_rol) {
          respDatosNoRecibidos400(res, "ID usuario y ID rol requeridos");
          return;
        }
        const archivosRequeridos = await EjecutarQuery(
          EjecutarFuncionSQL("aps_fun_archivos_pensiones_seguros", {
            body: {
              fecha_operacion,
              id_rol,
              id_usuario,
              periodicidad,
            },
          })
        );
        const resultArray = sortBy(archivosRequeridos, (row) =>
          toLower(row.archivo)
        );
        respResultadoCorrectoObjeto200(res, resultArray);
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

        const periodicidad = [154]; //VALOR POR DEFECTO

        if (parseInt(workingDay?.[0].case) === 0) periodicidad; // DIARIOS
        else periodicidad.push(219); // DIAS HABILES

        const archivosRequeridos = await EjecutarQuery(
          EjecutarFuncionSQL("aps_fun_archivos_bolsa", {
            body: {
              fecha_operacion,
              id_rol,
              id_usuario,
              periodicidad: periodicidad.join(","),
            },
          })
        );
        const resultArray = sortBy(archivosRequeridos, (row) =>
          toLower(row.archivo)
        );
        respResultadoCorrectoObjeto200(res, resultArray);
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
        const query = EjecutarFuncionSQL("aps_limites_seguros", {
          body,
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
            {
              key: "id_tipo_renta",
              valuesWhereIn: [136],
              whereIn: true,
            },
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
              {
                key: "id_tipo_instrumento",
                value: id_tipo_instrumento,
              },
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
                  res,
                  reproceso === true
                    ? "No existe ninguna Fecha Habilitada para reprocesar"
                    : "No existen registros iniciales"
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
            } else
              respResultadoVacio404END(
                res,
                reproceso === true
                  ? "No existe ninguna Fecha Habilitada para reprocesar"
                  : "No existen registros iniciales"
              );
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
                {
                  key: "id_carga_archivos",
                  value: id_carga_archivos,
                },
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
                  descripcion: "La información está correcta",
                  fecha_carga: item.fecha_carga,
                  fecha_operacion: item.fecha_operacion,
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
          {
            key: "cod_institucion",
            value: cod_institucion.result.codigo,
          },
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
            where: [
              {
                key: "id_tipo_entidad",
                value: id_tipo_modalidad,
              },
            ],
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
          const aux = map(instituciones, (item) => {
            return EjecutarFuncionSQL("aps_reporte_validacion_preliminar", {
              body: {
                fecha,
                cod_institucion: item.codigo,
                periodo: periodo,
              },
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
          const aux = map(instituciones, (item) => {
            return EjecutarFuncionSQL("aps_reporte_validacion_preliminar", {
              body: {
                fecha,
                cod_institucion: item.codigo,
                periodo: periodo,
              },
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
          {
            key: "reproceso",
            valuesWhereIn: reproceso,
            whereIn: true,
          },
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
                {
                  key: "id_carga_archivos",
                  value: id_carga_archivos,
                },
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
                  fecha_operacion: item.fecha_operacion,
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
            where: [
              {
                key: "id_tipo_entidad",
                value: id_tipo_modalidad,
              },
            ],
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
                {
                  key: "id_carga_archivos",
                  value: id_carga_archivos,
                },
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
                  descripcion: "La información está correcta",
                  fecha_carga: item.fecha_carga,
                  fecha_operacion: item.fecha_operacion,
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
        const cargaArchivos = (await EjecutarQuery(query))?.[0] || undefined;
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
              where: [
                {
                  key: "id_carga_archivos",
                  value: id_carga_archivos,
                },
              ],
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
        const users = await ObtenerUsuariosPorRol({
          id_rol: idRolFinal,
        });
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
            pass: "vlkrtlywrworfckj",
          },
        });

        if (size(usersFinal) > 0) {
          for await (const item of usersFinal) {
            const emailFinal = email ? email : item.email;
            // const emailFinal = "milibrolunadepluton344@gmail.com";

            if (!validateEmail(emailFinal)) {
              errorsArray.push({
                message: "Email no válido",
                emailFinal,
              });
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
            {
              key: "cod_institucion",
              value: cod_institucion.result.codigo,
            },
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
            {
              key: "cod_institucion",
              value: cod_institucion.result.codigo,
            },
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
              (await EjecutarQuery(queryInsertValida))?.[0] || undefined;
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
              (await EjecutarQuery(queryInsertValida))?.[0] || undefined;
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
              {
                key: "id_rol",
                valuesWhereIn: id_rol_cargas,
                whereIn: true,
              },
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
                {
                  key: "id_valora_archivos",
                  value: id_valora_archivos,
                },
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
                  fecha_operacion: item.fecha_operacion,
                };
              })
            );
          })
          .catch((err) => {
            throw err;
          });
      },
      Emisor_SeguroArchivo441: async () => {
        const { fecha_informacion } = req.body;
        const query = formatearQuery(
          `SELECT emisor FROM public."${nameTable}" WHERE fecha_informacion=%L AND emisor NOT IN (SELECT codigo_rmv FROM public."APS_param_emisor");`,
          [fecha_informacion]
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
      InsertarRentaFija_SeguroArchivo441: async () => {
        const { fecha, id_usuario } = req.body;
        const idUsuarioFinal = id_usuario ? id_usuario : req.user.id_usuario;
        if (Object.entries(req.body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const params = { body: { fecha, idUsuarioFinal } };
        const query = EjecutarFuncionSQL("aps_ins_renta_fija", params);
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      Emisor_SeguroArchivo442: async () => {
        const { fecha_informacion } = req.body;
        const query = formatearQuery(
          `SELECT emisor FROM public."${nameTable}" WHERE fecha_informacion=%L AND emisor NOT IN (SELECT codigo_rmv FROM public."APS_param_emisor");`,
          [fecha_informacion]
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
      InsertarOtrosActivos_SeguroArchivo442: async () => {
        const { fecha, id_usuario } = req.body;
        const idUsuarioFinal = id_usuario ? id_usuario : req.user.id_usuario;
        if (Object.entries(req.body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const params = { body: { fecha, idUsuarioFinal } };
        const query = EjecutarFuncionSQL("aps_ins_otros_activos", params);
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      Emisor_SeguroArchivo443: async () => {
        const { fecha_informacion } = req.body;
        const query = formatearQuery(
          `SELECT emisor FROM public."${nameTable}" WHERE fecha_informacion=%L AND emisor NOT IN (SELECT codigo_rmv FROM public."APS_param_emisor");`,
          [fecha_informacion]
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
      InsertarRentaVariable_SeguroArchivo443: async () => {
        const { fecha, id_usuario } = req.body;
        const idUsuarioFinal = id_usuario ? id_usuario : req.user.id_usuario;
        if (Object.entries(req.body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const params = { body: { fecha, idUsuarioFinal } };
        const query = EjecutarFuncionSQL("aps_ins_renta_variable", params);
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      InsertarRentaFijaCupon_SeguroArchivo444: async () => {
        const { fecha, id_usuario } = req.body;
        const idUsuarioFinal = id_usuario ? id_usuario : req.user.id_usuario;
        if (Object.entries(req.body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const params = { body: { fecha, idUsuarioFinal } };
        const query = EjecutarFuncionSQL("aps_ins_renta_fija_cupon", params);
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      InsertarOtrosActivosCupon_SeguroArchivo445: async () => {
        const { fecha, id_usuario } = req.body;
        const idUsuarioFinal = id_usuario ? id_usuario : req.user.id_usuario;
        if (Object.entries(req.body).length === 0) {
          respDatosNoRecibidos400(res);
          return;
        }
        const params = { body: { fecha, idUsuarioFinal } };
        const query = EjecutarFuncionSQL("aps_ins_otros_activos_cupon", params);
        await pool
          .query(query)
          .then((result) => {
            respResultadoCorrectoObjeto200(res, result.rows);
          })
          .catch((err) => {
            throw err;
          });
      },
      DescargarArchivosPorFecha_DescargarArchivos: async () => {
        const { fecha } = req.body;
        const date = fecha.split("-").join("");
        const nameExportZip = `./downloads/files_${date}.zip`;
        const fileZipPromise = new Promise(async (resolve, reject) => {
          try {
            const filesFinalArray = [];
            const files = fs.readdirSync("./uploads/tmp");
            forEach(files, (item) => {
              if (item.includes(date)) filesFinalArray.push(item);
            });
            if (filesFinalArray.length <= 0) resolve(filesFinalArray);
            else {
              const output = fs.createWriteStream(nameExportZip);
              const archive = archiver("zip", {
                zlib: { level: 9 }, // Sets the compression level.
              });
              archive.on("error", (err) => {
                throw err;
              });
              forEach(files, (item) => {
                if (item.includes(date))
                  archive.file(`./uploads/tmp/${item}`, {
                    name: `${item}`,
                  });
              });
              archive.pipe(output);
              await archive.finalize();
              output.on("close", () => {
                resolve(filesFinalArray);
              });
            }
          } catch (err) {
            reject(err);
          }
        });

        fileZipPromise
          .then((result) => {
            if (result.length >= 1)
              respDescargarArchivos200(res, nameExportZip, result);
            else
              respResultadoVacioObject200(
                res,
                result,
                "No existen archivos para la fecha seleccionada"
              );
          })
          .catch((err) => {
            throw err;
          });
      },
      DescargarArchivos_DescargarArchivos: async () => {
        const { archivos } = req.body;
        if (size(archivos) <= 0) {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            archivos,
            "No existen archivos para descargar"
          );
          return;
        }
        const filter = split(archivos?.[0], ".")[0];
        const nameExportZip = `./downloads/archivos_${filter}.zip`;
        const fileZipPromise = new Promise(async (resolve, reject) => {
          try {
            if (archivos.length <= 0) resolve(archivos);
            else {
              const output = fs.createWriteStream(nameExportZip);
              const archive = archiver("zip", {
                zlib: { level: 9 }, // Sets the compression level.
              });
              archive.on("error", (err) => {
                reject(err);
              });
              forEach(archivos, (item) => {
                archive.file(`./uploads/tmp/${item}`, {
                  name: `${item}`,
                });
              });
              archive.pipe(output);
              await archive.finalize();
              output.on("close", () => {
                resolve(archivos);
              });
            }
          } catch (err) {
            reject(err);
          }
        });

        fileZipPromise
          .then((result) => {
            if (result.length >= 1)
              respDescargarArchivos200(res, nameExportZip, result);
            else
              respResultadoVacioObject200(
                res,
                result,
                "No existen archivos para esa fecha."
              );
          })
          .catch((err) => {
            throw err;
          });
      },
      ListarArchivos_DescargarArchivos: async () => {
        const { modalidades, tipo_archivos = "seguros" } = req.body;
        const codigos = [];
        const nameTableTipoArchivos =
          tipo_archivos === "pensiones"
            ? "APS_pensiones_archivo_"
            : "APS_seguro_archivo_";
        const queryArchivos = EscogerInternoUtil("INFORMATION_SCHEMA.TABLES", {
          select: ["*"],
          where: [
            { key: "table_schema", value: "public" },
            { key: "table_type", value: "BASE TABLE" },
            {
              key: "table_name",
              value: nameTableTipoArchivos,
              like: true,
            },
          ],
        });
        const codigosArchivosAux = await EjecutarQuery(queryArchivos);
        const codigosArchivos = map(codigosArchivosAux, (item) =>
          replace(item.table_name, nameTableTipoArchivos, "")
        );
        forEach(modalidades, (item) =>
          filter(item.modalidades, (modalidad) => {
            if (modalidad.esCompleto === true)
              codigos.push({
                fecha: join(split(item.fecha.replace(/\s/g, ""), "-"), ""),
                codigo: modalidad.codigo,
              });
          })
        );
        const files = fs.readdirSync("./uploads/tmp");
        const resultFinal = [];
        forEach(codigos, (item) => {
          const aux = filter(files, (file) => {
            const splitFecha = split(item.fecha, "-").join("");
            const fileSplitFecha = file
              .toUpperCase()
              .substring(0, file.indexOf(splitFecha));
            const auxResultFind = find(codigosArchivos.result, (codArchivo) => {
              if (fileSplitFecha.indexOf("CC") === -1)
                if (tipo_archivos === "pensiones") {
                  const codInstitucionAux = fileSplitFecha.substring(
                    0,
                    fileSplitFecha.indexOf(codArchivo)
                  );
                  return (
                    split(file, codArchivo)[0] === codInstitucionAux &&
                    item.codigo === codInstitucionAux
                  );
                } else if (tipo_archivos === "seguros") {
                  return split(file, item.fecha)[0] === item.codigo;
                } else return includes(file, codArchivo);

              return false;
            });
            return isUndefined(auxResultFind) ? false : true;
          });
          resultFinal.push(...aux);
        });
        respResultadoCorrectoObjeto200(res, resultFinal);
      },
      Modalidades_DescargarArchivos: async () => {
        const { fecha, id_tipo_modalidad } = req.body;
        const { id_rol } = req.user;
        const querys = [
          EscogerInternoUtil(
            id_rol === 10
              ? "aps_view_modalidad_seguros"
              : "aps_view_modalidad_pensiones",
            {
              select: ["*"],
              where: [
                {
                  key: "id_tipo_entidad",
                  value: id_tipo_modalidad,
                },
              ],
            }
          ),
        ];
        const results = await EjecutarVariosQuerys(querys);
        if (results.ok === null) throw results.result;
        if (results.ok === false) throw results.errors;
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
      CargarArchivo_Upload: async () => CargarArchivo_Upload(req, res, action),
      ListarSubcuentas_PlanCuentas: async () => {
        const cuentas = await EjecutarQuery(
          isUndefined(await CampoActivoAux(nameTable))
            ? ListarUtil(nameTable, { activo: null })
            : ListarUtil(nameTable)
        );
        const estructuraJerarquica = crearJerarquiaCuentas(cuentas);
        respResultadoCorrectoObjeto200(res, estructuraJerarquica);
      },
      EscogerSubcuentas_PlanCuentas: async () => {
        const {
          query: { limit, offset },
        } = req;
        const body = req.body;
        const cuentaPadre = !isUndefined(body?.cuenta_padre)
          ? body.cuenta_padre
          : "1";
        delete body?.login;
        delete body?.key;
        delete body?.cuenta_padre;
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
        if (!isUndefined(limit)) params.limit = limit;
        if (!isUndefined(offset)) params.offset = offset;
        const cuentas = await EjecutarQuery(EscogerUtil(nameTable, params));
        const estructuraJerarquica = crearJerarquiaCuentas(cuentas);
        respResultadoCorrectoObjeto200(res, estructuraJerarquica);
      },
    };

    await OPERATION?.[methodName]();
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

function crearJerarquiaCuentas(cuentas, cuentaPadre = null, nivel = 1) {
  const cuentasNivel = filter(cuentas, (cuenta) => {
    if (isEmpty(cuenta.cuenta_padre)) return cuenta.id_nivel === nivel;
    return cuenta.cuenta_padre === cuentaPadre && cuenta.id_nivel === nivel;
  });
  if (size(cuentasNivel) === 0) return [];
  const jerarquia = {};
  for (const cuenta of cuentasNivel) {
    const subcuentas = crearJerarquiaCuentas(cuentas, cuenta.cuenta, nivel + 1);
    if (subcuentas) cuenta.subcuentas = subcuentas;
    jerarquia[cuenta.cuenta] = cuenta;
  }
  return map(jerarquia, (cuenta) => cuenta);
}

async function CargarArchivo_Upload(req, res, action, id = undefined) {
  try {
    const fechaInicialOperacion = req?.body?.fecha_operacion;
    const id_rol = req.user.id_rol;
    const id_usuario = req.user.id_usuario;
    const paramsQueryAux = {
      select: ["codigo, sigla, id_rol, id_usuario"],
      where: [
        { key: "id_usuario", value: id_usuario },
        { key: "id_rol", value: id_rol },
      ],
    };
    const codigosSeguros = await EjecutarQuery(
      EscogerInternoUtil("aps_view_modalidad_seguros", paramsQueryAux)
    );
    const codigosPensiones = await EjecutarQuery(
      EscogerInternoUtil("aps_view_modalidad_pensiones", paramsQueryAux)
    );
    const filesReaded = req.filesReaded;
    const previousResults = req.results;
    const previousErrors = req.errors;
    const returnsValues = req.returnsValues;
    const idCargaArchivos = returnsValues[0].id_carga_archivos;
    let cargaBolsaActual = null;
    const resultFinal = [];
    const tablesFilesArray = [];
    const sequencesTablesFilesArray = [];
    const idTablesFilesArray = [];
    const errorsFieldsArray = [];
    let bodyFinalQuery = [];
    const filesSort = sortBy(req.files, (file) =>
      file.originalname.toLowerCase()
    ); // ORDENANDO LOS ARCHIVOS PARA ITERAR CON LA VARIABLE filesReaded

    // const filesSort = req.files;
    // console.log("filesReaded", filesReaded);
    // console.log("filesUploadedBD", filesUploadedBD);
    // console.log("previousResults", previousResults);
    // console.log("previousErrors", previousErrors);
    // console.log("returnsValues", returnsValues);
    const INFO_TABLES = {
      code: null,
      cod_institution: null,
      table: null,
      tableErrors: null,
    };

    forEach(filesSort, (item) => {
      const fileName = item.originalname.toUpperCase();
      const codSeguros = fileName.substring(0, 3);
      const codPensiones = fileName.substring(0, 2);
      const codPensionesSeguros =
        size(codigosSeguros) > 0
          ? codSeguros
          : size(codigosPensiones) > 0
          ? codPensiones
          : null;
      if (codPensionesSeguros === null) return result;
      const findSeguros = find(
        codigosSeguros,
        (itemF) => codSeguros === itemF.codigo
      );
      const findPensiones = find(
        codigosPensiones,
        (itemF) => codPensiones === itemF.codigo
      );
      if (
        (!isUndefined(findSeguros) || !isUndefined(findPensiones)) &&
        (!fileName.includes(".CC") ||
          !item.originalname[2] + item.originalname[3] === "CC")
      ) {
        INFO_TABLES.code = codPensionesSeguros;
        INFO_TABLES.cod_institution = codPensionesSeguros;
        INFO_TABLES.table = "APS_aud_carga_archivos_pensiones_seguros";
        INFO_TABLES.tableErrors =
          "APS_aud_errores_carga_archivos_pensiones_seguros";
      } else if (
        fileName.substring(0, 1) === "M" &&
        (fileName.includes("K.") ||
          fileName.includes("L.") ||
          fileName.includes("N.") ||
          fileName.includes("P."))
      ) {
        INFO_TABLES.code = "M";
        INFO_TABLES.cod_institution = "bolsa";
        INFO_TABLES.table = "APS_aud_carga_archivos_bolsa";
        INFO_TABLES.tableErrors = "APS_aud_errores_carga_archivos_bolsa";
      } else if (fileName.includes(".CC")) {
        const stringAux = item.originalname.toUpperCase();
        const fechaAux = split(fechaInicialOperacion, "-").join("");
        const codInstitucionPuntoCC = (string, split) => {
          const splitString = string.split(split);
          return splitString[0];
        };
        INFO_TABLES.code = "CC";
        INFO_TABLES.cod_institution = codInstitucionPuntoCC(
          stringAux,
          fechaAux
        );
        INFO_TABLES.table = "APS_aud_carga_archivos_custodio";
        INFO_TABLES.tableErrors = "APS_aud_errores_carga_archivos_custodio";
      } else if (fileName.includes("CC")) {
        const fechaAux = split(fechaInicialOperacion, "-").join("");
        const fileSplitFecha = item.originalname
          .toUpperCase()
          .substring(0, item.originalname.toUpperCase().indexOf(fechaAux));
        const codInstitucionCC = (stringAux) => {
          const splitString = stringAux.split("CC");
          return splitString[1] === "" ? splitString[0] : splitString[1];
        };
        INFO_TABLES.code = "CC";
        INFO_TABLES.cod_institution = codInstitucionCC(fileSplitFecha);
        INFO_TABLES.table = "APS_aud_carga_archivos_custodio";
        INFO_TABLES.tableErrors = "APS_aud_errores_carga_archivos_custodio";
      }
    });

    if (!isUndefined(action)) {
      const permiso = await VerificarPermisoTablaUsuarioAuditoria({
        table: INFO_TABLES.table,
        id,
        action,
        req,
        res,
      });
      if (permiso.ok === false) {
        respUsuarioNoAutorizado200END(res, null, action, INFO_TABLES.table);
        return;
      }
    }

    if (INFO_TABLES.cod_institution === "bolsa") {
      const queryBolsaAux = EscogerInternoUtil(nameTable, {
        select: ["*"],
        where: [{ key: "id_carga_archivos", value: idCargaArchivos }],
      });
      cargaBolsaActual = await EjecutarQuery(queryBolsaAux)?.[0];
      if (isUndefined(cargaBolsaActual))
        throw new Error(`No existe el registro con el id ${idCargaArchivos}`);
    }

    const uploadPromise = new Promise(async (resolve, reject) => {
      let errors = [];
      for (let index = 0; index < filesSort.length; index++) {
        try {
          const item = filesSort[index];
          const fileName = item.originalname;
          const arrayDataObject = [];
          //#region SEPARAR LOS CAMPOS DEL ARCHIVO QUE ESTA DIVIDO EN FILAS
          // SE ORDENAN PRIMERO LOS ARCHIVOS ANTES DE ITERAR CON FILES READED
          forEach(filesReaded[index], (item2) => {
            for (let i = 0; i < item2.length; i++) {
              if (item2.charCodeAt(i) === 65279)
                item2 = item2.replace(item2.slice(i, 1), "");
            }
            const rowWithoutQuotationMarks = item2.slice(1, item2.length - 1);
            const rowSplit = rowWithoutQuotationMarks.split('","');
            let resultObject = [];
            forEach(rowSplit, (item3) => {
              resultObject = [...resultObject, `"${item3}"`];
            });
            if (item2 !== "") {
              arrayDataObject.push(resultObject);
            }
          });
          //#endregion

          const OPTIONS_FILE = {
            headers: null,
            detailsHeaders: null,
            codeFile: null,
            tableFile: null,
            sequenceTableFile: null,
            idTable: null,
            dateField: null,
            institutionField: null,
            typeInstrumentField: null,
            serieField: null,
          };

          //#region SELECCION DE CODIGO Y TABLA DE ARCHIVO
          if (fileName.includes("K.")) {
            OPTIONS_FILE.codeFile = "K";
            OPTIONS_FILE.tableFile = "APS_oper_archivo_k";
          } else if (fileName.includes("L.")) {
            OPTIONS_FILE.codeFile = "L";
            OPTIONS_FILE.tableFile = "APS_oper_archivo_l";
          } else if (fileName.includes("N.")) {
            OPTIONS_FILE.codeFile = "N";
            OPTIONS_FILE.tableFile = "APS_oper_archivo_n";
          } else if (fileName.includes("P.")) {
            OPTIONS_FILE.codeFile = "P";
            OPTIONS_FILE.tableFile = "APS_oper_archivo_p";
          } else if (fileName.includes(".411")) {
            OPTIONS_FILE.codeFile = "411";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_411";
          } else if (fileName.includes(".412")) {
            OPTIONS_FILE.codeFile = "412";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_412";
          } else if (fileName.includes(".413")) {
            OPTIONS_FILE.codeFile = "413";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_413";
          } else if (fileName.includes(".441")) {
            OPTIONS_FILE.codeFile = "441";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_441";
          } else if (fileName.includes(".442")) {
            OPTIONS_FILE.codeFile = "442";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_442";
          } else if (fileName.includes(".443")) {
            OPTIONS_FILE.codeFile = "443";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_443";
          } else if (fileName.includes(".444")) {
            OPTIONS_FILE.codeFile = "444";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_444";
          } else if (fileName.includes(".445")) {
            OPTIONS_FILE.codeFile = "445";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_445";
          } else if (fileName.includes(".451")) {
            OPTIONS_FILE.codeFile = "451";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_451";
          } else if (fileName.includes(".481")) {
            OPTIONS_FILE.codeFile = "481";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_481";
          } else if (fileName.includes(".482")) {
            OPTIONS_FILE.codeFile = "482";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_482";
          } else if (fileName.includes(".483")) {
            OPTIONS_FILE.codeFile = "483";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_483";
          } else if (fileName.includes(".484")) {
            OPTIONS_FILE.codeFile = "484";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_484";
          } else if (fileName.includes(".485")) {
            OPTIONS_FILE.codeFile = "485";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_485";
          } else if (fileName.includes(".486")) {
            OPTIONS_FILE.codeFile = "486";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_486";
          } else if (fileName.includes(".461")) {
            OPTIONS_FILE.codeFile = "461";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_461";
          } else if (fileName.includes(".471")) {
            OPTIONS_FILE.codeFile = "471";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_471";
          } else if (fileName.includes(".491")) {
            OPTIONS_FILE.codeFile = "491";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_491";
          } else if (fileName.includes(".492")) {
            OPTIONS_FILE.codeFile = "492";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_492";
          } else if (fileName.includes(".494")) {
            OPTIONS_FILE.codeFile = "494";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_494";
          } else if (fileName.includes(".496")) {
            OPTIONS_FILE.codeFile = "496";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_496";
          } else if (fileName.includes(".497")) {
            OPTIONS_FILE.codeFile = "497";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_497";
          } else if (fileName.includes(".498")) {
            OPTIONS_FILE.codeFile = "498";
            OPTIONS_FILE.tableFile = "APS_seguro_archivo_498";
          } else if (fileName.includes("DM")) {
            OPTIONS_FILE.codeFile = "DM";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_DM";
          } else if (fileName.includes("DR")) {
            OPTIONS_FILE.codeFile = "DR";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_DR";
          } else if (fileName.includes("UA")) {
            OPTIONS_FILE.codeFile = "UA";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_UA";
          } else if (fileName.includes("UE")) {
            OPTIONS_FILE.codeFile = "UE";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_UE";
          } else if (fileName.includes("TD")) {
            OPTIONS_FILE.codeFile = "TD";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_TD";
          } else if (fileName.includes("DU")) {
            OPTIONS_FILE.codeFile = "DU";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_DU";
          } else if (fileName.includes("UD")) {
            OPTIONS_FILE.codeFile = "UD";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_UD";
          } else if (fileName.includes("TO")) {
            OPTIONS_FILE.codeFile = "TO";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_TO";
          } else if (fileName.includes("CO")) {
            OPTIONS_FILE.codeFile = "CO";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_CO";
          } else if (fileName.includes("TV")) {
            OPTIONS_FILE.codeFile = "TV";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_TV";
          } else if (fileName.includes("DC")) {
            OPTIONS_FILE.codeFile = "DC";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_DC";
          } else if (fileName.includes("DO")) {
            OPTIONS_FILE.codeFile = "DO";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_DO";
          } else if (fileName.includes("BG")) {
            OPTIONS_FILE.codeFile = "BG";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_BG";
          } else if (fileName.includes("FE")) {
            OPTIONS_FILE.codeFile = "FE";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_FE";
          } else if (fileName.includes("VC")) {
            OPTIONS_FILE.codeFile = "VC";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_VC";
          } else if (fileName.includes("CD")) {
            OPTIONS_FILE.codeFile = "CD";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_CD";
          } else if (fileName.includes("DE")) {
            OPTIONS_FILE.codeFile = "DE";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_DE";
          } else if (fileName.includes("LQ")) {
            OPTIONS_FILE.codeFile = "LQ";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_LQ";
          } else if (fileName.includes("TR")) {
            OPTIONS_FILE.codeFile = "TR";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_TR";
          } else if (fileName.includes("CC") && INFO_TABLES.code === "CC") {
            OPTIONS_FILE.codeFile = "CC";
            OPTIONS_FILE.tableFile = "APS_oper_archivo_Custodio";
          } else if (fileName.includes("FC")) {
            OPTIONS_FILE.codeFile = "FC";
            OPTIONS_FILE.tableFile = "APS_pensiones_archivo_FC";
          }
          //#endregion

          //#region CONFIGURANDO LA INFORMACION DE OPTIONS_FILE
          const columnsHeaders = await formatoArchivo(OPTIONS_FILE.codeFile);
          OPTIONS_FILE.detailsHeaders = await columnsHeaders.detailsHeaders;
          OPTIONS_FILE.headers = await columnsHeaders.headers;
          OPTIONS_FILE.idTable = OPTIONS_FILE.headers[0];
          OPTIONS_FILE.sequenceTableFile = {
            table: OPTIONS_FILE.tableFile,
            id: OPTIONS_FILE.idTable,
          };
          const codInstitucionAux = INFO_TABLES.cod_institution;
          OPTIONS_FILE.headers?.splice(0, 1); // ELIMINAR ID DE TABLA
          tablesFilesArray.push(OPTIONS_FILE.tableFile);
          sequencesTablesFilesArray.push({
            table: OPTIONS_FILE.tableFile,
            id: OPTIONS_FILE.idTable,
          });
          idTablesFilesArray.push(OPTIONS_FILE.idTable);
          //#endregion

          //#region ESTA ES UNA VALIDACION PARA VERIFICAR LA UNICIDAD SEGUN EL TIPO DE ARCHIVO, SE VERIFICA SI LA INFORMACION QUE SE ESTA REGISTRANDO YA EXISTE, SI ES ASI ENTONCES LOS REGISTROS ANTERIORES SE ELIMINAN

          const valuesWhereInAux = [
            `fecha_operacion`,
            `fecha`,
            `fecha_informacion`,
            `cod_institucion`,
          ];

          if (INFO_TABLES.cod_institution === "CC") {
            valuesWhereInAux.push(`tipo_instrumento`);
            valuesWhereInAux.push(`serie`);
          }

          const queryInfoSchema = EscogerInternoUtil(
            "INFORMATION_SCHEMA.COLUMNS",
            {
              select: ["*"],
              where: [
                {
                  key: "COLUMN_NAME",
                  valuesWhereIn: valuesWhereInAux,
                  whereIn: true,
                },
                {
                  key: "TABLE_NAME",
                  value: OPTIONS_FILE.tableFile,
                },
              ],
              orderby: { field: "COLUMN_NAME" },
            }
          );

          const infoColumnas = await EjecutarQuery(queryInfoSchema);
          if (size(infoColumnas) > 0) {
            forEach(infoColumnas, (infoColumna) => {
              const columnName = infoColumna.column_name;
              if (columnName === "cod_institucion")
                OPTIONS_FILE.institutionField = columnName;
              if (
                columnName === "tipo_instrumento" &&
                INFO_TABLES.cod_institution === "CC"
              )
                OPTIONS_FILE.typeInstrumentField = columnName;
              if (
                columnName === "serie" &&
                INFO_TABLES.cod_institution === "CC"
              )
                OPTIONS_FILE.serieField = columnName;
              if (columnName.includes("fecha"))
                OPTIONS_FILE.dateField = columnName;
            });
          }

          if (
            OPTIONS_FILE.codeFile === "K" ||
            OPTIONS_FILE.codeFile === "L" ||
            OPTIONS_FILE.codeFile === "N" ||
            OPTIONS_FILE.codeFile === "P"
          ) {
            if (!OPTIONS_FILE.dateField) {
              errorsFieldsArray.push({
                message: `No existe el campo fecha para poder validar unicidad en la tabla ${OPTIONS_FILE.tableFile}.`,
              });
            } else {
              const whereDelete = [
                {
                  key: OPTIONS_FILE.dateField,
                  value: fechaInicialOperacion,
                },
              ];
              await eliminarInformacionDuplicada(
                tableFile,
                whereDelete,
                sequenceTableFile,
                idTable
              );
            }
          } else if (INFO_TABLES.cod_institution === "CC") {
            if (
              !OPTIONS_FILE.dateField ||
              !OPTIONS_FILE.institutionField ||
              !OPTIONS_FILE.typeInstrumentField ||
              !OPTIONS_FILE.serieField
            ) {
              errorsFieldsArray.push({
                message: `No existe el campo cod_institucion, fecha, tipo_instrumento y serie para poder validar unicidad en la tabla ${OPTIONS_FILE.tableFile}.`,
              });
            } else {
              const typeInstrumentsValuesAux = [];
              const seriesValuesAux = [];
              forEach(arrayDataObject, (itemAux) => {
                forEach(itemAux, (itemAux2, indexAux2) => {
                  if (indexAux2 === 0) typeInstrumentsValuesAux.push(itemAux2);
                  else if (indexAux2 === 1) seriesValuesAux.push(itemAux2);
                });
              });
              const seriesUniqs = map(uniq(seriesValuesAux), (itemAux) =>
                replace(itemAux, /\"/g, `'`)
              );
              const typeInstrumentsUniqs = map(
                uniq(typeInstrumentsValuesAux),
                (itemAux) => replace(itemAux, /\"/g, `'`)
              );
              const whereDelete = [
                {
                  key: OPTIONS_FILE.dateField,
                  value: fechaInicialOperacion,
                },
                {
                  key: OPTIONS_FILE.institutionField,
                  value: INFO_TABLES.cod_institution,
                },
                size(seriesUniqs) > 0 && {
                  key: serieField,
                  valuesWhereIn: seriesUniqs,
                  whereIn: true,
                },
                size(seriesUniqs) > 0 && {
                  key: typeInstrumentField,
                  valuesWhereIn: typeInstrumentsUniqs,
                  whereIn: true,
                },
              ];
              await eliminarInformacionDuplicada(
                OPTIONS_FILE.tableFile,
                whereDelete,
                OPTIONS_FILE.sequenceTableFile,
                OPTIONS_FILE.idTable
              );
            }
          } else {
            if (!OPTIONS_FILE.dateField || !OPTIONS_FILE.institutionField) {
              errorsFieldsArray.push({
                message: `No existe el campo cod_institucion y fecha para poder validar unicidad en la tabla ${OPTIONS_FILE.tableFile}.`,
              });
            } else {
              const whereDelete = [
                {
                  key: OPTIONS_FILE.dateField,
                  value: fechaInicialOperacion,
                },
                {
                  key: OPTIONS_FILE.institutionField,
                  value: codInstitucionAux,
                },
              ];
              await eliminarInformacionDuplicada(
                OPTIONS_FILE.tableFile,
                whereDelete,
                OPTIONS_FILE.sequenceTableFile,
                OPTIONS_FILE.idTable
              );
            }
          }

          if (size(errorsFieldsArray) > 0)
            if (index === size(filesSort) - 1) resolve({ errorsFieldsArray });
          //#endregion

          //#region INSERTAR EL ID DE CARGA ARCHIVOS, COD_INSTITUCION, FECHA_INFORMACION A CADA FILA SEPARADA
          const newArrayDataObject = [];

          let stringFinalFile = "";
          let arrayHeadersAux = [];
          if (OPTIONS_FILE.headers.includes("id_carga_archivos")) {
            stringFinalFile += `"${idCargaArchivos}"`;
            arrayHeadersAux.push("id_carga_archivos");
          }
          if (OPTIONS_FILE.headers.includes("cod_institucion")) {
            stringFinalFile += `,"${codInstitucionAux}"`;
            arrayHeadersAux.push("cod_institucion");
          }
          if (OPTIONS_FILE.headers.includes("fecha_informacion")) {
            stringFinalFile += `,"${fechaInicialOperacion}"`;
            arrayHeadersAux.push("fecha_informacion");
          }
          //#endregion

          //#region ELIMINANDO LOS CAMPOS DE ID_CARGA_ARCHIVOS, COD_INSTITUCION Y FECHA INFORMACION PARA VOLVER A PONERLOS PERO AL FINAL DEL ARRAY HEADERS
          stringFinalFile += `\r\n`;
          forEach(arrayHeadersAux, (item2) => {
            const myIndex = OPTIONS_FILE.headers.indexOf(item2);
            if (myIndex !== -1) OPTIONS_FILE.headers.splice(myIndex, 1);
          });
          forEach(arrayHeadersAux, (item2) => {
            OPTIONS_FILE.headers.push(item2);
          });
          //#endregion

          //#region CREANDO UN NUEVO ARRAY DATA OBJECT QUE CONTIENE LO MISMO QUE EL ARRAY DATA OBJECT ORIGINAL, PERO ACA SE ESTA AGREGANDO LOS CAMPOS DE ID_CARGA_ARCHIVOS, COD_INSTITUCION Y FECHA INFORMACION (SI ES QUE EXISTEN EN "stringFinalFile")
          forEach(arrayDataObject, (item2) => {
            newArrayDataObject.push([...item2, ...stringFinalFile.split(",")]);
          });
          //#endregion

          //#region INSERTANDO LA INFORMACION FORMATEADA A LA RUTA DE UPLOADS/TMP/ARCHIVO JUNTO CON EL ID DE CARGA DE ARCHIVOS
          //TO DO: crear una carpeta para cada tipo de archivo
          const dataFile = newArrayDataObject.join("");
          const filePathWrite = `./uploads/tmp/${fileName}`;
          fs.writeFileSync(filePathWrite, dataFile);
          //#endregion

          //#region Formateando informacion de archivo para insertar por medio de un INSERT QUERY, ES DECIR ACA SE ESTA FORMATEANDO LA INFORMACION PARA QUE YA NO ESTE EN FORMATO DE SOLAMENTE STRING, ACA SE ESTA TRANSFORMANDO LA INFORMACION A [PROPIEDAD]: [VALOR], LO CUAL PERMITIRA TENER MEJOR ORGANIZADO LA INFORMACION PARA REALIZAR EL INSERT QUERY
          let finalData = [];
          let partialData = [];
          forEach(newArrayDataObject, (itemV1) => {
            let dataObject = Object.assign({}, itemV1);
            partialData.push(dataObject);
          });
          let partialHeaders = OPTIONS_FILE.headers;
          forEach(partialData, (itemV1) => {
            let x = {};
            forEach(itemV1, (itemV2, indexV2) => {
              let valueAux = itemV2;
              x = {
                ...x,
                [partialHeaders[indexV2]]: valueAux
                  ?.trim()
                  .replace(/['"]+/g, ""),
              };
            });
            finalData.push(x);
          });
          forEach([finalData], (itemBPQ) => {
            bodyFinalQuery = bodyFinalQuery.concat(itemBPQ);
          });
          //#endregion

          //#region CREANDO Y EJECUTANDO LOS QUERYS PARA INSERTAR LA INFORMACION A CADA TABLA SEGUN EL TIPO DE ARCHIVO
          let queryFiles = "";

          if (bodyFinalQuery.length >= 1) {
            const codeFileAux = OPTIONS_FILE.codeFile.toLowerCase();
            queryFiles = InsertarVariosUtil(OPTIONS_FILE.tableFile, {
              body: bodyFinalQuery,
              returnValue: [
                `id_archivo_${codeFileAux === "cc" ? "custodio" : codeFileAux}`,
              ],
            });
          }

          bodyFinalQuery = [];

          await pool
            .query(queryFiles)
            .then((resultFile) => {
              resultFinal.push({
                message: `El archivo fue insertado correctamente a la tabla '${OPTIONS_FILE.tableFile}'`,
                result: {
                  rowsUpdate: resultFile.rows,
                  rowCount: resultFile.rowCount,
                },
              });
            })
            .catch((err) => {
              errors.push({
                type: "QUERY SQL ERROR",
                message: `Hubo un error al insertar datos en la tabla ${OPTIONS_FILE.tableFile} ERROR: ${err.message}`,
                err,
              });
              // reject({ resultFinal, errors });
            })
            .finally(() => {
              if (index === req.files.length - 1) {
                resolve({ resultFinal, errors });
              }
            });
          //#endregion
        } catch (err) {
          reject(err);
        }
      }
    });

    const actualizarCampoCargado = async (
      resp,
      state,
      codInst,
      reprocesado = false
    ) => {
      const bodyAux = { cargado: state };
      if (
        codInst === "bolsa" &&
        cargaBolsaActual.result.cargado === false &&
        cargaBolsaActual.result.reproceso === true &&
        (req.body?.reproceso === true || req.body?.reproceso === "true")
      )
        bodyAux.reprocesado = reprocesado;
      const queryUpdateForError = ActualizarUtil(INFO_TABLES.table, {
        body: bodyAux,
        idKey: "id_carga_archivos",
        idValue: idCargaArchivos,
      });
      await EjecutarQuery(queryUpdateForError);
      if (
        codInst === "bolsa" &&
        (req.body?.reproceso === true || req.body?.reproceso === "true")
      ) {
        const queryUltimaCarga = EscogerInternoUtil(INFO_TABLES.table, {
          select: ["*"],
          where: [
            { key: "id_rol", value: req.user.id_rol },
            { key: "reproceso", value: true },
            { key: "reprocesado", value: false },
          ],
        });
        const ultimaCargaAux = await EjecutarQuery(queryUltimaCarga);
        const value = minBy(ultimaCargaAux, "fecha_operacion");
        if (isUndefined(value)) throw new Error("No existe una fecha válida");
        let dayOfMonth = value.fecha_operacion?.getDate();
        dayOfMonth--;
        value.fecha_operacion.setDate(dayOfMonth);
        const ultimaCarga = value;
        if (
          fechaInicialOperacion !==
          dayjs(ultimaCarga.fecha_operacion).format("YYYY-MM-DD")
        ) {
          const queryUpdateCargaReprocesado = ActualizarUtil(
            INFO_TABLES.table,
            {
              body: { reprocesado: true },
              idKey: "id_carga_archivos",
              idValue: ultimaCarga.id_carga_archivos,
            }
          );
          await EjecutarQuery(queryUpdateCargaReprocesado);
        }
      }
      resp;
    };

    const funcionesInversiones = async (fechaI, id_rolI) => {
      const params = { body: { fechaI, id_rolI } };
      const querys = [
        EjecutarFuncionSQL("aps_ins_renta_fija_td", params),
        EjecutarFuncionSQL("aps_ins_renta_fija_cupon_ud", params),
        EjecutarFuncionSQL("aps_ins_otros_activos_to", params),
        EjecutarFuncionSQL("aps_ins_otros_activos_cupon_co", params),
        EjecutarFuncionSQL("aps_ins_renta_variable_tv", params),
      ];
      const results = await EjecutarVariosQuerys(querys);
      if (results.ok === null) return { ok: null, result: results.result };
      if (results.ok === false) return { ok: false, result: results.errors };
      return { ok: true, result: results.result };
    };

    const funcionesSeguros = async (fechaS, id_usuarioS, codInst) => {
      const params = { body: { fechaS, id_usuarioS, codInst } };
      const querys = [
        EjecutarFuncionSQL("aps_ins_renta_fija", params),
        EjecutarFuncionSQL("aps_ins_otros_activos", params),
        EjecutarFuncionSQL("aps_ins_otros_activos_cupon", params),
        EjecutarFuncionSQL("aps_ins_renta_fija_cupon", params),
        EjecutarFuncionSQL("aps_ins_renta_variable", params),
      ];
      const results = await EjecutarVariosQuerys(querys);
      if (results.ok === null) return { ok: null, result: results.result };
      if (results.ok === false) return { ok: false, result: results.errors };
      return { ok: true, result: results.result };
    };

    const eliminarInformacionDuplicada = async (
      table,
      where,
      sequence,
      idTable
    ) => {
      const resultFinal = [];
      const queryDelete = EliminarMultiplesTablasUtil([table], { where });
      await EjecutarQuery(queryDelete);
      resultFinal.push({
        query: "Eliminando registros duplicados",
        table,
        ok: true,
      });

      const queryMax = ValorMaximoDeCampoUtil(table, {
        fieldMax: idTable,
      });
      const maxIdTablesAux = await EjecutarQuery(queryMax);
      const maxIdTables =
        maxIdTablesAux?.[0]?.max === null ? 0 : maxIdTablesAux?.[0]?.max;
      resultFinal.push({
        query: "Seleccionando Maximo de tabla",
        table,
        idTable,
        ok: true,
      });
      const idRestartValue = parseInt(maxIdTables) + 1;
      const querySequence = AlterarSequenciaUtil(sequence, {
        restartValue: idRestartValue,
      });

      await EjecutarQuery(querySequence);
      resultFinal.push({
        query: "Alterando secuencia",
        table,
        idRestartValue,
        ok: true,
      });

      return resultFinal;
    };

    const eliminarArchivosCargados = async (tables, sequences, idTables) => {
      const resultFinal = [];
      const idsSequencesArray = [];

      const queryDelete = EliminarMultiplesTablasUtil(tables, {
        where: [{ key: "id_carga_archivos", value: idCargaArchivos }],
      });
      resultFinal.push({
        query: "Eliminando cargas con error",
        tables,
        ok: true,
      });
      await EjecutarQuery(queryDelete);

      for (let index = 0; index < tables.length; index++) {
        const item = tables[index];
        const id = idTables[index];
        const queryMax = ValorMaximoDeCampoUtil(item, {
          fieldMax: id,
        });
        const maxIdTablesAux = await EjecutarQuery(queryMax);
        const maxIdTables =
          maxIdTablesAux?.[0]?.max === null ? 0 : maxIdTablesAux?.[0]?.max;
        resultFinal.push({
          query: "Seleccionando Maximos de cada tabla",
          item,
          id,
          ok: true,
        });
        const idReturn = parseInt(maxIdTables) + 1;
        idsSequencesArray.push(idReturn);
      }

      const querySequence = AlterarSequenciaMultiplesTablasUtil(sequences, {
        restartValue: idsSequencesArray,
      });

      await EjecutarQuery(querySequence);
      resultFinal.push({
        query: "Alterando secuencias",
        tables,
        idsSequencesArray,
        ok: true,
      });

      return resultFinal;
    };

    uploadPromise
      .then(async (response) => {
        if (response?.errorsFieldsArray) {
          respArchivoErroneo200(
            res,
            response.errorsFieldsArray,
            ...previousResults
          );
          return;
        }
        if (response.errors.length >= 1) {
          const resultDelete = await eliminarArchivosCargados(
            tablesFilesArray,
            sequencesTablesFilesArray,
            idTablesFilesArray
          );
          console.log(resultDelete);
          await actualizarCampoCargado(
            respArchivoErroneo415(res, {
              errores: [...response.errors, ...previousErrors],
              cargado: false,
              resultDelete,
              idCargaArchivos,
            }),
            false,
            INFO_TABLES.cod_institution,
            false
          );
        } else {
          const finalRespArray = [];
          forEach(previousResults[0].files, (item) => {
            finalRespArray.push({
              archivo: item,
              cargado: true,
              id_carga_archivos: idCargaArchivos,
              mensaje: `Envió satisfactorio`,
              fecha_operacion: fechaInicialOperacion,
            });
          });
          // includes(map(codigosSeguros, "codigo"), INFO_TABLES.code)
          if (includes(map(codigosSeguros, "codigo"), INFO_TABLES.code)) {
            const funcionesSegurosAux = await funcionesSeguros(
              fechaInicialOperacion,
              req.user.id_usuario,
              INFO_TABLES.cod_institution
            );
            if (funcionesSegurosAux.ok !== true)
              throw funcionesSegurosAux.result;
            else
              actualizarCampoCargado(
                respResultadoCorrectoObjeto200(res, finalRespArray),
                true,
                INFO_TABLES.cod_institution,
                true
              );
          } else if (
            includes(map(codigosPensiones, "codigo"), INFO_TABLES.code)
          ) {
            const funcionesInversionesAux = await funcionesInversiones(
              fechaInicialOperacion,
              req.user.id_usuario
            );
            if (funcionesInversionesAux.ok !== true)
              throw funcionesInversionesAux.result;
            else
              actualizarCampoCargado(
                respResultadoCorrectoObjeto200(res, finalRespArray),
                true,
                INFO_TABLES.cod_institution,
                true
              );
          } else {
            actualizarCampoCargado(
              respResultadoCorrectoObjeto200(res, finalRespArray),
              true,
              INFO_TABLES.cod_institution,
              true
            );
          }
        }
      })
      .catch(async (err) => {
        const resultDelete = await eliminarArchivosCargados(
          tablesFilesArray,
          sequencesTablesFilesArray,
          idTablesFilesArray
        );
        await actualizarCampoCargado(
          respErrorServidor500END(
            res,
            {
              errores: err,
              cargado: false,
              resultDelete: resultDelete,
              idCargaArchivos: idCargaArchivos,
            },
            `Ocurrió un error inesperado. ERROR: ${err.message}`,
            false,
            INFO_TABLES.cod_institution,
            false
          )
        );
      });
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
