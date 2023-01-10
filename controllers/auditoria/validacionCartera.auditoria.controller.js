const dayjs = require("dayjs");
const {
  size,
  isEmpty,
  find,
  map,
  result,
  uniq,
  forEach,
  uniqBy,
  filter,
  max,
} = require("lodash");
const pool = require("../../database");
const {
  EjecutarProcedimientoSQL,
  EscogerInternoUtil,
  EjecutarFuncionSQL,
  EjecutarVariosQuerys,
  ListarUtil,
  InsertarUtil,
  InsertarVariosUtil,
  ValorMaximoDeCampoUtil,
} = require("../../utils/consulta.utils");
const { obtenerFechaActual } = require("../../utils/formatearDatos");
const {
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respDatosNoRecibidos400,
  respResultadoIncorrectoObjeto200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_aud_valora_archivos_pensiones_seguros";
const nameTableErrors = "APS_aud_errores_valora_archivos_pensiones_seguros";

async function Validar(req, res) {
  const { fecha } = req.body;
  const { id_rol } = req.user;
  const params = {
    body: {
      fecha,
    },
  };
  const query =
    id_rol === 7
      ? EjecutarProcedimientoSQL(
          `aps_proc_valoracion_cartera_pensiones`,
          params
        )
      : id_rol === 10
      ? EjecutarProcedimientoSQL(`aps_proc_valoracion_cartera_seguros`, params)
      : null;

  if (query === null) {
    respDatosNoRecibidos400(res, "El rol debe ser 10 o 7");
    return;
  }

  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

async function Validar2(req, res) {
  try {
    const { fecha, id_rol_valora } = req.body;
    const { id_rol, id_usuario } = req.user;
    const idRolFinal = id_rol_valora ? id_rol_valora : id_rol;

    const valoracion = await pool
      .query(
        EjecutarFuncionSQL("aps_valida_valoracion_cartera", { body: { fecha } })
      )
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    if (valoracion?.err) {
      throw valoracion.err;
    }

    if (size(valoracion.result) > 0) {
      //#region INSTITUCIONES
      const instituciones = uniq(
        map(valoracion.result, (item) => item.cod_institucion)
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
        orderby: {
          field: "nro_carga DESC",
        },
      });

      const cargas = await pool
        .query(queryCargas)
        .then((result) => {
          if (result.rowCount > 0) {
            return { ok: true, result: uniqBy(result.rows, "cod_institucion") };
          } else {
            return { ok: false, result: result.rows };
          }
        })
        .catch((err) => {
          return { ok: null, err };
        });
      if (cargas?.err) {
        throw cargas.err;
      }
      //#endregion
      //#region NUEVAS CARGAS
      const queryNuevaCarga = InsertarVariosUtil(nameTable, {
        body: map(instituciones, (codigo) => {
          const maxAux = max(
            filter(cargas.result, (itemF) => itemF.cod_institucion === codigo),
            (item) => {
              return item.nro_carga;
            }
          );
          return {
            fecha_operacion: fecha,
            cod_institucion: codigo,
            nro_carga: cargas.ok === false ? 1 : maxAux.nro_carga + 1,
            fecha_carga: new Date(),
            valorado: false,
            id_rol: idRolFinal,
            id_usuario,
          };
        }),
        returnValue: ["*"],
      });
      const nuevaCarga = await pool
        .query(queryNuevaCarga)
        .then((result) => {
          return { ok: true, result: result.rows };
        })
        .catch((err) => {
          return { ok: null, err };
        });
      if (nuevaCarga?.err) {
        throw nuevaCarga.err;
      }
      //#endregion
      //#region INSERCION DE ERRORES
      const InsertarErroresArray = [];
      forEach(nuevaCarga.result, (itemCarga) => {
        const erroresAux = filter(
          valoracion.result,
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
      const insersionErrores = await pool
        .query(queryInsertarErrores)
        .then((result) => {
          return { ok: true, result: result.rows };
        })
        .catch((err) => {
          return { ok: null, err };
        });
      if (insersionErrores?.err) {
        throw insersionErrores.err;
      }
      //#endregion

      respResultadoCorrectoObjeto200(res, {
        cargas: nuevaCarga.result,
        errores: insersionErrores.result,
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

      const institucion = await pool
        .query(queryInstitucion)
        .then((result) => {
          return { ok: true, result: result.rows };
        })
        .catch((err) => {
          return { ok: null, err };
        });

      if (institucion?.err) {
        throw institucion.err;
      }
      //#endregion
      //#region INSTITUCIONES
      const instituciones = uniq(
        map(institucion.result, (item) => item.cod_institucion)
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
        orderby: {
          field: "nro_carga DESC",
        },
      });

      const cargas = await pool
        .query(queryCargas)
        .then((result) => {
          if (result.rowCount > 0) {
            return { ok: true, result: uniqBy(result.rows, "cod_institucion") };
          } else {
            return { ok: false, result: result.rows };
          }
        })
        .catch((err) => {
          return { ok: null, err };
        });
      if (cargas?.err) {
        throw cargas.err;
      }
      //#endregion
      //#region NUEVAS CARGAS
      const queryNuevaCarga = InsertarVariosUtil(nameTable, {
        body: map(instituciones, (codigo) => {
          const maxAux = max(
            filter(cargas.result, (itemF) => itemF.cod_institucion === codigo),
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
      const nuevaCarga = await pool
        .query(queryNuevaCarga)
        .then((result) => {
          return { ok: true, result: result.rows };
        })
        .catch((err) => {
          return { ok: null, err };
        });
      if (nuevaCarga?.err) {
        throw nuevaCarga.err;
      }
      //#endregion
      respResultadoCorrectoObjeto200(res, {
        cargas: nuevaCarga.result,
        errores: [],
      });
    }
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

async function ObtenerInformacion(req, res) {
  try {
    const { fecha, id_rol, id_rol_cargas, cargado, estado } = req.body;
    // const idRolFinal = id_rol ? id_rol : req.user.id_rol;
    // const cargadoFinal = cargado === true || cargado === false ? cargado : null;
    // const estadoFinal = isEmpty(estado) ? null : estado;
    if (!fecha) {
      respDatosNoRecibidos400(res, "La fecha es obligatorio");
    }
    // const params = {
    //   body: {
    //     fecha,
    //     idRolFinal,
    //   },
    // };
    // params.where = [];
    // params.where = [...params.where, { key: "descripcion", value: "Diaria" }];
    // if (cargadoFinal !== null) {
    //   params.where = [...params.where, { key: "cargado", value: cargadoFinal }];
    // }
    // if (estadoFinal !== null) {
    //   params.where = [...params.where, { key: "estado", value: estadoFinal }];
    // }

    // EjecutarFuncionSQL("aps_reporte_control_envio", params),
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
      `SELECT COUNT(*) FROM public."APS_aud_valora_archivos_pensiones_seguros" WHERE fecha_operacion='${fecha}' AND valorado=true AND id_usuario IN (CAST((SELECT DISTINCT cod_institucion FROM public."APS_aud_carga_archivos_pensiones_seguros" WHERE cargado = true AND fecha_operacion = '${fecha}' AND id_rol IN (${id_rol_cargas.join()})) AS INTEGER))`,
    ];

    id_rol === 10
      ? querys.push(
          `SELECT COUNT(*) FROM public."APS_view_existe_valores_seguros";`
        )
      : id_rol === 7
      ? querys.push(
          `SELECT COUNT(*) FROM public."APS_view_existe_valores_pensiones"`
        )
      : null;

    querys.push(ListarUtil("APS_seg_usuario"));
    console.log(querys);
    const results = await EjecutarVariosQuerys(querys);

    if (results.ok === null) {
      throw results.result;
    }
    if (results.ok === false) {
      throw results.errors;
    }

    const messages = [];

    if (size(results.result[1].data) === 0) {
      messages.push("No existe Tipo de Cambio para la Fecha seleccionada");
    }
    if (size(results.result[2].data) === 0) {
      messages.push("No existe información en la Bolsa (Archivo N)");
    }
    const counterRegistros = results.result?.[3]?.data?.[0]?.count;
    if (counterRegistros > 0) {
      messages.push("La información ya fue valorada");
    }
    const counterVistas = results.result?.[4]?.data?.[0]?.count;
    if (counterVistas > 0) {
      messages.push(
        "No existen características para los siguientes valores, favor registrar"
      );
    }
    if (size(results.result?.[0]) === 0) {
      messages.push("No existen registros en valoracion cartera");
    }

    if (size(messages) > 0) {
      respResultadoIncorrectoObjeto200(res, null, [], messages);
      return;
    }

    respResultadoCorrectoObjeto200(
      res,
      map(results.result?.[0].data, (item) => {
        return {
          descripcion:
            item.id_periodo === 154 ? "Diaria" : `Mensual ${item.id_periodo}`,
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
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  Validar,
  Validar2,
  ObtenerInformacion,
};
