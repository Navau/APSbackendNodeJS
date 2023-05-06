const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  BuscarDiferenteCRUD,
} = require("../../utils/crud.utils");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  BuscarDiferenteUtil,
  EscogerInternoUtil,
  EjecutarVariosQuerys,
  AsignarInformacionCompletaPorUnaClave,
} = require("../../utils/consulta.utils");

const {
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_emisor";
const nameTableFK1 = "APS_param_pais";
const nameTableFK2 = "APS_param_clasificador_comun";
const nameTableFK3 = "APS_param_clasificador_comun";
const nameTableFK4 = "APS_param_sector_economico";

// OBTENER TODOS LOS EMISOR DE SEGURIDAD
async function ListarCompleto(req, res) {
  // TO DO OPTIMIZAR LOS QUERYS DE LAS TABLAS APS_param_clasificador_comun, haciendo que la asignacion de IDs sea automatico y asi realizar solo 1 peticion
  try {
    const querys = [
      ListarUtil(nameTable),
      ListarUtil(nameTableFK1),
      EscogerInternoUtil(nameTableFK2, {
        select: ["*"],
        where: [
          {
            key: "id_clasificador_comun_grupo",
            value: 4,
          },
          { key: "activo", value: true },
        ],
      }),
      EscogerInternoUtil(nameTableFK3, {
        select: ["*"],
        where: [
          {
            key: "id_clasificador_comun_grupo",
            value: 7,
          },
          { key: "activo", value: true },
        ],
      }),
      ListarUtil(nameTableFK4),
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
        { table: nameTableFK2, key: "id_calificacion" },
        { table: nameTableFK3, key: "id_calificadora" },
      ]
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

// OBTENER TODOS LOS EMISOR DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN EMISOR, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN EMISOR, CON BUSQUEDA DIFERENTE
async function BuscarDiferente(req, res) {
  const params = { req, res, nameTable };
  await BuscarDiferenteCRUD(params);
}

// OBTENER UN EMISOR, CON ID DEL EMISOR
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN EMISOR
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN EMISOR
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
  BuscarDiferente,
  ListarCompleto,
};
