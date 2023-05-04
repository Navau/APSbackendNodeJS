const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  EliminarCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_oper_renta_fija_cupon";
const newID = "id_cupon";

// OBTENER TODOS LOS RENTA FIJA CUPON DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN RENTA FIJA CUPON, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN RENTA FIJA CUPON, CON ID DEL RENTA FIJA CUPON
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN RENTA FIJA CUPON
async function Insertar(req, res) {
  const params = { req, res, nameTable, newID };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN RENTA FIJA CUPON
async function Actualizar(req, res) {
  const params = { req, res, nameTable, newID };
  await ActualizarCRUD(params);
}

// ELIMINAR UN RENTA FIJA CUPON
async function Eliminar(req, res) {
  const params = { req, res, nameTable };
  await EliminarCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Eliminar,
};
