const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_oper_renta_fija";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_param_tipo_instrumento";
const nameTableFK3 = "APS_param_moneda";
const nameTableFK4 = "APS_param_clasificador_comun";
const nameTableFK5 = "APS_seg_usuario";
const nameTableFK6 = "APS_oper_emision";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"] },
    { table: nameTableFK1, select: ["*"] },
    { table: nameTableFK2, select: ["*"] },
    { table: nameTableFK3, select: ["*"] },
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 16 },
        { key: "activo", value: true },
      ],
    }, // TIPO TASA
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 23 },
        { key: "activo", value: true },
      ],
    }, // TIPO INTERES
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 20 },
        { key: "activo", value: true },
      ],
    }, //PREPAGO
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 21 },
        { key: "activo", value: true },
      ],
    }, //SUBORDINADO
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 19 },
        { key: "activo", value: true },
      ],
    }, //CUSTODIO
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
        { key: "id_clasificador_comun_grupo", value: 6 },
        { key: "activo", value: true },
      ],
    }, //CALIFICACION
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 7 },
        { key: "activo", value: true },
      ],
    }, //CALIFICADORA
    { table: nameTableFK5, select: ["*"] }, //USUARIO
    { table: nameTableFK6, select: ["*"] }, //EMISION
  ];
  const tableOptions = [
    { table: nameTableFK4, key: "id_tipo_tasa" },
    { table: nameTableFK4, key: "id_tipo_interes" },
    { table: nameTableFK4, key: "id_prepago" },
    { table: nameTableFK4, key: "id_subordinado" },
    { table: nameTableFK4, key: "id_custodia" },
    { table: nameTableFK4, key: "id_periodo_vencimiento" },
    { table: nameTableFK4, key: "id_tipo_amortizacion" },
    { table: nameTableFK4, key: "id_calificacion" },
    { table: nameTableFK4, key: "id_calificadora" },
  ];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

// OBTENER TODOS LOS RENTA FIJA DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN RENTA FIJA, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN RENTA FIJA, CON ID DEL RENTA FIJA
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN RENTA FIJA
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN RENTA FIJA
async function Actualizar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ActualizarCRUD(params);
}

async function ActualizarPlazoDias(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ActualizarPlazoDias_RentaFija",
    action: "Actualizar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  ListarCompleto,
  ActualizarPlazoDias,
};
