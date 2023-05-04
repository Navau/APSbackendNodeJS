const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
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

// OBTENER TODOS LOS TIPO INSTRUMENTO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN TIPO INSTRUMENTO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN TIPO INSTRUMENTO, CON ID DEL TIPO INSTRUMENTO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

async function SiglaDescripcion(req, res) {
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
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

async function TipoInstrumentoDetalle(req, res) {
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
      select: ["*"],
      where: whereAux,
      orderby: {
        field: "sigla",
      },
    });

    await pool
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

// INSERTAR UN TIPO INSTRUMENTO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN TIPO INSTRUMENTO
async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  SiglaDescripcion,
  TipoInstrumentoDetalle,
  ListarCompleto,
};
