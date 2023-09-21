const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_seg_permiso";

async function CambiarPermisos(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "CambiarPermisos_Permiso",
    action: "Actualizar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

//TO DO: LISTAR PERMISOS, SERA UN ACCION DE ESCOGER O LISTAR?
async function ListarPermisos(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ListarPermisos_Permiso",
    action: "Listar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function CambiarPermisos2(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "CambiarPermisos2_Permiso",
    action: "Actualizar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

//TO DO: LISTAR PERMISOS, SERA UN ACCION DE ESCOGER O LISTAR?
async function ListarPermisos2(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ListarPermisos2_Permiso",
    action: "Listar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

//LISTAR UNA PERMISO
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

//BUSCAR UNA PERMISO
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

//ESCOGER UNA PERMISO
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

//INSERTAR UNA PERMISO
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

//ACTUALIZAR UNA PERMISO
async function Actualizar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  ListarPermisos,
  CambiarPermisos,
  ListarPermisos2,
  CambiarPermisos2,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
};
