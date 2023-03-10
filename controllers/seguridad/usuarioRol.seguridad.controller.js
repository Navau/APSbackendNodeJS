const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_seg_usuario_rol";
const nameView = "APS_seg_view_roles_usuario";

async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

async function ListarRol(req, res) {
  const params = { req, res, nameTable, nameView };
  await ListarCRUD(params);
}

async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  ListarRol,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
};
