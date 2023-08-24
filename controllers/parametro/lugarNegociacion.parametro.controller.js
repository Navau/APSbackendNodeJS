const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_lugar_negociacion";
const nameTableFK1 = "APS_param_clasificador_comun";

async function ListarCompleto(req, res) {
  // TO DO OPTIMIZAR LOS QUERYS DE LAS TABLAS APS_param_clasificador_comun, haciendo que la asignacion de IDs sea automatico y asi realizar solo 1 peticion
  const queryOptions = [
    { table: nameTable, select: ["*"], main: true },
    {
      table: nameTableFK1,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 14 },
        { key: "activo", value: true },
      ],
    },
  ];
  const tableOptions = [
    { table: nameTableFK1, key: "id_tipo_lugar_negociacion" },
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

// OBTENER TODOS LOS LUGAR NEGOCIACION DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN LUGAR NEGOCIACION, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN LUGAR NEGOCIACION, CON ID DEL LUGAR NEGOCIACION
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN LUGAR NEGOCIACION
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN LUGAR NEGOCIACION
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
