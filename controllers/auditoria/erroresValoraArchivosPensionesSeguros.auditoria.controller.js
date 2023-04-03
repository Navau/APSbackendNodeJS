const {
  map,
  filter,
  isEmpty,
  size,
  uniqBy,
  forEach,
  includes,
  uniq,
  isUndefined,
} = require("lodash");
const pool = require("../../database");
const moment = require("moment");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
  EscogerInternoUtil,
  EjecutarFuncionSQL,
  InsertarVariosUtil,
  ObtenerInstitucion,
  EjecutarVariosQuerys,
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

const nameTable = "APS_aud_errores_valora_archivos_pensiones_seguros";

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

async function ObtenerErrores(fecha, codes) {
  const errorsFinalArray = [];

  //#region Consultas
  //#region CALIFICADORA RF
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
  //#endregion
  //#region CALIFICADORA RV
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
  //#endregion
  //#region CALIFICADORA OA
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

  //#endregion
  //#region CUSTODIO
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
  //#region VALIDA 411
  const queryValida411 = EjecutarFuncionSQL("aps_valida_411", {
    body: { fecha },
  });
  const valida411 = await pool
    .query(queryValida411)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  //#endregion
  //#region VALIDA 412
  const queryValida412 = EjecutarFuncionSQL("aps_valida_412", {
    body: { fecha },
  });
  const valida412 = await pool
    .query(queryValida412)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  //#endregion
  //#region VALIDA 413
  const queryValida413 = EjecutarFuncionSQL("aps_valida_413", {
    body: { fecha },
  });
  const valida413 = await pool
    .query(queryValida413)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  //#endregion
  //#region VALIDA 443
  const queryValida443 = EjecutarFuncionSQL("aps_valida_443", {
    body: { fecha },
  });
  const valida443 = await pool
    .query(queryValida443)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  //#endregion
  //#region VALIDA 451
  const queryValida451 = EjecutarFuncionSQL("aps_valida_451", {
    body: { fecha },
  });
  const valida451 = await pool
    .query(queryValida451)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  //#endregion
  //#region VALIDA 483
  const queryValida483 = EjecutarFuncionSQL("aps_valida_483", {
    body: { fecha },
  });
  const valida483 = await pool
    .query(queryValida483)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  //#endregion
  //#region VALIDA 484
  const queryValida484 = EjecutarFuncionSQL("aps_valida_484", {
    body: { fecha },
  });
  const valida484 = await pool
    .query(queryValida484)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  //#endregion
  //#region VALIDA 485
  const queryValida485 = EjecutarFuncionSQL("aps_valida_485", {
    body: { fecha },
  });
  const valida485 = await pool
    .query(queryValida485)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  //#endregion
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
  if (valida411.ok === null) {
    errorsFinalArray.push({
      err: valida411.err,
      message: `Error al obtener los errores de 411 ERROR: ${valida411.err.message}`,
    });
  }
  if (valida412.ok === null) {
    errorsFinalArray.push({
      err: valida412.err,
      message: `Error al obtener los errores de 412 ERROR: ${valida412.err.message}`,
    });
  }
  if (valida413.ok === null) {
    errorsFinalArray.push({
      err: valida413.err,
      message: `Error al obtener los errores de 413 ERROR: ${valida413.err.message}`,
    });
  }
  if (valida443.ok === null) {
    errorsFinalArray.push({
      err: valida443.err,
      message: `Error al obtener los errores de 443 ERROR: ${valida443.err.message}`,
    });
  }
  if (valida451.ok === null) {
    errorsFinalArray.push({
      err: valida451.err,
      message: `Error al obtener los errores de 451 ERROR: ${valida451.err.message}`,
    });
  }
  if (valida483.ok === null) {
    errorsFinalArray.push({
      err: valida483.err,
      message: `Error al obtener los errores de 483 ERROR: ${valida483.err.message}`,
    });
  }
  if (valida484.ok === null) {
    errorsFinalArray.push({
      err: valida484.err,
      message: `Error al obtener los errores de 484 ERROR: ${valida484.err.message}`,
    });
  }
  if (valida485.ok === null) {
    errorsFinalArray.push({
      err: valida485.err,
      message: `Error al obtener los errores de 485 ERROR: ${valida485.err.message}`,
    });
  }

  if (
    includes(codes, "461") ||
    includes(codes, "471") ||
    includes(codes, "491") ||
    includes(codes, "492")
  ) {
    //#region Consultas
    //#region VALIDA 461
    const queryValida461 = EjecutarFuncionSQL("aps_valida_461", {
      body: { fecha },
    });
    const valida461 = await pool
      .query(queryValida461)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    //#endregion
    //#region VALIDA 491
    const queryValida491 = EjecutarFuncionSQL("aps_valida_491", {
      body: { fecha },
    });
    const valida491 = await pool
      .query(queryValida491)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    //#endregion
    //#region VALIDA 461
    const queryValida492 = EjecutarFuncionSQL("aps_valida_492", {
      body: { fecha },
    });
    const valida492 = await pool
      .query(queryValida492)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    //#endregion
    //#endregion

    if (valida461.ok === null) {
      errorsFinalArray.push({
        err: valida461.err,
        message: `Error al obtener los errores de 461 ERROR: ${valida461.err.message}`,
      });
    }
    if (valida491.ok === null) {
      errorsFinalArray.push({
        err: valida491.err,
        message: `Error al obtener los errores de 491 ERROR: ${valida491.err.message}`,
      });
    }
    if (valida492.ok === null) {
      errorsFinalArray.push({
        err: valida492.err,
        message: `Error al obtener los errores de 492 ERROR: ${valida492.err.message}`,
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
          ...valida411.result,
          ...valida412.result,
          ...valida443.result,
          ...valida451.result,
          ...valida483.result,
          ...valida484.result,
          ...valida485.result,
          ...valida461.result,
          ...valida491.result,
          ...valida492.result,
        ],
      };
    }
  } else {
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
          ...valida411.result,
          ...valida412.result,
          ...valida443.result,
          ...valida451.result,
          ...valida483.result,
          ...valida484.result,
          ...valida485.result,
        ],
      };
    }
  }
}

async function ObtenerErroresDiariosMensual(fecha) {
  const errorsFinalArray = [];
  //#region APS_VALIDA
  const queryValida = EjecutarFuncionSQL("aps_valida", {
    body: { fecha },
  });
  const valida = await pool
    .query(queryValida)
    .then((result) => {
      return { ok: true, result: result.rows };
    })
    .catch((err) => {
      return { ok: null, err };
    });
  //#endregion
  if (valida.ok === null) {
    errorsFinalArray.push({
      err: valida.err,
      message: `Error al obtener los errores de aps_valida ERROR: ${valida.err.message}`,
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
      result: [...valida.result],
    };
  }
}

// OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE SEGURIDAD
async function Listar(req, res) {
  const query = ListarUtil(nameTable, { activo: null });
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
async function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
      activo: null,
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

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
async function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
      activo: null,
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

// INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
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

// ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
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

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  ValorMaximo,
  UltimaCarga,
  UltimaCarga2,
};
