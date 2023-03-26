const pool = require("../../database");
const { map } = require("lodash");
const moment = require("moment");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  EscogerInternoUtil,
  ObtenerUltimoRegistro,
  ValorMaximoDeCampoUtil,
  EjecutarFuncionSQL,
  EjecutarVariosQuerys,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoVacioObject200,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_aud_carga_archivos_bolsa";

async function tipoDeCambio(req, res) {
  const { fecha_operacion } = req.body;

  let query = EscogerInternoUtil("APS_oper_tipo_cambio", {
    select: [
      `"APS_oper_tipo_cambio".fecha`,
      `"APS_param_moneda".sigla`,
      `"APS_param_moneda".descripcion`,
      `"APS_oper_tipo_cambio".compra`,
      `"APS_oper_tipo_cambio".venta`,
      `"APS_param_moneda".activo`,
      `"APS_param_moneda".es_visible`,
    ],
    innerjoin: [
      {
        table: "APS_param_moneda",
        on: [
          {
            table: "APS_oper_tipo_cambio",
            key: "id_moneda",
          },
          {
            table: "APS_param_moneda",
            key: "id_moneda",
          },
        ],
      },
    ],
    where: [
      { key: `"APS_param_moneda".activo`, value: true },
      { key: `"APS_oper_tipo_cambio".fecha`, value: fecha_operacion },
    ],
  });
  pool
    .query(query)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        respResultadoCorrecto200(res, result);
      }
    })
    .catch((err) => {
      respErrorServidor500(res, err);
    });
}

//Obtiene la ultima fecha de operacion siempre que cargado = true
async function ValorMaximo(req, res) {
  const { max } = req.body;
  const { id_rol, id_usuario } = req.user;
  let fieldMax = max ? max : "fecha_operacion";
  let whereFinal = [
    {
      key: "id_rol",
      value: id_rol,
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

//Obtiene la ultima carga mediante el parametro cargado
async function UltimaCarga(req, res) {
  const { cargado } = req.body;
  const { id_rol, id_usuario } = req.user;
  const params = {
    where: [
      {
        key: "id_rol",
        value: id_rol,
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
  const { fecha_operacion } = req.body;
  const { id_rol, id_usuario } = req.user;

  let query = `SELECT CASE 
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
    WHERE bolsa.id_rol = ${id_rol} 
    AND bolsa.fecha_operacion = '${fecha_operacion}') AS max_id 
    LEFT JOIN "APS_aud_carga_archivos_bolsa" AS datos 
    ON max_id.maxid = datos.id_carga_archivos;
  `;
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

//TO DO: Arreglar todo lo referente a SQL inyection
async function HabilitarReproceso(req, res) {
  try {
    const { fecha } = req.body;
    const queryUpdate = `UPDATE public."APS_aud_carga_archivos_bolsa" SET cargado = false, fecha_carga = '${moment().format(
      "YYYY-MM-DD HH:mm:ss.SSS"
    )}', reproceso = true WHERE fecha_operacion = '${fecha}' AND cargado = true RETURNING *;`;
    console.log(queryUpdate);
    const querys = [
      queryUpdate,
      EjecutarFuncionSQL("aps_fun_borra_tablas_bolsa", {
        body: { fecha },
      }),
    ];

    const results = await EjecutarVariosQuerys(querys);
    if (results.ok === null) {
      throw results.result;
    }
    if (results.ok === false) {
      throw results.errors;
    }

    respResultadoCorrectoObjeto200(res, {
      actualizacion: results.result[0].data,
      eliminacion: results.result[1].data,
    });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

// OBTENER TODOS LOS CARGA ARCHIVO BOLSA DE SEGURIDAD
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

// OBTENER UN CARGA ARCHIVO BOLSA, CON BUSQUEDA
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

// OBTENER UN CARGA ARCHIVO BOLSA, CON ID DEL CARGA ARCHIVO BOLSA
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

async function Reporte(req, res) {
  const { fecha } = req.body;

  if (Object.entries(req.body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: {
        fecha,
      },
    };
    const query = EjecutarFuncionSQL(
      "aps_reporte_validacion_preliminar",
      params
    );

    pool
      .query(query)
      .then((result) => {
        if (result.rowCount > 0) {
          respResultadoCorrectoObjeto200(res, result.rows);
        } else {
          respResultadoIncorrectoObjeto200(
            res,
            null,
            result.rows,
            `No existen errores registrados para esa fecha`
          );
        }
      })
      .catch((err) => {
        console.log(err);
        respErrorServidor500END(res, err);
      });
  }
}

async function ReporteExito(req, res) {
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
      respErrorServidor500END(res, err);
    });
}

// INSERTAR UN CARGA ARCHIVO BOLSA
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

// ACTUALIZAR UN CARGA ARCHIVO BOLSA
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

// DESHABILITAR UN CARGA ARCHIVO BOLSA
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
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Deshabilitar,
  tipoDeCambio,
  ValorMaximo,
  UltimaCarga,
  UltimaCarga2,
  ReporteExito,
  HabilitarReproceso,
};
