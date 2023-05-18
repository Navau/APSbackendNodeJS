const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_limite";

async function LimitesSeguros(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "LimitesSeguros_Limite",
    // action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// OBTENER TODOS LOS LIMITES DE PARAMETRO
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN LIMITE, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN LIMITE, CON ID DEL LIMITES
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN LIMITE
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN LIMITE
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
  LimitesSeguros,
};
