const pool = require("../../database");
const jwt = require("../../services/jwt.services");

const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const {
  ObtenerRolUtil,
  ObtenerMenuAngUtil,
  FormatearObtenerMenuAngUtil,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");

const {
  respDatosNoRecibidos400,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respErrorServidor500END,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_seg_rol";

//TO DO: CAMBIAR TODOS LOS: respErrorServidor500END que esta en el catch y esta en una funcion flecha con llaves, es decir quitar las llaves para que no se ocupen tantas lineas de codigo

// OBTENER EL ROL CON TOKEN
async function ObtenerRol(req, res) {
  const token = req?.headers?.authorization;

  const dataToken = jwt.decodedToken(token);
  if (!dataToken.id_usuario) {
    respDatosNoRecibidos400(res, "El token no contiene el ID de usuario.");
    return;
  }
  const query = ObtenerRolUtil("APS_seg_usuario_rol", dataToken, true);
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

async function InfoUsuario(req, res) {
  const { id_usuario, id_rol } = req.user;
  const query = EscogerInternoUtil(nameTable, {
    select: [
      `"APS_seg_usuario".id_usuario`,
      `"APS_seg_rol".id_rol`,
      `"APS_seg_usuario".usuario`,
      `"APS_seg_rol".rol`,
      `"APS_seg_rol".descripcion`,
      `"APS_seg_usuario".activo`,
    ],
    innerjoin: [
      {
        table: `APS_seg_usuario_rol`,
        on: [
          {
            table: `APS_seg_usuario_rol`,
            key: "id_rol",
          },
          {
            table: `APS_seg_rol`,
            key: "id_rol",
          },
        ],
      },
      {
        table: `APS_seg_usuario`,
        on: [
          {
            table: `APS_seg_usuario`,
            key: "id_usuario",
          },
          {
            table: `APS_seg_usuario_rol`,
            key: "id_usuario",
          },
        ],
      },
    ],
    where: [
      { key: `"APS_seg_usuario".id_usuario`, value: id_usuario },
      { key: `"APS_seg_rol".id_rol`, value: id_rol },
    ],
  });

  await pool
    .query(query)
    .then((result) => {
      if (result.rowCount > 0) {
        respResultadoCorrectoObjeto200(res, result.rows);
      } else {
        respResultadoIncorrectoObjeto200(res, result.rows);
      }
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

async function ObtenerMenuAng(req, res) {
  const token = req?.headers?.authorization;

  const dataToken = jwt.decodedToken(token);
  if (!dataToken.id_usuario) {
    respDatosNoRecibidos400(res, "El token no contiene el ID de usuario.");
    return;
  }
  const querys = ObtenerMenuAngUtil(dataToken);
  await pool
    .query(querys.query)
    .then(async (result1) => {
      await pool
        .query(querys.querydet)
        .then((result2) => {
          if (result2.rowCount > 0) {
            const resultData = FormatearObtenerMenuAngUtil({
              result: result1.rows,
              result2: result2.rows,
            });
            respResultadoCorrectoObjeto200(res, resultData);
          } else respResultadoIncorrectoObjeto200(res, { result1, result2 });
        })
        .catch((err) => {
          respErrorServidor500END(res, err);
        });
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//LISTAR UN ROL
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

//BUSCAR UNA ROL
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

//ESCOGER UNA ROL
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

//INSERTAR UNA ROL
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

//ACTUALIZAR UNA ROL
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
  ObtenerRol,
  InfoUsuario,
  ObtenerMenuAng,
};
