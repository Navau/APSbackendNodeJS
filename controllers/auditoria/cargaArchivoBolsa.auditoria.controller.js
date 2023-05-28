const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_aud_carga_archivos_bolsa";

//Obtiene la ultima fecha de operacion siempre que cargado = true
async function ValorMaximo(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ValorMaximo_CargaArchivoBolsa",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function UltimaCarga(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "UltimaCarga_CargaArchivoBolsa",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function HabilitarReproceso(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "HabilitarReproceso_CargaArchivoBolsa",
    action: "Actualizar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// OBTENER TODOS LOS CARGA ARCHIVO BOLSA DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO BOLSA, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO BOLSA, CON ID DEL CARGA ARCHIVO BOLSA
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

async function ReporteExito(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ReporteExito_CargaArchivoBolsa",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// INSERTAR UN CARGA ARCHIVO BOLSA
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN CARGA ARCHIVO BOLSA
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
  ValorMaximo,
  UltimaCarga,
  ReporteExito,
  HabilitarReproceso,
};
