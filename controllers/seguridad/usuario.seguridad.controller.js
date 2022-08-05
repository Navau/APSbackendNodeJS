const pool = require("../../database");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
} = require("../../utils/consulta.utils");

const { SelectInnerJoinSimple } = require("../../utils/multiConsulta.utils");
const {
  VerificarPermisoTablaUsuario,
  DatosCriticos,
  DatosAnteriores,
  Log,
  LogDet,
} = require("../../utils/permiso.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
} = require("../../utils/respuesta.utils");

const nameTable = "APS_seg_usuario";

function InstitucionConIDUsuario(req, res) {
  const { id_usuario } = req.body;

  if (!id_usuario) {
    respDatosNoRecibidos400(
      res,
      "La información que se mando no es suficiente, falta el ID de usuario."
    );
  } else {
    const params = {
      select: [
        `"APS_seg_usuario".usuario`,
        `"APS_seg_institucion".institucion`,
        `"APS_seg_institucion".sigla`,
        `"APS_seg_institucion".codigo`,
        `"APS_param_clasificador_comun".descripcion`,
      ],
      from: [`"APS_seg_usuario"`],
      innerjoin: [
        {
          join: `"APS_seg_institucion"`,
          on: [
            `"APS_seg_usuario".id_institucion = "APS_seg_institucion".id_institucion`,
          ],
        },
        {
          join: `"APS_param_clasificador_comun"`,
          on: [
            `"APS_seg_institucion".id_tipo_entidad = "APS_param_clasificador_comun".id_clasificador_comun`,
          ],
        },
      ],
      where: [{ key: `"APS_seg_usuario".id_usuario`, value: id_usuario }],
    };
    let query = SelectInnerJoinSimple(params);
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

//FUNCION PARA OBTENER TODOS LOS USUARIO DE SEGURIDAD
async function Listar(req, res) {
  const permiso = await VerificarPermisoTablaUsuario({
    req,
    res,
    table: nameTable,
    action: "Listar",
  });
  if (permiso?.err) {
    respErrorServidor500END(res, permiso.err);
    return;
  }
  if (permiso?.ok === false) {
    respResultadoVacio404(res, "Usuario no Autorizado");
    return;
  }
  const params = {
    status: "status",
  };
  let query = ListarUtil(nameTable, params);
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

//FUNCION PARA OBTENER UN USUARIO, CON BUSQUEDA
function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      status: "status",
      body: body,
    };
    let query = BuscarUtil(nameTable, params);
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

//FUNCION PARA OBTENER UN USUARIO, CON ID DEL USUARIO
function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = EscogerUtil(nameTable, params);
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

//FUNCION PARA INSERTAR UN USUARIO
function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = InsertarUtil(nameTable, params);
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

//FUNCION PARA ACTUALIZAR UN USUARIO
async function Actualizar(req, res) {
  const body = req.body;

  let query = "";
  const datosAnteriores = await DatosAnteriores({
    req,
    res,
    table: nameTable,
  });

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

      await pool
        .query(query)
        .then((result) => {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(res, result);
          }
        })
        .catch((err) => {
          respErrorServidor500(res, err);
        });
      const criticos = await DatosCriticos({
        req,
        res,
        table: nameTable,
        action: "Actualizar",
      });
      // console.log("criticos", criticos);
      if (criticos?.ok === true) {
        // console.log("datosAnteriores", datosAnteriores);
        if (datosAnteriores?.ok === true) {
          let idTablaAccion = criticos?.result?.rows[0]?.id_tabla_accion;
          const log = await Log({
            req,
            res,
            id_tabla_accion: idTablaAccion ? idTablaAccion : 12,
          });
          // console.log("log", log);
          if (log?.ok === true) {
            const logDet = await LogDet({
              req,
              res,
              datosAnteriores: datosAnteriores,
              id_log: log.result.rows[0].id_log,
            });
            console.log("logDet", logDet);
          }
        }
      }
    }
  }
}

//FUNCION PARA DESHABILITAR UN USUARIO
function Deshabilitar(req, res) {
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
  InstitucionConIDUsuario,
};
