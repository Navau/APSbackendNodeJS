const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  EliminarCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_oper_otros_activos_cupon";
const newID = "id_cupon";

// OBTENER TODOS LOS OTROS ACTIVOS CUPON
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN OTROS ACTIVOS CUPON, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN OTROS ACTIVOS CUPON, CON ID DEL OTROS ACTIVOS CUPON
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN OTROS ACTIVOS CUPON
async function Insertar(req, res) {
  const params = { req, res, nameTable, newID };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN OTROS ACTIVOS CUPON
async function Actualizar(req, res) {
  const params = { req, res, nameTable, newID };
  await ActualizarCRUD(params);
}

async function Eliminar(req, res) {
  const params = { req, res, nameTable, newID };
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
