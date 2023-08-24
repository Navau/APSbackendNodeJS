const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_oper_emisor_patrimonio";
const nameTableFK1 = "APS_param_emisor";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"], main: true },
    { table: nameTableFK1, select: ["*"] },
  ];
  const tableOptions = [];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

// OBTENER TODOS LOS EMISOR PATRIMONIO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN EMISOR PATRIMONIO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN EMISOR PATRIMONIO, CON ID DEL EMISOR PATRIMONIO
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN EMISOR PATRIMONIO
async function Insertar(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "Insertar_EmisorPatrimonio",
    action: "Insertar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// ACTUALIZAR UN EMISOR PATRIMONIO
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
