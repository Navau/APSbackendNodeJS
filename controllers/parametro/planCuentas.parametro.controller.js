const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_plan_cuentas";

// OBTENER TODOS LOS PLAN CUENTAS DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

async function ListarSubcuentas(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ListarSubcuentas_PlanCuentas",
    action: "Listar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// OBTENER UN PLAN CUENTAS, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN PLAN CUENTAS, CON ID DEL PLAN CUENTAS
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN PLAN CUENTAS
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN PLAN CUENTAS
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
  ListarSubcuentas,
};
