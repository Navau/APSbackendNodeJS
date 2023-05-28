const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_aud_valida_archivos_pensiones_seguros";
const nameTableErrors = "APS_aud_errores_valida_archivos_pensiones_seguros";

//TO DO: Probar lo de validar
async function Validar(req, res) {
  const params = {
    req,
    res,
    nameTable,
    nameTableErrors,
    methodName: "Validar_ValidaArchivoPensionesSeguros",
    action: "Insertar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ReporteInversionesContables(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ReporteInversionesContables_ValidaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function Reporte(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "Reporte_ValidaArchivoPensionesSeguros",
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
  Validar,
  Reporte,
  ReporteInversionesContables,
};
