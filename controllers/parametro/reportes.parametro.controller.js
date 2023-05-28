const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_Reportes";
const newID = "id_reporte";

async function TipoReporte(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "TipoReporte_Reportes",
    // action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// OBTENER TODOS LOS REPORTES DE PARAMETRO
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN REPORTES, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN REPORTES, CON ID DEL REPORTES
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN REPORTES
async function Insertar(req, res) {
  const params = { req, res, nameTable, newID };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN REPORTES
async function Actualizar(req, res) {
  const params = { req, res, nameTable, newID };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  TipoReporte,
};
