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
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respUsuarioNoAutorizado200END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_emisor_vinculado";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_seg_institucion";
const nameTableFK3 = "aps_view_modalidad_seguros";

async function ListarCompleto(req, res) {
  try {
    const querys = [
      ListarUtil(nameTable),
      ListarUtil(nameTableFK1),
      ListarUtil(nameTableFK2),
      ListarUtil(nameTableFK3, { activo: null }),
    ];
    //ASEGURADORA === INSTITUCION
    const resultQuerys = await EjecutarVariosQuerys(querys, {
      order: 3,
      id: "id_tipo_entidad",
    });
    if (resultQuerys.ok === null) {
      throw resultQuerys.result;
    }
    if (resultQuerys.ok === false) {
      throw resultQuerys.errors;
    }
    const resultFinal = AsignarInformacionCompletaPorUnaClave(
      resultQuerys.result,
      [
        { table: nameTableFK2, key: "id_aseguradora" },
        { table: nameTableFK3, key: "id_tipo_modalidad" },
      ]
    );

    respResultadoCorrectoObjeto200(res, resultFinal);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

// OBTENER TODOS LOS EMISOR VINCULADO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN EMISOR VINCULADO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN EMISOR VINCULADO, CON ID DEL EMISOR VINCULADO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN EMISOR VINCULADO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN EMISOR VINCULADO
async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  ListarCompleto,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
};
