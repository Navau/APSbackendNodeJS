const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_oper_renta_variable";
const nameTableFK1 = "APS_param_emisor";
const nameTableFK2 = "APS_param_tipo_instrumento";
const nameTableFK3 = "APS_param_moneda";
const nameTableFK4 = "APS_param_clasificador_comun";
const nameTableFK5 = "APS_seg_usuario";
const nameTableFK6 = "APS_oper_emision";

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
        { key: "id_clasificador_comun_grupo", value: 28 },
        { key: "activo", value: true },
      ],
    }, // TIPO ACCION
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 19 },
        { key: "activo", value: true },
      ],
    }, // CUSTODIO
    {
      table: nameTableFK4,
      select: ["*"],
      where: [
        { key: "id_clasificador_comun_grupo", value: 5 },
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
    { table: nameTableFK4, key: "id_tipo_accion" },
    { table: nameTableFK4, key: "id_custodio" },
    { table: nameTableFK4, key: "id_calificacion" },
    { table: nameTableFK4, key: "id_calificadora" },
  ];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

// OBTENER TODOS LOS RENTA VARIABLE  DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN RENTA VARIABLE , CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN RENTA VARIABLE , CON ID DEL RENTA VARIABLE
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN RENTA VARIABLE
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN RENTA VARIABLE
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
