const {
  RealizarOperacionAvanzadaCRUD,
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_archivos_pensiones_seguros";
const nameView = "APS_view_archivos_pensiones_seguros";

async function SeleccionarArchivos(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "SeleccionarArchivos_ArchivosPensionesSeguros",
    // action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function SeleccionarArchivosBolsa(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "SeleccionarArchivosBolsa_ArchivosPensionesSeguros",
    // action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function SeleccionarArchivosValidar(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "SeleccionarArchivosValidar_ArchivosPensionesSeguros",
    // action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function SeleccionarArchivosCustodio(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "SeleccionarArchivosCustodio_ArchivosPensionesSeguros",
    // action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// LISTAR TODO DE PARAMETRO DE ARCHIVOS PENSIONES Y SEGUROS
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// BUSCAR DE PARAMETRO DE ARCHIVOS PENSIONES Y SEGUROS
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// ESCOGER DE PARAMETRO DE ARCHIVOS PENSIONES Y SEGUROS, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR DE PARAMETRO DE ARCHIVOS PENSIONES Y SEGUROS
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR DE PARAMETRO DE ARCHIVOS PENSIONES Y SEGUROS
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
  SeleccionarArchivos,
  SeleccionarArchivosBolsa,
  SeleccionarArchivosCustodio,
  SeleccionarArchivosValidar,
};
