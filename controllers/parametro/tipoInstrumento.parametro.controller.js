const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_param_tipo_instrumento";
const nameTableFK1 = "APS_param_clasificador_comun";
const nameTableFK2 = "APS_param_clasificador_comun";
const nameTableFK3 = "APS_param_clasificador_comun";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"] },
    {
      table: nameTableFK1,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 10 },
        { key: "activo", value: true },
      ],
    },
    {
      table: nameTableFK2,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 11 },
        { key: "activo", value: true },
      ],
    },
    {
      table: nameTableFK3,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 12 },
        { key: "activo", value: true },
      ],
    },
  ];
  const tableOptions = [
    { table: nameTableFK1, key: "id_tipo_mercado" },
    { table: nameTableFK2, key: "id_grupo" },
    { table: nameTableFK3, key: "id_tipo_renta" },
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

// OBTENER TODOS LOS TIPO INSTRUMENTO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN TIPO INSTRUMENTO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN TIPO INSTRUMENTO, CON ID DEL TIPO INSTRUMENTO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

async function SiglaDescripcion(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "SiglaDescripcion_TipoInstrumento",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function TipoInstrumentoDetalle(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "TipoInstrumentoDetalle_TipoInstrumento",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// INSERTAR UN TIPO INSTRUMENTO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN TIPO INSTRUMENTO
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
  SiglaDescripcion,
  TipoInstrumentoDetalle,
  ListarCompleto,
};
