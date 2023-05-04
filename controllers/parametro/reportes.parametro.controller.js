const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  EjecutarFuncionSQL,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respErrorServidor500END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_param_Reportes";
const newID = "id_reporte";

async function TipoReporte(req, res) {
  const { id_rol } = req.body;
  const idRolFinal = id_rol ? id_rol : req.user.id_rol;
  const params = {
    body: {
      idRolFinal,
    },
  };
  const query = EjecutarFuncionSQL("aps_reportes", params);

  await pool
    .query(query)
    .then((result) => {
      if (result.rowCount > 0) {
        respResultadoCorrectoObjeto200(res, result.rows);
      } else {
        respResultadoIncorrectoObjeto200(res, null, result.rows);
      }
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

// OBTENER TODOS LOS REPORTES DE PARAMETRO
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN REPORTES, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN REPORTES, CON ID DEL REPORTES
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN REPORTES
async function Insertar(req, res) {
  const params = { req, res, nameTable, newID };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN REPORTES
async function Actualizar(req, res) {
  const params = { req, res, nameTable, newID };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  TipoReporte,
};
