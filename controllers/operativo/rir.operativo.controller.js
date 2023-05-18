const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_oper_rir";
const nameTableFK1 = "aps_view_modalidad_seguros";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"] },
    { table: nameTableFK1, select: ["*"] },
  ];
  const tableOptions = [{ table: nameTableFK1, key: "id_tipo_entidad" }];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

// OBTENER TODOS LOS TIPO CAMBIO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN TIPO CAMBIO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN TIPO CAMBIO, CON ID DEL TIPO CAMBIO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN TIPO CAMBIO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN TIPO CAMBIO
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
