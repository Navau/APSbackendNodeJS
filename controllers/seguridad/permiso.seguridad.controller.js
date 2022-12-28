const { forEach, size, find, map, filter, groupBy } = require("lodash");
const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respUsuarioNoAutorizado,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_seg_permiso";

async function CambiarPermisos(req, res) {
  try {
    const { permisos, id_rol } = req.body;
    const errors = [];
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

    forEach([permisosDB, tablaAccion, acciones], (item) => {
      if (item?.err) {
        errors.push({ err: item.err, message: item.err.message });
      }
    });
    if (size(errors) > 0) {
      respErrorServidor500END(res, errors);
      return;
    }

    const tablaAccionPermisosAuxArray = [];
    forEach(permisos, (itemP) => {
      forEach(itemP.tablas, (itemP2) => {
        if (size(itemP2.data_tabla_accion) > 0) {
          forEach(itemP2.data_tabla_accion, (itemP3) => {
            forEach(tablaAccion.result, (itemTA) => {
              if (itemP3.id_tabla_accion === itemTA.id_tabla_accion) {
                tablaAccionPermisosAuxArray.push({
                  ...itemP3,
                  tabla: itemP2.tabla,
                  esCompleto: itemP2.esCompleto,
                  data_accion: find(
                    acciones.result,
                    (itemA) => itemA.id_accion === itemP3.id_accion
                  ),
                });
              }
            });
          });
        }
      });
    });

    const permisosAgrupadosPorTabla = groupBy(
      tablaAccionPermisosAuxArray,
      (item) => `${item.id_tabla}_${item.tabla}`
    );
    const permisosAuxArray = [];
    const errorsPermisosAuxArray = [];

    forEach(permisosAgrupadosPorTabla, (itemPAPT) => {
      forEach(itemPAPT, (itemPAPT2) => {
        forEach(permisosDB.result, (itemPDB) => {
          if (
            itemPAPT2.id_tabla_accion === itemPDB.id_tabla_accion &&
            itemPAPT2.esCompleto !== itemPDB.activo
          ) {
            permisosAuxArray.push({
              id_permiso: itemPDB.id_permiso,
              esCompleto: itemPAPT2.esCompleto,
            });
            errorsPermisosAuxArray.push({
              id_permiso: itemPDB.id_permiso,
              activo: itemPDB.activo,
            });
            // IFAux.push({
            //   id_permiso: itemPAPT2.id_permiso,
            //   tabla: itemPAPT2.tabla,
            //   id_accion: itemPAPT2.data_accion?.id_accion,
            //   accion: itemPAPT2.data_accion?.accion,
            //   esCompleto: itemPAPT2.esCompleto,
            //   activo: itemPDB.activo,
            // });
          }
        });
      });
    });

    const querys = map(permisosAuxArray, (item) => {
      return {
        id: item.id_permiso,
        text: ActualizarUtil("APS_seg_permiso", {
          body: { activo: item.esCompleto },
          idKey: "id_permiso",
          idValue: item.id_permiso,
          returnValue: ["*"],
        }),
      };
    });
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

    const errorsQuerys = [];
    const resultQuerys = [];

    for await (const query of querys) {
      await pool
        .query(query.text)
        .then((result) => {
          resultQuerys.push({ id: query.id, result: result.rows });
        })
        .catch((err) => {
          errorsQuerys.push({ err });
        });
    }

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
    }

    respResultadoCorrectoObjeto200(res, resultQuerys);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ListarPermisos(req, res) {
  try {
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
      respErrorServidor500END(res, errors);
      return;
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
                        itemTAMap.id_tabla_accion === itemP.id_tabla_accion &&
                        itemP.id_rol === id_rol
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
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

//FUNCION PARA OBTENER TODOS LOS PREMISO DE SEGURIDAD
async function Listar(req, res) {
  const query = ListarUtil(nameTable);
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//FUNCION PARA OBTENER UN PREMISO, CON BUSQUEDA
async function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = BuscarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA OBTENER UN PREMISO, CON ID DEL PREMISO
async function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = EscogerUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA INSERTAR UN PREMISO
async function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
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
  }
}

//FUNCION PARA ACTUALIZAR UN PREMISO
async function Actualizar(req, res) {
  const body = req.body;

  let query = "";

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = ActualizarUtil(nameTable, params);

      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(
              res,
              result,
              "Información actualizada correctamente"
            );
          }
        }
      });
    }
  }
}

//FUNCION PARA DESHABILITAR UN PREMISO
async function Deshabilitar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = DeshabilitarUtil(nameTable, params);
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
  }
}

module.exports = {
  Listar,
  ListarPermisos,
  CambiarPermisos,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Deshabilitar,
};
