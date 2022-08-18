const pool = require("../../database");
const moment = require("moment");

const { SelectInnerJoinSimple } = require("../../utils/multiConsulta.utils");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respErrorServidor500END,
  respResultadoVacio404END,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");
const { map } = require("lodash");

const nameTable = "APS_view_archivos_pensiones_seguros";

function SeleccionarArchivos(req, res) {
  const { fecha_operacion, periodicidad } = req.body;
  const id_rol = req.user.id_rol;
  const id_usuario = req.user.id_usuario;

  if (!id_usuario || !id_rol) {
    respDatosNoRecibidos400(
      res,
      "La información que se mando no es suficiente, falta el ID del usuario o el ID Rol."
    );
  } else {
    let query = `SELECT replace(replace(replace(replace(replace(replace(replace(replace(replace(
      "APS_param_archivos_pensiones_seguros".nombre::text, 
      'nnn'::text, "APS_seg_institucion".codigo::text),
      'aaaa'::text, EXTRACT(year FROM TIMESTAMP '${fecha_operacion}')::text),
      'mm'::text, lpad(EXTRACT(month FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
      'dd'::text, lpad(EXTRACT(day FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
      'AA'::text, substring(EXTRACT(year FROM TIMESTAMP '${fecha_operacion}')::text from 3 for 2)),
      'MM'::text, lpad(EXTRACT(month FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
      'DD'::text, lpad(EXTRACT(day FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
      'nntt'::text, "APS_seg_institucion".codigo::text ||
      "APS_param_archivos_pensiones_seguros".codigo::text),
      'nn'::text, "APS_seg_institucion".codigo::text) AS archivo,
      "APS_seg_usuario".id_usuario,
      "APS_param_archivos_pensiones_seguros".archivo_vacio 
      FROM "APS_param_archivos_pensiones_seguros" 
      JOIN "APS_param_clasificador_comun" 
      ON "APS_param_archivos_pensiones_seguros".id_periodicidad = "APS_param_clasificador_comun".id_clasificador_comun 
      JOIN "APS_seg_usuario_rol" 
      ON "APS_seg_usuario_rol".id_rol = "APS_param_archivos_pensiones_seguros".id_rol 
      JOIN "APS_seg_usuario" 
      ON "APS_seg_usuario".id_usuario = "APS_seg_usuario_rol".id_usuario 
      JOIN "APS_seg_institucion" 
      ON "APS_seg_institucion".id_institucion = "APS_seg_usuario".id_institucion 
      WHERE "APS_param_clasificador_comun".id_clasificador_comun = '${periodicidad}' 
      AND "APS_seg_usuario".id_usuario = '${id_usuario}' 
      AND "APS_seg_usuario_rol".id_rol = '${id_rol}' 
      AND "APS_param_archivos_pensiones_seguros".status = true;`;

    console.log(query);

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

async function SeleccionarArchivosBolsa(req, res) {
  const { fecha_operacion } = req.body;
  const id_rol = req.user.id_rol;
  const id_usuario = req.user.id_usuario;

  const tipoDeCambio = async () => {
    const resultFinal = { ok: false, message: "", err: null };
    const queryTipoCambio = EscogerInternoUtil("APS_oper_tipo_cambio", {
      select: ["count(*)"],
      where: [
        { key: `id_moneda`, valuesWhereIn: [3, 4], whereIn: true },
        { key: `fecha`, value: fecha_operacion },
      ],
    });
    await pool
      .query(queryTipoCambio)
      .then((result) => {
        if (parseInt(result.rows[0].count) === 2) {
          resultFinal.ok = true;
          resultFinal.message =
            "Correcto. Existe tipo de cambio para la fecha.";
        } else {
          resultFinal.ok = false;
          resultFinal.message = "No existe tipo de cambio para esa fecha.";
        }
      })
      .catch((err) => {
        resultFinal.ok = null;
        resultFinal.err = err;
      });
    return resultFinal;
  };

  if (!fecha_operacion) {
    respDatosNoRecibidos400(
      res,
      "La información que se mando no es suficiente, falta la fecha de operación."
    );
  } else {
    const _tipoDeCambio = await tipoDeCambio();
    if (_tipoDeCambio.err !== null) {
      respErrorServidor500END(res, _tipoDeCambio.err);
      return;
    } else if (_tipoDeCambio.ok === false) {
      respResultadoCorrectoObjeto200(res, null, _tipoDeCambio.message);
      return;
    }
    // const queryFeriado = EscogerInternoUtil("APS_param_feriado", {
    //   select: ["*"],
    //   where: [
    //     {
    //       key: "fecha",
    //       value: fecha_operacion,
    //     },
    //   ],
    // });
    // const holidays = await pool
    //   .query(queryFeriado)
    //   .then((result) => {
    //     return result.rows;
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     respErrorServidor500END(res, err);
    //     return null;
    //   });

    // if (holidays === null) {
    //   return null;
    // }

    // const fechaOperacion = new Date(fecha_operacion);
    // const day = fechaOperacion.getUTCDay();
    // let periodicidad = [154]; //VALOR POR DEFECTO

    // if (day === 0 || day === 6 || holidays.length >= 1) {
    //   periodicidad = [154]; // DIARIOS
    // } else {
    //   periodicidad = [154, 219]; // DIAS HABILES
    // }
    const queryFeriado = `SELECT 
    CASE 
    WHEN EXTRACT 
    (DOW FROM TIMESTAMP'${fecha_operacion}') IN (6,0) OR 
    (SELECT COUNT(*) FROM public."APS_param_feriado" WHERE fecha = '${fecha_operacion}') > 0 
    THEN 0 
    ELSE 1 
    END`;
    console.log(queryFeriado);
    const workingDay = await pool
      .query(queryFeriado)
      .then((result) => {
        return result.rows;
      })
      .catch((err) => {
        console.log(err);
        respErrorServidor500END(res, err);
        return null;
      });

    let periodicidad = [154]; //VALOR POR DEFECTO

    // console.log(workingDay);

    if (parseInt(workingDay?.[0].case) === 0) {
      periodicidad = [154]; // DIARIOS
    } else {
      periodicidad = [154, 219]; // DIAS HABILES
    }

    let query = `SELECT replace(replace(replace(replace(replace(replace(replace(replace(replace(
  "APS_param_archivos_pensiones_seguros".nombre::text, 
  'nnn'::text, "APS_seg_institucion".codigo::text),
  'aaaa'::text, EXTRACT(year FROM TIMESTAMP '${fecha_operacion}')::text),
  'mm'::text, lpad(EXTRACT(month FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
  'dd'::text, lpad(EXTRACT(day FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
  'AA'::text, substring(EXTRACT(year FROM TIMESTAMP '${fecha_operacion}')::text from 3 for 2)),
  'MM'::text, lpad(EXTRACT(month FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
  'DD'::text, lpad(EXTRACT(day FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
  'nntt'::text, "APS_seg_institucion".codigo::text ||
  "APS_param_archivos_pensiones_seguros".codigo::text),
  'nn'::text, "APS_seg_institucion".codigo::text) AS archivo,
  "APS_seg_usuario".id_usuario,
  "APS_param_archivos_pensiones_seguros".archivo_vacio 
  FROM "APS_param_archivos_pensiones_seguros" 
  JOIN "APS_param_clasificador_comun" 
  ON "APS_param_archivos_pensiones_seguros".id_periodicidad = "APS_param_clasificador_comun".id_clasificador_comun 
  JOIN "APS_seg_usuario_rol" 
  ON "APS_seg_usuario_rol".id_rol = "APS_param_archivos_pensiones_seguros".id_rol 
  JOIN "APS_seg_usuario" 
  ON "APS_seg_usuario".id_usuario = "APS_seg_usuario_rol".id_usuario 
  JOIN "APS_seg_institucion" 
  ON "APS_seg_institucion".id_institucion = "APS_seg_usuario".id_institucion 
  WHERE "APS_param_clasificador_comun".id_clasificador_comun in (${periodicidad.join()}) 
  AND "APS_seg_usuario".id_usuario = '${id_usuario}' 
  AND "APS_seg_usuario_rol".id_rol = '${id_rol}' 
  AND "APS_param_archivos_pensiones_seguros".status = true;`;

    console.log(query);

    pool
      .query(query)
      .then((result) => {
        if (!result.rowCount || result.rowCount < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrectoObjeto200(res, result.rows);
        }
      })
      .catch((err) => {
        console.log(err);
        respErrorServidor500END(res, err);
      });
  }
}

//FUNCION PARA OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE PARAMETRO
function Listar(req, res) {
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

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON BUSQUEDA
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

//FUNCION PARA OBTENER UN CARGA ARCHIVO PENSIONES SEGURO, CON ID DEL CARGA ARCHIVO PENSIONES SEGURO
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

//FUNCION PARA INSERTAR UN CARGA ARCHIVO PENSIONES SEGURO
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

//FUNCION PARA ACTUALIZAR UN CARGA ARCHIVO PENSIONES SEGURO
function Actualizar(req, res) {
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
            respResultadoCorrecto200(res, result);
          }
        }
      });
    }
  }
}

//FUNCION PARA DESHABILITAR UN CARGA ARCHIVO PENSIONES SEGURO
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
  SeleccionarArchivos,
  SeleccionarArchivosBolsa,
};
