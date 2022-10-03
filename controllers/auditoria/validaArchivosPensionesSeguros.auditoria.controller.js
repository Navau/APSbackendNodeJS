const { map, filter } = require("lodash");
const pool = require("../../database");
const moment = require("moment");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
  EscogerInternoUtil,
  EjecutarFuncionSQL,
  InsertarVariosUtil,
  ObtenerInstitucion,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoVacioObject200,
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respResultadoVacio404END,
  respResultadoIncorrectoObjeto200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_aud_valida_archivos_pensiones_seguros";
const nameTableErrors = "APS_aud_errores_valida_archivos_pensiones_seguros";

async function ValorMaximo(req, res) {
  const { max, periodicidad } = req.body;
  const { id_rol, id_usuario } = req.user;
  const institucion = async () => {
    let queryInstitucion = EscogerInternoUtil("APS_seg_usuario", {
      select: [`"APS_seg_institucion".codigo`],
      innerjoin: [
        {
          table: `APS_seg_institucion`,
          on: [
            {
              table: `APS_seg_institucion`,
              key: "id_institucion",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_institucion",
            },
          ],
        },
        {
          table: `APS_seg_usuario_rol`,
          on: [
            {
              table: `APS_seg_usuario_rol`,
              key: "id_usuario",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_usuario",
            },
          ],
        },
      ],
      where: [
        { key: `"APS_seg_usuario".id_usuario`, value: id_usuario },
        { key: `"APS_seg_usuario_rol".id_rol`, value: id_rol },
      ],
    });

    const resultFinal = await pool
      .query(queryInstitucion)
      .then((result) => {
        if (result.rows.length >= 1) {
          return { ok: true, result: result?.rows?.[0] };
        } else {
          return { ok: false, result: result?.rows?.[0] };
        }
      })
      .catch((err) => {
        return { ok: false, err };
      });
    return resultFinal;
  };

  if (!periodicidad) {
    respDatosNoRecibidos400(res, "No se envio la periodicidad.");
  }

  const cod_institucion = await institucion();

  if (cod_institucion?.err) {
    respErrorServidor500END(res, err);
    return;
  }
  if (cod_institucion.ok === false) {
    respResultadoVacio404END(
      res,
      "No existe ninguna institución para este usuario."
    );
    return;
  }

  let fieldMax = max ? max : "fecha_operacion";
  let whereFinal = [
    {
      key: "id_rol",
      value: id_rol,
    },
    {
      key: "id_periodo",
      value: periodicidad,
    },
    {
      key: "cod_institucion",
      value: cod_institucion.result.codigo,
    },
    {
      key: "cargado",
      value: true,
    },
  ];
  const params = {
    fieldMax,
    where: whereFinal,
  };
  let query = ValorMaximoDeCampoUtil(nameTable, params);
  await pool
    .query(query)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        if (result.rows[0].max === null) {
          result = {
            ...result,
            rows: [
              {
                max: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
              },
            ],
          };
        }
        respResultadoCorrecto200(res, result);
      }
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500(res, err);
    });
}

async function UltimaCarga(req, res) {
  const { cargado } = req.body;
  const { id_rol, id_usuario } = req.user;
  const institucion = async () => {
    let queryInstitucion = EscogerInternoUtil("APS_seg_usuario", {
      select: [`"APS_seg_institucion".codigo`],
      innerjoin: [
        {
          table: `APS_seg_institucion`,
          on: [
            {
              table: `APS_seg_institucion`,
              key: "id_institucion",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_institucion",
            },
          ],
        },
        {
          table: `APS_seg_usuario_rol`,
          on: [
            {
              table: `APS_seg_usuario_rol`,
              key: "id_usuario",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_usuario",
            },
          ],
        },
      ],
      where: [
        { key: `"APS_seg_usuario".id_usuario`, value: id_usuario },
        { key: `"APS_seg_usuario_rol".id_rol`, value: id_rol },
      ],
    });

    const resultFinal = await pool
      .query(queryInstitucion)
      .then((result) => {
        if (result.rows.length >= 1) {
          return { ok: true, result: result?.rows?.[0] };
        } else {
          return { ok: false, result: result?.rows?.[0] };
        }
      })
      .catch((err) => {
        return { ok: false, err };
      });
    return resultFinal;
  };

  const cod_institucion = await institucion();

  if (cod_institucion?.err) {
    respErrorServidor500END(res, err);
    return;
  }
  if (cod_institucion.ok === false) {
    respResultadoVacio404END(
      res,
      "No existe ninguna institución para este usuario."
    );
    return;
  }
  const params = {
    where: [
      {
        key: "id_rol",
        value: id_rol,
      },
      {
        key: "cod_institucion",
        value: cod_institucion.result.codigo,
      },
      {
        key: "cargado",
        value: cargado === true || cargado === false ? cargado : true,
      },
    ],
    orderby: {
      field: "nro_carga",
    },
  };
  let query = ObtenerUltimoRegistro(nameTable, params);
  await pool
    .query(query)
    .then((result) => {
      respResultadoVacioObject200(res, result.rows);
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500(res, err);
    });
}

async function UltimaCarga2(req, res) {
  const { fecha_operacion, periodicidad } = req.body;
  const { id_rol, id_usuario } = req.user;

  let query = `
  SELECT CASE 
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
    FROM public."APS_aud_carga_archivos_pensiones_seguros" AS pen 
    INNER JOIN "APS_seg_institucion" AS int 
    ON int.codigo = pen.cod_institucion 
    INNER JOIN "APS_seg_usuario" AS usuario 
    ON usuario.id_institucion = int.id_institucion 
    WHERE usuario.id_usuario=${id_usuario} 
    AND pen.id_periodo=${periodicidad} 
    AND pen.fecha_operacion = '${fecha_operacion}') AS max_id 
    LEFT JOIN "APS_aud_carga_archivos_pensiones_seguros" AS datos 
    ON max_id.maxid = datos.id_carga_archivos
  `;

  console.log("TEST ULTIMA CARGA", query);
  await pool
    .query(query)
    .then((result) => {
      respResultadoVacioObject200(res, result.rows[0]);
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500(res, err);
    });
}

async function ObtenerErrores(fecha) {
  const errorsFinalArray = [];

  //#region Consultas
  const queryCalificadoraRF = EjecutarFuncionSQL(
    "aps_valida_calificacion_calificadora_rf",
    {
      body: { fecha },
    }
  );
  const calificadoraRF = await pool
    .query(queryCalificadoraRF)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  const queryCalificadoraRV = EjecutarFuncionSQL(
    "aps_valida_calificacion_calificadora_rv",
    {
      body: { fecha },
    }
  );

  const calificadoraRV = await pool
    .query(queryCalificadoraRV)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  const queryCalificadoraOA = EjecutarFuncionSQL(
    "aps_valida_calificacion_calificadora_oa",
    {
      body: { fecha },
    }
  );

  const calificadoraOA = await pool
    .query(queryCalificadoraOA)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });

  const queryCustodio = EjecutarFuncionSQL("aps_valida_custodio", {
    body: { fecha },
  });

  const custodio = await pool
    .query(queryCustodio)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });

  //#endregion

  if (calificadoraRF.ok === null) {
    errorsFinalArray.push({
      err: calificadoraRF.err,
      message: `Error al obtener los errores de CalificadoraRF (Renta Fija) ERROR: ${calificadoraRF.err.message}`,
    });
  }
  if (calificadoraRV.ok === null) {
    errorsFinalArray.push({
      err: calificadoraRV.err,
      message: `Error al obtener los errores de CalificadoraRV (Renta Variable) ERROR: ${calificadoraRV.err.message}`,
    });
  }
  if (calificadoraOA.ok === null) {
    errorsFinalArray.push({
      err: calificadoraOA.err,
      message: `Error al obtener los errores de CalificadoraOA (Otros Activos) ERROR: ${calificadoraOA.err.message}`,
    });
  }
  if (custodio.ok === null) {
    errorsFinalArray.push({
      err: custodio.err,
      message: `Error al obtener los errores de Custodio ERROR: ${custodio.err.message}`,
    });
  }

  if (errorsFinalArray.length > 0) {
    return {
      ok: false,
      result: [...errorsFinalArray],
    };
  } else {
    return {
      ok: true,
      result: [
        ...calificadoraRF.result,
        ...calificadoraRV.result,
        ...calificadoraOA.result,
        ...custodio.result,
      ],
    };
  }
}

async function Validar(req, res) {
  try {
    const { fecha } = req.body;
    const { id_rol, id_usuario } = req.user;
    const errorsFinalArray = [];
    const resultFinalArray = [];
    const unique = (array) => {
      let result = [];

      for (let val of array) {
        if (!result.includes(val)) {
          result.push(val);
        }
      }

      return result;
    };

    const errores = await ObtenerErrores(fecha);

    if (!errores.ok) {
      respErrorServidor500END(res, errores.result);
    } else {
      if (errores.result.length > 0) {
        const instituciones = [];
        map(errores.result, (item, index) => {
          instituciones.push(item.cod_institucion);
        });
        const institucionesUnicas = unique(instituciones);
        // console.log(nroCarga);
        for (let index = 0; index < institucionesUnicas.length; index++) {
          const item = institucionesUnicas[index];
          //#region NUMEROS DE CARGA POR INSTITUCION QUE VIENE DE LOS ERRORES
          const queryNroCarga = ValorMaximoDeCampoUtil(nameTable, {
            fieldMax: "nro_carga",
            where: [
              {
                key: "id_rol",
                value: id_rol,
              },
              {
                key: "fecha_operacion",
                value: fecha,
              },
              {
                key: "id_usuario",
                value: id_usuario,
              },
              {
                key: "cod_institucion",
                value: item,
              },
            ],
          });

          const carga = await pool
            .query(queryNroCarga)
            .then((resultNroCarga) => {
              let nroCarga = 1;
              if (!resultNroCarga.rowCount || resultNroCarga.rowCount < 1) {
                nroCarga = 1;
              } else {
                nroCarga =
                  resultNroCarga.rows[0]?.max !== null
                    ? resultNroCarga.rows[0]?.max
                    : null;
              }
              resultFinalArray.push({
                result: resultNroCarga.rows,
                message: `Se obtuvo correctamente nro_carga, cod_institucion: ${item}`,
              });
              return { nroCarga, cod_institucion: item };
            })
            .catch((err) => {
              console.log("ERR CARGA", err);
              errorsFinalArray.push({
                err,
                message: `Error al obtener nro_carga en la tabla ${nameTable}, cod_institucion ${item}`,
              });
              return null;
            });

          if (carga === null) {
            break;
          }
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
              },
            ],
            returnValue: ["id_valida_archivos"],
          });

          const audInsertValida = await pool
            .query(queryInsertValida)
            .then((result) => {
              resultFinalArray.push({
                result: result.rows,
                message: `Se inserto correctamente la validación en la tabla ${nameTable}`,
              });
              return result.rows?.[0];
            })
            .catch((err) => {
              errorsFinalArray.push({
                err,
                message: `Error al Insertar en la tabla ${nameTable}`,
              });
              return null;
            });
          if (audInsertValida === null) {
            break;
          }
          //#endregion
          //#region INSERTANDO LOS ERRORES DE LOS METODOS DE CALIFICADORA RF, RV, OA y Custodio en la tabla APS_aud_errores_valida_archivos_pensiones_seguros
          const erroresInsertArray = [];
          map(errores.result, (itemError, indexError) => {
            if (itemError.cod_institucion === item) {
              erroresInsertArray.push({
                id_valida_archivos: audInsertValida.id_valida_archivos,
                archivo: itemError.archivo,
                tipo_error: "Tipo de Cambio",
                descripcion: itemError.mensaje,
                valor: itemError.valor,
                enviada: itemError.enviada,
                aps: itemError.aps === null ? "null" : itemError.aps,
              });
            }
          });
          const queryInsertErrors = InsertarVariosUtil(nameTableErrors, {
            body: erroresInsertArray,
            returnValue: ["id_valida_archivos"],
          });

          const audInsertErrorsValida = await pool
            .query(queryInsertErrors)
            .then((result) => {
              resultFinalArray.push({
                result: result.rows,
                message: `Se inserto correctamente en la tabla ${nameTableErrors}`,
              });
              return result.rows;
            })
            .catch((err) => {
              console.log("ERR AUD INSERT VALIDA", err);
              errorsFinalArray.push({
                err,
                message: `Error al insertar en la tabla ${nameTableErrors}`,
              });
              return null;
            });
          if (audInsertErrorsValida === null) {
            break;
          }
          //#endregion
        }
      } else {
        //#region NUMERO CARGA POR INSTITUCION QUE VIENE DEL USUARIO ACTUAL
        const cod_institucion = ObtenerInstitucion(req.user);
        const queryNroCarga = ValorMaximoDeCampoUtil(nameTable, {
          fieldMax: "nro_carga",
          where: [
            {
              key: "id_rol",
              value: id_rol,
            },
            {
              key: "fecha_operacion",
              value: fecha,
            },
            {
              key: "id_usuario",
              value: id_usuario,
            },
            {
              key: "cod_institucion",
              value: cod_institucion.result.codigo,
            },
          ],
        });

        const carga = await pool
          .query(queryNroCarga)
          .then((resultNroCarga) => {
            let nroCarga = 1;
            if (!resultNroCarga.rowCount || resultNroCarga.rowCount < 1) {
              nroCarga = 1;
            } else {
              nroCarga =
                resultNroCarga.rows[0]?.max !== null
                  ? resultNroCarga.rows[0]?.max
                  : null;
            }
            resultFinalArray.push({
              result: resultNroCarga.rows,
              message: `Se obtuvo correctamente nro_carga, cod_institucion: ${item}`,
            });
            return { nroCarga, cod_institucion: item };
          })
          .catch((err) => {
            console.log("ERR CARGA", err);
            errorsFinalArray.push({
              err,
              message: `Error al obtener nro_carga en la tabla ${nameTable}, cod_institucion ${item}`,
            });
            return null;
          });
        if (carga === null) {
          respErrorServidor500END(res, nroCarga.err);
          return null;
        }

        //#endregion
        //#region INSERTANDO EN LA TABLA APS_aud_valida_archivos_pensiones_seguros
        const queryInsertValida = InsertarUtil(nameTable, {
          body: {
            fecha_operacion: fecha,
            cod_institucion: cod_institucion,
            nro_carga: parseInt(carga.nroCarga) + 1,
            fecha_carga: new Date(),
            validado: true,
            id_rol: id_rol,
            id_usuario: id_usuario,
          },
        });
        await pool
          .query(queryInsertValida)
          .then((result) => {
            resultFinalArray.push({
              result: result.rows,
              message: `Se inserto correctamente la validación en la tabla ${nameTable}`,
            });
          })
          .catch((err) => {
            errorsFinalArray.push({
              err,
              message: `Error al Insertar en la tabla ${nameTable}`,
            });
          });
        //#endregion
      }

      if (errorsFinalArray.length > 0) {
        respErrorServidor500END(res, errorsFinalArray);
        return null;
      } else {
        respResultadoCorrectoObjeto200(res, {
          resultFinalArray,
          errores: errores.result,
        });
        return null;
      }
    }
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

//FUNCION PARA OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE SEGURIDAD
function Listar(req, res) {
  let query = ListarUtil(nameTable);
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

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = BuscarUtil(nameTable, params);
    pool.query(query, (err, result) => {
      if (err) {
        respErrorServidor500(res, err);
      } else {
        if (!result.rows || result.rows < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrecto200(res, result);
        }
      }
    });
  }
}

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = EscogerUtil(nameTable, params);
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

//FUNCION PARA INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = InsertarUtil(nameTable, params);
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
            "Información guardada correctamente"
          );
        }
      }
    });
  }
}

//FUNCION PARA ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
function Actualizar(req, res) {
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

//FUNCION PARA DESHABILITAR UN CARGA ARCHIVO PENSIONES SEGURO
function Deshabilitar(req, res) {
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
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Deshabilitar,
  ValorMaximo,
  UltimaCarga,
  UltimaCarga2,
  Validar,
};
