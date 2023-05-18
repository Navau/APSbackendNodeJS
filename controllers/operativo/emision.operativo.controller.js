const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  BuscarDiferenteCRUD,
  ListarCompletoCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_oper_emision";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_param_moneda";
const nameTableFK3 = "APS_param_tipo_instrumento";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"] },
    { table: nameTableFK1, select: ["*"] },
    { table: nameTableFK2, select: ["*"] },
    { table: nameTableFK3, select: ["*"] },
  ];
  const tableOptions = [];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

// OBTENER TODOS LOS EMISION
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN EMISION, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN EMISION, CON BUSQUEDA DIFERENTE
async function BuscarDiferente(req, res) {
  const params = { req, res, nameTable };
  await BuscarDiferenteCRUD(params);
}

// OBTENER UN EMISION PATRIMONIO, CON ID DEL EMISION
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

async function EscogerPorTipoInstrumentoDetalle(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "EscogerPorTipoInstrumentoDetalle_Emision",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// INSERTAR UN EMISION PATRIMONIO
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

// ACTUALIZAR UN EMISION PATRIMONIO
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
  EscogerPorTipoInstrumentoDetalle,
};
