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
  AsignarInformacionCompletaPorUnaClave,
  EjecutarVariosQuerys,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respErrorServidor500END,
  respResultadoIncorrecto200,
  respResultadoIncorrectoObjeto200,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_oper_renta_fija";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_param_tipo_instrumento";
const nameTableFK3 = "APS_param_moneda";
const nameTableFK4 = "APS_param_clasificador_comun";
const nameTableFK5 = "APS_seg_usuario";
const nameTableFK6 = "APS_oper_emision";

async function ListarCompleto(req, res) {
  try {
    const querys = [
      ListarUtil(nameTable, { activo: null }),
      ListarUtil(nameTableFK1),
      ListarUtil(nameTableFK2),
      ListarUtil(nameTableFK3),
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 16 },
          { key: "activo", value: true },
        ],
      }), // TIPO TASA
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 23 },
          { key: "activo", value: true },
        ],
      }), // TIPO INTERES
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 20 },
          { key: "activo", value: true },
        ],
      }), //PREPAGO
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 21 },
          { key: "activo", value: true },
        ],
      }), //SUBORDINADO
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 19 },
          { key: "activo", value: true },
        ],
      }), //CUSTODIO
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 24 },
          { key: "activo", value: true },
        ],
      }), //PERIODO VENCIMIENTO
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 25 },
          { key: "activo", value: true },
        ],
      }), //TIPO AMORTIZACION
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 6 },
          { key: "activo", value: true },
        ],
      }), //CALIFICACION
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 7 },
          { key: "activo", value: true },
        ],
      }), //CALIFICADORA
      ListarUtil(nameTableFK5), //USUARIO
      ListarUtil(nameTableFK6, { activo: null }), //EMISION
    ];
    const resultQuerys = await EjecutarVariosQuerys(querys);
    if (resultQuerys.ok === null) {
      throw resultQuerys.result;
    }
    if (resultQuerys.ok === false) {
      throw resultQuerys.errors;
    }
    const resultFinal = AsignarInformacionCompletaPorUnaClave(
      resultQuerys.result,
      [
        { table: nameTableFK4, key: "id_tipo_tasa" },
        { table: nameTableFK4, key: "id_tipo_interes" },
        { table: nameTableFK4, key: "id_prepago" },
        { table: nameTableFK4, key: "id_subordinado" },
        { table: nameTableFK4, key: "id_custodia" },
        { table: nameTableFK4, key: "id_periodo_vencimiento" },
        { table: nameTableFK4, key: "id_tipo_amortizacion" },
        { table: nameTableFK4, key: "id_calificacion" },
        { table: nameTableFK4, key: "id_calificadora" },
      ]
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

//FUNCION PARA OBTENER TODOS LOS RENTA FIJA DE SEGURIDAD
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

async function EmisorPorTipoInstrumento(req, res) {
  // SELECT id_emision, EM.id_emisor, denominacion, id_moneda, monto_emision, EM.id_tipo_instrumento, cantidad_series
  // FROM public."APS_oper_emision" EM
  // INNER jOIN public."APS_param_emisor" E ON EM.id_emisor = E.id_emisor
  // INNER jOIN public."APS_param_tipo_instrumento" TI ON TI.id_tipo_instrumento = EM.id_tipo_instrumento
  const query = EscogerInternoUtil(nameTable, {
    select: [
      "id_emision, EM.id_emisor, denominacion, id_moneda, monto_emision, EM.id_tipo_instrumento, cantidad_series",
    ],
    innerjoin: [
      {
        table: "APS_param_emisor",
        on: [
          {
            table: nameTable,
            key: "id_emisor",
          },
          {
            table: "APS_param_emisor",
            key: "id_emisor",
          },
        ],
      },
      {
        table: "APS_param_tipo_instrumento",
        on: [
          {
            table: nameTable,
            key: "id_tipo_instrumento",
          },
          {
            table: "APS_param_tipo_instrumento",
            key: "id_tipo_instrumento",
          },
        ],
      },
    ],
  });
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//FUNCION PARA OBTENER UN RENTA FIJA, CON BUSQUEDA
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

//FUNCION PARA OBTENER UN RENTA FIJA, CON ID DEL RENTA FIJA
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

//FUNCION PARA INSERTAR UN RENTA FIJA
async function Insertar(req, res) {
  const body = req.body;
  const { clave_instrumento, fecha_emision } = body;

  if (!clave_instrumento) {
    respDatosNoRecibidos400(res, "No se recibio clave_instrumento");
    return;
  }

  const queryClaveInstrumento = EscogerInternoUtil(nameTable, {
    select: ["*"],
    where: [
      {
        key: "clave_instrumento",
        value: clave_instrumento,
      },
    ],
  });

  const claveInstrumentoValidacion = await pool
    .query(queryClaveInstrumento)
    .then((result) => {
      if (result.rowCount > 0) {
        return { ok: false, data: result };
      } else {
        return { ok: true, data: result };
      }
    })
    .catch((err) => {
      return { ok: null, err };
    });

  if (claveInstrumentoValidacion.ok === false) {
    respResultadoIncorrectoObjeto200(
      res,
      null,
      claveInstrumentoValidacion?.data.rows,
      "Clave de Instrumento ya se encuentra registrada"
    );
    return;
  }
  if (claveInstrumentoValidacion.ok === null) {
    respErrorServidor500END(res, claveInstrumentoValidacion?.err);
    return;
  }

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

//FUNCION PARA ACTUALIZAR UN RENTA FIJA
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

async function ActualizarPlazoDias(req, res) {
  const body = req.body;

  const query = `UPDATE public."${nameTable}" SET id_calificacion = ${
    body.id_calificacion
  }, id_calificadora = ${body.id_calificadora}, id_moneda = ${
    body.id_moneda
  } WHERE id_emisor = ${body.id_emisor} AND id_tipo_instrumento = 13 ${
    body.id_plazo === "CP"
      ? "AND plazo_dias <= 360"
      : body.id_plazo === "LP"
      ? "AND plazo_dias > 360"
      : ""
  } RETURNING *;`;

  console.log(query);

  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//FUNCION PARA DESHABILITAR UN RENTA FIJA
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
  ListarCompleto,
  ActualizarPlazoDias,
};
