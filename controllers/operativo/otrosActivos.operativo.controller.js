const { size, isUndefined, split } = require("lodash");
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
  EjecutarVariosQuerys,
  EscogerInternoUtil,
  AsignarInformacionCompletaPorUnaClave,
} = require("../../utils/consulta.utils");

const {
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respUsuarioNoAutorizado200END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_oper_otros_activos";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_param_tipo_instrumento";
const nameTableFK3 = "APS_param_moneda";
const nameTableFK4 = "APS_param_clasificador_comun";
const nameTableFK5 = "APS_seg_usuario";

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
          { key: "id_clasificador_comun_grupo", value: 35 },
          { key: "activo", value: true },
        ],
      }), //CALIFICACION
      EscogerInternoUtil(nameTableFK4, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 8 },
          { key: "activo", value: true },
        ],
      }), //CALIFICADORA
      ListarUtil(nameTableFK5), //USUARIO
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

async function EmisorTGN(req, res) {
  const query = EscogerInternoUtil(nameTableFK1, {
    select: ["*"],
    where: [
      { key: "id_pais", value: 8, operator: "<>" },
      { key: "codigo_rmv", value: "TGN", operatorSQL: "OR" },
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

// OBTENER TODOS LOS OTROS ACTIVOS DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN OTROS ACTIVOS, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN OTROS ACTIVOS, CON ID DEL OTROS ACTIVOS
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN OTROS ACTIVOS
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN OTROS ACTIVOS
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
  ListarCompleto,
  EmisorTGN,
};
