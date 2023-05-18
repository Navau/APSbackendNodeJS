const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_composicion_serie";
const nameTableFK1 = "APS_param_tipo_instrumento";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"] },
    { table: nameTableFK1, select: ["*"] },
  ];
  const tableOptions = [];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

// OBTENER TODOS LOS COMPOSICION SERIE DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN COMPOSICION SERIE, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN COMPOSICION SERIE, CON ID DEL COMPOSICION SERIE
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN COMPOSICION SERIE
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN COMPOSICION SERIE
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
  ListarCompleto,
};
