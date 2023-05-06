const { split, isUndefined } = require("lodash");
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
  AsignarInformacionCompletaPorUnaClave,
  EjecutarVariosQuerys,
} = require("../../utils/consulta.utils");

const {
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

// OBTENER TODOS LOS RENTA FIJA DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN RENTA FIJA, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN RENTA FIJA, CON ID DEL RENTA FIJA
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN RENTA FIJA
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN RENTA FIJA
async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
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

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  ListarCompleto,
  ActualizarPlazoDias,
};
