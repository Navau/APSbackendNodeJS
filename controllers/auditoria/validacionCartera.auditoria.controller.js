const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_aud_valora_archivos_pensiones_seguros";
const nameTableErrors = "APS_aud_errores_valora_archivos_pensiones_seguros";

//TO DO: Cambiar validacionCartera por valoraArchivosPensionesSeguros
async function Validar(req, res) {
  const params = {
    req,
    res,
    nameTable,
    nameTableErrors,
    methodName: "Validar_ValoraArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ObtenerInformacion(req, res) {
  const params = {
    req,
    res,
    nameTable,
    nameTableErrors,
    methodName: "ObtenerInformacion_ValoraArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

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
    nameTableErrors,
    methodName: "ReporteExito_ValorArchivoPensionesSeguros",
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
  Escoger,
  Buscar,
  Actualizar,
  Insertar,
  Validar,
  ObtenerInformacion,
  ReporteExito,
};
