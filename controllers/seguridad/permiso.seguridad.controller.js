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

//LISTAR UNA PERMISO
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

//BUSCAR UNA PERMISO
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

//ESCOGER UNA PERMISO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

//INSERTAR UNA PERMISO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

//ACTUALIZAR UNA PERMISO
async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  ListarPermisos,
  CambiarPermisos,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
};
