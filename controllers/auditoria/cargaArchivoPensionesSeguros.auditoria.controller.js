const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
  RealizarOperacionAvanzadaCRUD,
} = require("../../utils/crud.utils");

const nameTable = "APS_aud_carga_archivos_pensiones_seguros";

async function ValorMaximo(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ValorMaximo_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function UltimaCarga(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "UltimaCarga_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ReporteEnvio(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ReporteEnvio_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function Modalidades(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "Modalidades_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ReporteControlEnvioPorTipoReporte(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ReporteControlEnvio_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ReporteControlEnvioPorTipoReporteDescargas(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ReporteControlEnvio_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ReporteReproceso(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ReporteReproceso_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function ReporteExito(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "ReporteExito_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function NombreReporte(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "NombreReporte_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function Entidades(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "Entidades_CargaArchivoPensionesSeguros",
    action: "Escoger",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

async function HabilitarReproceso(req, res) {
  const params = {
    req,
    res,
    nameTable,
    methodName: "HabilitarReproceso_CargaArchivoPensionesSeguros",
    action: "Actualizar",
  };
  await RealizarOperacionAvanzadaCRUD(params);
}

// OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await ListarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await BuscarCRUD(params);
}

// OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
async function Escoger(req, res) {
  const { id_rol } = req.user;
  req.body.id_rol = req.body?.id_rol || id_rol;
  const params = { req, res, nameTable, id: undefined };
  await EscogerCRUD(params);
}

// INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
async function Insertar(req, res) {
  const params = { req, res, nameTable, id: undefined };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
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
  ValorMaximo,
  UltimaCarga,
  ReporteEnvio,
  ReporteControlEnvioPorTipoReporte,
  Entidades,
  HabilitarReproceso,
  Modalidades,
  NombreReporte,
  ReporteControlEnvioPorTipoReporteDescargas,
  ReporteExito,
  ReporteReproceso,
};
