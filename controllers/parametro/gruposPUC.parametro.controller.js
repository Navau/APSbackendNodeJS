const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_grupos_PUC";
const newID = "id_grupo";

// OBTENER TODOS LOS GRUPOSPUC DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN GRUPOSPUC, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN GRUPOSPUC, CON ID DEL GRUPOSPUC
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN GRUPOSPUC
async function Insertar(req, res) {
  const params = { req, res, nameTable, newID };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN GRUPOSPUC
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
};
