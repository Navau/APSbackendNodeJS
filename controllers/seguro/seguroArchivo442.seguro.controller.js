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
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoIncorrectoObjeto200,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_seguro_archivo_442";

// OBTENER TODOS LOS CRITICO DE SEGURIDAD
function Emisor(req, res) {
  const { fecha_informacion } = req.body;
  let query = `SELECT emisor FROM public."${nameTable}" WHERE fecha_informacion='${fecha_informacion}' AND emisor NOT IN (SELECT codigo_rmv FROM public."APS_param_emisor");`;
  pool.query(query, (err, result) => {
    if (err) {
      respErrorServidor500END(res, err);
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoIncorrectoObjeto200(res, null, result.rows, "Mensaje");
      } else {
        respResultadoCorrecto200(res, result.rows);
      }
    }
  });
}

async function InsertarOtrosActivos(req, res) {
  const { fecha, id_usuario } = req.body;
  const idUsuarioFinal = id_usuario ? id_usuario : req.user.id_usuario;

  if (Object.entries(req.body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: {
        fecha,
        idUsuarioFinal,
      },
    };
    const query = EjecutarFuncionSQL("aps_ins_otros_activos", params);

    pool
      .query(query)
      .then((result) => {
        if (result.rowCount > 0) {
          respResultadoCorrectoObjeto200(res, result.rows);
        } else {
          respResultadoIncorrectoObjeto200(res, null, result.rows);
        }
      })
      .catch((err) => {
        console.log(err);
        respErrorServidor500END(res, err);
      });
  }
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
  Emisor,
  InsertarOtrosActivos,
};
