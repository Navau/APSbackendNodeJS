const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  BuscarDiferenteCRUD,
  ListarCompletoCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_emisor";
const nameTableFK1 = "APS_param_pais";
const nameTableFK2 = "APS_param_clasificador_comun";
const nameTableFK3 = "APS_param_clasificador_comun";
const nameTableFK4 = "APS_param_sector_economico";

// OBTENER TODOS LOS EMISOR DE PARAMETRO
async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"], main: true },
    { table: nameTableFK1, select: ["*"] },
    {
      table: nameTableFK2,
      select: ["*"],
      where: [
        {
          key: "id_clasificador_comun_grupo",
          value: 4,
        },
        { key: "activo", value: true },
      ],
    },
    {
      table: nameTableFK3,
      select: ["*"],
      where: [
        {
          key: "id_clasificador_comun_grupo",
          valuesWhereIn: [7, 8],
          whereIn: true,
        },
        { key: "activo", value: true },
      ],
    },
    { table: nameTableFK4, select: ["*"] },
  ];
  const tableOptions = [
    { table: nameTableFK2, key: "id_calificacion" },
    { table: nameTableFK3, key: "id_calificadora" },
  ];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

// OBTENER TODOS LOS EMISOR DE PARAMETRO
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN EMISOR, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN EMISOR, CON BUSQUEDA DIFERENTE
async function BuscarDiferente(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarDiferenteCRUD(params);
}

// OBTENER UN EMISOR, CON ID DEL EMISOR
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN EMISOR
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN EMISOR
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
  BuscarDiferente,
  ListarCompleto,
};
