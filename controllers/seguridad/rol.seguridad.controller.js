const pool = require("../../database");
const jwt = require("../../services/jwt.services");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ObtenerRolUtil,
  ObtenerMenuAngUtil,
  FormatearObtenerMenuAngUtil,
  EscogerInternoUtil,
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

const nameTable = "APS_seg_rol";

//FUNCION PARA OBTENER EL ROL CON TOKEN
function ObtenerRol(req, res) {
  const token = req?.headers?.authorization;

  if (!token) {
    respDatosNoRecibidos400(res, "El token no existe.");
  } else {
    const data = jwt.decodedToken(token);
    if (!data.id_usuario) {
      respDatosNoRecibidos400(res, "El token no contiene el ID de usuario.");
    } else {
      let query = ObtenerRolUtil("APS_seg_usuario_rol", data, true);
      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rows || result.rows < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(res, result);
          }
        }
      });
    }
  }
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
      `"APS_seg_usuario".status`,
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

function ObtenerMenuAng(req, res) {
  const token = req?.headers?.authorization;

  if (!token) {
    respDatosNoRecibidos400(res, "El token no existe.");
  } else {
    const data = jwt.decodedToken(token);
    if (!data.id_usuario) {
      respDatosNoRecibidos400(res, "El token no contiene el ID de usuario.");
    } else {
      let querys = ObtenerMenuAngUtil(data);
      pool.query(querys.query, (err, result) => {
        // console.log(result);
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rows || result.rows < 1) {
            respResultadoVacio404(res);
          } else {
            pool.query(querys.querydet, (err, result2) => {
              if (err) {
                respErrorServidor500(res, err);
              } else {
                if (!result2.rows || result2.rows < 1) {
                  respResultadoVacio404(res);
                } else {
                  let data = {
                    result: result.rows,
                    result2: result2.rows,
                  };
                  resultData = FormatearObtenerMenuAngUtil(data);
                  respResultadoCorrectoObjeto200(res, resultData);
                }
              }
            });
          }
        }
      });
    }
  }
}

//FUNCION PARA OBTENER TODOS LOS ROL DE SEGURIDAD
async function Listar(req, res) {
  const query = ListarUtil(nameTable);
  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

//FUNCION PARA OBTENER UN ROL, CON BUSQUEDA
async function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = BuscarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA OBTENER UN ROL, CON ID DEL ROL
async function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = EscogerUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(res, result.rows);
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA INSERTAR UN ROL
async function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body,
    };
    const query = InsertarUtil(nameTable, params);
    await pool
      .query(query)
      .then((result) => {
        respResultadoCorrectoObjeto200(
          res,
          result.rows,
          "Información guardada correctamente"
        );
      })
      .catch((err) => {
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA ACTUALIZAR UN ROL
async function Actualizar(req, res) {
  const body = req.body;

  let query = "";

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = ActualizarUtil(nameTable, params);

      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(
              res,
              result,
              "Información actualizada correctamente"
            );
          }
        }
      });
    }
  }
}

//FUNCION PARA DESHABILITAR UN ROL
async function Deshabilitar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = DeshabilitarUtil(nameTable, params);
      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(res, result);
          }
        }
      });
    }
  }
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Deshabilitar,
  ObtenerRol,
  ObtenerMenuAng,
  InfoUsuario,
};
