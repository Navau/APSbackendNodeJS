const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_emisor_vinculado";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_seg_institucion";
const nameTableFK3 = "aps_view_modalidad_seguros";

async function ListarCompleto(req, res) {
  //ASEGURADORA === INSTITUCION
  const queryOptions = [
    { table: nameTable, select: ["*"] },
    { table: nameTableFK1, select: ["*"] },
    { table: nameTableFK2, select: ["*"] },
    { table: nameTableFK3, select: ["*"] },
  ];
  const tableOptions = [
    { table: nameTableFK2, key: "id_aseguradora" },
    { table: nameTableFK3, key: "id_tipo_modalidad" },
  ];
  const extraExecuteQueryOptions = {
    order: 3,
    id: "id_tipo_entidad",
  };
  const params = {
    req,
    res,
    nameTable,
    queryOptions,
    tableOptions,
    extraExecuteQueryOptions,
  };
  await ListarCompletoCRUD(params);
}

// OBTENER TODOS LOS EMISOR VINCULADO DE PARAMETRO
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN EMISOR VINCULADO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN EMISOR VINCULADO, CON ID DEL EMISOR VINCULADO
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN EMISOR VINCULADO
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN EMISOR VINCULADO
async function Actualizar(req, res) {
  const params = { req, res, nameTable, id: undefined };
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
