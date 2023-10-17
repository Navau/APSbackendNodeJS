const {
  ListarCompletoCRUD,
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_seg_institucion";
const nameTableFK1 = "APS_param_clasificador_comun";
const nameTableFK2 = "APS_param_clasificador_comun";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"], main: true },
    {
      table: nameTableFK1,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 26 },
        { key: "activo", value: true },
      ],
    },
    {
      table: nameTableFK2,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 10 },
        { key: "activo", value: true },
      ],
    },
  ];
  const tableOptions = [
    { table: nameTableFK1, key: "id_tipo_entidad" },
    { table: nameTableFK2, key: "id_tipo_mercado" },
  ];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

//LISTAR UNA INSTITUCION
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

//BUSCAR UNA INSTITUCION
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

//ESCOGER UNA INSTITUCION
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

//INSERTAR UNA INSTITUCION
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

//ACTUALIZAR UNA INSTITUCION
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
