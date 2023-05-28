const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_aud_carga_archivos_custodio";

async function ValorMaximo(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ValorMaximo_CargaArchivoCustodio",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function UltimaCarga(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "UltimaCarga_CargaArchivoCustodio",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function Reporte(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "Reporte_CargaArchivoCustodio",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ReporteExito(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ReporteExito_CargaArchivoCustodio",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
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
  Reporte,
  ReporteExito,
};
