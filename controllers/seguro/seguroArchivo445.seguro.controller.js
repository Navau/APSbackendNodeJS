const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_seguro_archivo_445";

// OBTENER TODOS LOS CRITICO DE SEGURIDAD
async function InsertarOtrosActivosCupon(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "InsertarOtrosActivosCupon_SeguroArchivo445",
    action: "Insertar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN CRITICO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN CRITICO, CON ID DEL CRITICO
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN CRITICO
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN CRITICO
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
  InsertarOtrosActivosCupon,
};
