const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  EjecutarVariosQuerys,
  AsignarInformacionCompletaPorUnaClave,
  EscogerInternoUtil,
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

const nameTable = "APS_param_sector_economico";
const nameTableFK1 = "APS_param_clasificador_comun";

async function ListarCompleto(req, res) {
  try {
    const querys = [
      ListarUtil(nameTable),
      EscogerInternoUtil(nameTableFK1, {
        select: ["*"],
        where: [
          { key: "id_clasificador_comun_grupo", value: 27 },
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
      [{ table: nameTableFK1, key: "id_sector_economico_grupo" }]
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}
// OBTENER TODOS LOS SECTOR ECONOMICO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN SECTOR ECONOMICO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN SECTOR ECONOMICO, CON ID DEL SECTOR ECONOMICO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN SECTOR ECONOMICO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN SECTOR ECONOMICO
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
};
