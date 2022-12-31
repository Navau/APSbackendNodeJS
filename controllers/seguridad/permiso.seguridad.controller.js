const {
  forEach,
  size,
  find,
  map,
  filter,
  groupBy,
  differenceWith,
  difference,
  split,
} = require("lodash");
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
      respErrorServidor500END(res, errors);
      return;
    }
    //#endregion

    //#region FORMATEO DE LOS DATOS OBTENIDOS DESDE EL FRONTEND, ESTO SE HACE PARA QUE EXISTA UN MEJOR ORDEN CUANDO SE ESTE VALIDANDO ESTOS REGISTROS PARA REGISTRARLOS EN LAS TABLAS DE PERMISOS Y TABLA ACCION
    const errorsAdmin = []; //VARIABLE DE ERRORES DE TABLA ACCION
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

    //#region ERRORES ALMACENADOS EN LA VARIABLE "errorsAdmin" SI NO EXISTEN REGISTROS SUFICIENTES EN LA TABLA ACCION
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

    //#region SECCION PARA DIFERENCIAR LOS DATOS QUE LLEGAN DEL FRONTEND Y COMPARARLOS CON LOS PERMISOS QUE SE QUIEREN EDITAR, ESTO SIRVE PARA PODER CONTROLAR QUE LOS REGISTROS EXISTAN EN LA TABLA DE PERMISO JUNTO CON EL ROL SELECCIONADO. ESTOS PERMISOS DEBEN EXISTIR EN LA TABLA DE PERMISOS JUNTO AL ROL QUE SE QUIERE EDITAR, SI HAY ALGUNA DIFERENCIA ENTRE LO QUE LLEGA DEL FRONTEND Y LO QUE EXISTE EN LA BD, HABRA UN ERROR.
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
    forEach(diferenciasAux, (itemDIF, indexDIF) => {
      const separatorDeIndex = "-*-";
      const idTablaAux = split(indexDIF, separatorDeIndex)[0];
      const tablaAux = split(indexDIF, separatorDeIndex)[1];
      const descripcionAux = split(indexDIF, separatorDeIndex)[2];

      errorsAdminRolNoExistenteAuxArray.push({
        mensaje: `No existe información suficiente para cambiar el permiso de ${descripcionAux}, porfavor, comuniquese con el administrador`,
        id_rol,
        tabla: tablaAux,
        descripcion: descripcionAux,
        tipo_error: `No existen registros en APS_seg_permiso con el rol "${id_rol}" para la tabla "${tablaAux}" de "${descripcionAux}"`,
      });
    });

    if (size(errorsAdminRolNoExistenteAuxArray) > 0) {
      respResultadoIncorrectoObjeto200(
        res,
        null,
        errorsAdminRolNoExistenteAuxArray
      );
      return;
    }

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
    const errorsQuerys = [];
    const resultQuerys = [];
    const errorsQuerysPermisos = [];

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
      respErrorServidor500END(res, errorsQuerys);
      return;
    }
    //#endregion

    respResultadoCorrectoObjeto200(res, resultQuerys); //RESULTADOS, SI SE ACTUALIZO ALGO, ENTONCES MOSTRARA EL ID Y EL REGISTRO QUE SE ACTUALIZO, SI NO, DEVOLVERA UN ARRAY VACIO
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
