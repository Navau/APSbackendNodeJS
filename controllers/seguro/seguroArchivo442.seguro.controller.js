const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_seguro_archivo_442";

async function Emisor(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "Emisor_SeguroArchivo442",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function InsertarOtrosActivos(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "InsertarOtrosActivos_SeguroArchivo442",
    action: "Insertar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

async function Actualizar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Emisor,
  InsertarOtrosActivos,
};
