const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_oper_otros_activos";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_param_tipo_instrumento";
const nameTableFK3 = "APS_param_moneda";
const nameTableFK4 = "APS_param_clasificador_comun";
const nameTableFK5 = "APS_seg_usuario";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"], main: true },
    { table: nameTableFK1, select: ["*"] },
    { table: nameTableFK2, select: ["*"] },
    { table: nameTableFK3, select: ["*"] },
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 24 },
        { key: "activo", value: true },
      ],
    }, //PERIODO VENCIMIENTO
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 25 },
        { key: "activo", value: true },
      ],
    }, //TIPO AMORTIZACION
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 35 },
        { key: "activo", value: true },
      ],
    }, //CALIFICACION
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 8 },
        { key: "activo", value: true },
      ],
    }, //CALIFICADORA
    { table: nameTableFK5, select: ["*"] }, //USUARIO
  ];
  const tableOptions = [
    { table: nameTableFK4, key: "id_periodo_vencimiento" },
    { table: nameTableFK4, key: "id_tipo_amortizacion" },
    { table: nameTableFK4, key: "id_calificacion" },
    { table: nameTableFK4, key: "id_calificadora" },
  ];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

async function EmisorTGN(req, res) {
  const params = {
    req,
    res,
    nameTable: nameTableFK1,
    methodName: "EmisorTGN_OtrosActivos",
    action: "Listar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// OBTENER TODOS LOS OTROS ACTIVOS DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN OTROS ACTIVOS, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN OTROS ACTIVOS, CON ID DEL OTROS ACTIVOS
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN OTROS ACTIVOS
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN OTROS ACTIVOS
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
  EmisorTGN,
};
