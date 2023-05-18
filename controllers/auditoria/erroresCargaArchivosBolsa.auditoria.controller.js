const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_aud_errores_carga_archivos_bolsa";

// OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

async function Reporte(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "Reporte_ErroresCargaArchivoBolsa",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
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
  Reporte,
};
