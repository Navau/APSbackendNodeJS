const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_seg_usuario";

async function InstitucionConIDUsuario(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "InstitucionConIDUsuario_Usuario",
    // action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

//LISTAR UN USUARIO
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

//BUSCAR UN USUARIO
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

//ESCOGER UN USUARIO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

//INSERTAR UN USUARIO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

//ACTUALIZAR UN USUARIO
async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
}

//TO DO: CREAR PERMISO, CREAR LA ACCION DESBLOQUEAR
async function Desbloquear(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "Desbloquear_Usuario",
    // action: "Desbloquear",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  InstitucionConIDUsuario,
  Desbloquear,
};
