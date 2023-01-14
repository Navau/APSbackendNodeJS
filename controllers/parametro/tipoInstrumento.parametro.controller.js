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
  EjecutarVariosQuerys,
  AsignarInformacionCompletaPorUnaClave,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respErrorServidor500END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_tipo_instrumento";
const nameTableFK1 = "APS_param_clasificador_comun";
const nameTableFK2 = "APS_param_clasificador_comun";
const nameTableFK3 = "APS_param_clasificador_comun";

async function ListarCompleto(req, res) {
  try {
    const querys = [
      ListarUtil(nameTable),
      EscogerInternoUtil(nameTableFK1, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 10 },
          { key: "activo", value: true },
        ],
      }),
      EscogerInternoUtil(nameTableFK2, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 11 },
          { key: "activo", value: true },
        ],
      }),
      EscogerInternoUtil(nameTableFK3, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 12 },
          { key: "activo", value: true },
        ],
      }),
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
        { table: nameTableFK1, key: "id_tipo_mercado" },
        { table: nameTableFK2, key: "id_grupo" },
        { table: nameTableFK3, key: "id_tipo_renta" },
      ]
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

//FUNCION PARA OBTENER TODOS LOS TIPO INSTRUMENTO DE SEGURIDAD
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

//FUNCION PARA OBTENER UN TIPO INSTRUMENTO, CON BUSQUEDA
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

//FUNCION PARA OBTENER UN TIPO INSTRUMENTO, CON ID DEL TIPO INSTRUMENTO
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

function SiglaDescripcion(req, res) {
  const query = EscogerInternoUtil(nameTable, {
    select: ["*", "sigla ||'-'|| descripcion AS sigla_descripcion"],
    where: [
      {
        key: "id_tipo_renta",
        valuesWhereIn: [136],
        whereIn: true,
      },
      {
        key: "activo",
        value: true,
      },
    ],
    orderby: {
      field: "sigla ASC",
    },
  });
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

function TipoInstrumentoDetalle(req, res) {
  try {
    const body = req.body;
    let whereAux = [
      {
        key: "es_seriado",
        value: true,
      },
      {
        key: "id_tipo_renta",
        valuesWhereIn: [135, 136],
        whereIn: true,
      },
      {
        key: "activo",
        value: true,
      },
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
      select: [
        "id_tipo_instrumento",
        "sigla",
        "descripcion",
        "id_grupo",
        "es_seriado",
        "id_tipo_renta",
        "id_tipo_mercado",
        "activo",
      ],
      where: whereAux,
      orderby: {
        field: "sigla",
      },
    });

    pool
      .query(query)
      .then((result) => {
        if (result.rowCount > 0) {
          respResultadoCorrectoObjeto200(res, result.rows);
        } else {
          respResultadoIncorrectoObjeto200(res, result.rows);
        }
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

//FUNCION PARA INSERTAR UN TIPO INSTRUMENTO
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

//FUNCION PARA ACTUALIZAR UN TIPO INSTRUMENTO
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

//FUNCION PARA DESHABILITAR UN TIPO INSTRUMENTO
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
  SiglaDescripcion,
  TipoInstrumentoDetalle,
  ListarCompleto,
};
