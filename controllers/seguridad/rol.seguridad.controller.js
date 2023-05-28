const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_seg_rol";

// OBTENER EL ROL CON TOKEN
async function ObtenerRol(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ObtenerRol_Rol",
    // action: "Listar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function InfoUsuario(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "InfoUsuario_Rol",
    // action: "Listar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ObtenerMenuAng(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ObtenerMenuAng_Rol",
    // action: "Listar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

//LISTAR UN ROL
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

//BUSCAR UN ROL
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

//ESCOGER UN ROL
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

//INSERTAR UN ROL
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

//ACTUALIZAR UN ROL
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
  ObtenerRol,
  InfoUsuario,
  ObtenerMenuAng,
};
