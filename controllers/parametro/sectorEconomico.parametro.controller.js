const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_sector_economico";
const nameTableFK1 = "APS_param_clasificador_comun";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"] },
    {
      table: nameTableFK1,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 27 },
        { key: "activo", value: true },
      ],
    },
  ];
  const tableOptions = [
    { table: nameTableFK1, key: "id_sector_economico_grupo" },
  ];
  const params = {
    req,
    res,
    nameTable,
    queryOptions,
    tableOptions,
  };
  await ListarCompletoCRUD(params);
}

// OBTENER TODOS LOS SECTOR ECONOMICO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN SECTOR ECONOMICO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN SECTOR ECONOMICO, CON ID DEL SECTOR ECONOMICO
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN SECTOR ECONOMICO
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN SECTOR ECONOMICO
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
  ListarCompleto,
};
