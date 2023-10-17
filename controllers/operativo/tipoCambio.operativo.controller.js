const { map } = require("lodash");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  ListarCompletoCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
  EjecutarVariosQuerys,
  AsignarInformacionCompletaPorUnaClave,
} = require("../../utils/consulta.utils");

const {
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respResultadoVacio404END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_oper_tipo_cambio";
const nameTableFK1 = "APS_param_moneda";

async function ListarCompleto(req, res) {
  const queryOptions = [
    { table: nameTable, select: ["*"], main: true },
    { table: nameTableFK1, select: ["*"] },
  ];
  const tableOptions = [];
  const params = { req, res, nameTable, queryOptions, tableOptions };
  await ListarCompletoCRUD(params);
}

async function UltimoRegistro(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "UltimoRegistro_TipoCambio",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// OBTENER TODOS LOS TIPO CAMBIO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN TIPO CAMBIO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN TIPO CAMBIO, CON ID DEL TIPO CAMBIO
async function Escoger(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN TIPO CAMBIO
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN TIPO CAMBIO
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
  UltimoRegistro,
  ListarCompleto,
};
