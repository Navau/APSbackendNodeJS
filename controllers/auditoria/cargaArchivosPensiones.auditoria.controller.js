const { map, forEach } = require("lodash");
const pool = require("../../database");
const moment = require("moment");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
  EscogerInternoUtil,
  EjecutarFuncionSQL,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoVacioObject200,
  respResultadoCorrectoObjeto200,
  respErrorServidor500END,
  respResultadoVacio404END,
  respResultadoIncorrectoObjeto200,
} = require("../../utils/respuesta.utils");
const dayjs = require("dayjs");

const nameTable = "APS_aud_carga_archivos_pensiones";

async function ValorMaximo(req, res) {
  const { max, periodicidad } = req.body;
  const { id_rol, id_usuario } = req.user;
  const institucion = async () => {
    let queryInstitucion = EscogerInternoUtil("APS_seg_usuario", {
      select: [`"APS_seg_institucion".codigo`],
      innerjoin: [
        {
          table: `APS_seg_institucion`,
          on: [
            {
              table: `APS_seg_institucion`,
              key: "id_institucion",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_institucion",
            },
          ],
        },
        {
          table: `APS_seg_usuario_rol`,
          on: [
            {
              table: `APS_seg_usuario_rol`,
              key: "id_usuario",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_usuario",
            },
          ],
        },
      ],
      where: [
        { key: `"APS_seg_usuario".id_usuario`, value: id_usuario },
        { key: `"APS_seg_usuario_rol".id_rol`, value: id_rol },
      ],
    });

    const resultFinal = await pool
      .query(queryInstitucion)
      .then((result) => {
        if (result.rows.length >= 1) {
          return { ok: true, result: result?.rows?.[0] };
        } else {
          return { ok: false, result: result?.rows?.[0] };
        }
      })
      .catch((err) => {
        return { ok: false, err };
      });
    return resultFinal;
  };

  if (!periodicidad) {
    respDatosNoRecibidos400(res, "No se envio la periodicidad.");
  }

  const cod_institucion = await institucion();

  if (cod_institucion?.err) {
    respErrorServidor500END(res, err);
    return;
  }
  if (cod_institucion.ok === false) {
    respResultadoVacio404END(
      res,
      "No existe ninguna institución para este usuario."
    );
    return;
  }

  let fieldMax = max ? max : "fecha_operacion";
  let whereFinal = [
    {
      key: "id_rol",
      value: id_rol,
    },
    {
      key: "id_periodo",
      value: periodicidad,
    },
    {
      key: "cod_institucion",
      value: cod_institucion.result.codigo,
    },
    {
      key: "cargado",
      value: true,
    },
  ];
  const params = {
    fieldMax,
    where: whereFinal,
  };
  let query = ValorMaximoDeCampoUtil(nameTable, params);
  await pool
    .query(query)
    .then((result) => {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        if (result.rows[0].max === null) {
          result = {
            ...result,
            rows: [
              {
                max: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
              },
            ],
          };
        }
        respResultadoCorrecto200(res, result);
      }
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500(res, err);
    });
}

async function UltimaCarga(req, res) {
  const { cargado } = req.body;
  const { id_rol, id_usuario } = req.user;
  const institucion = async () => {
    let queryInstitucion = EscogerInternoUtil("APS_seg_usuario", {
      select: [`"APS_seg_institucion".codigo`],
      innerjoin: [
        {
          table: `APS_seg_institucion`,
          on: [
            {
              table: `APS_seg_institucion`,
              key: "id_institucion",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_institucion",
            },
          ],
        },
        {
          table: `APS_seg_usuario_rol`,
          on: [
            {
              table: `APS_seg_usuario_rol`,
              key: "id_usuario",
            },
            {
              table: `APS_seg_usuario`,
              key: "id_usuario",
            },
          ],
        },
      ],
      where: [
        { key: `"APS_seg_usuario".id_usuario`, value: id_usuario },
        { key: `"APS_seg_usuario_rol".id_rol`, value: id_rol },
      ],
    });

    const resultFinal = await pool
      .query(queryInstitucion)
      .then((result) => {
        if (result.rows.length >= 1) {
          return { ok: true, result: result?.rows?.[0] };
        } else {
          return { ok: false, result: result?.rows?.[0] };
        }
      })
      .catch((err) => {
        return { ok: false, err };
      });
    return resultFinal;
  };

  const cod_institucion = await institucion();

  if (cod_institucion?.err) {
    respErrorServidor500END(res, err);
    return;
  }
  if (cod_institucion.ok === false) {
    respResultadoVacio404END(
      res,
      "No existe ninguna institución para este usuario."
    );
    return;
  }
  const params = {
    where: [
      {
        key: "id_rol",
        value: id_rol,
      },
      {
        key: "cod_institucion",
        value: cod_institucion.result.codigo,
      },
      {
        key: "cargado",
        value: cargado === true || cargado === false ? cargado : true,
      },
    ],
    orderby: {
      field: "nro_carga",
    },
  };
  let query = ObtenerUltimoRegistro(nameTable, params);
  await pool
    .query(query)
    .then((result) => {
      respResultadoVacioObject200(res, result.rows);
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500(res, err);
    });
}

async function UltimaCarga2(req, res) {
  const { fecha_operacion, periodicidad } = req.body;
  const { id_rol, id_usuario } = req.user;

  let query = `
  SELECT CASE 
  WHEN maxid > 0 
      THEN nro_carga 
      ELSE 0 
  END AS nroCarga, 
  CASE 
  WHEN maxid > 0 
      THEN null 
      ELSE false 
  END AS Cargado 
  FROM ( 
    SELECT coalesce(max(id_carga_archivos), 0) AS maxid 
    FROM public."APS_aud_carga_archivos_pensiones" AS pen 
    INNER JOIN "APS_seg_institucion" AS int 
    ON int.codigo = pen.cod_institucion 
    INNER JOIN "APS_seg_usuario" AS usuario 
    ON usuario.id_institucion = int.id_institucion 
    WHERE usuario.id_usuario=${id_usuario} 
    AND pen.id_periodo=${periodicidad} 
    AND pen.fecha_operacion = '${fecha_operacion}') AS max_id 
    LEFT JOIN "APS_aud_carga_archivos_pensiones" AS datos 
    ON max_id.maxid = datos.id_carga_archivos
  `;

  console.log("TEST ULTIMA CARGA", query);
  await pool
    .query(query)
    .then((result) => {
      respResultadoVacioObject200(res, result.rows[0]);
    })
    .catch((err) => {
      console.log(err);
      respErrorServidor500(res, err);
    });
}

//VALORACION Y VALIDACION
async function ReporteEnvio(req, res) {
  const { fecha, id_rol, cargado } = req.body;
  const idRolFinal = id_rol ? id_rol : req.user.id_rol;
  const cargadoFinal = cargado === true || cargado === false ? cargado : null;

  if (Object.entries(req.body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: {
        fecha,
        idRolFinal,
      },
      where: cargadoFinal !== null && [
        {
          key: "cargado",
          value: cargadoFinal,
        },
      ],
    };
    const query = EjecutarFuncionSQL("aps_reporte_control_envio", params);

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

//FUNCION PARA OBTENER TODOS LOS CARGA ARCHIVO PENSIONES SEGURO DE SEGURIDAD
function Listar(req, res) {
  let query = ListarUtil(nameTable);
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
          respResultadoCorrecto200(
            res,
            result,
            "Información guardada correctamente"
          );
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
  ValorMaximo,
  UltimaCarga,
  UltimaCarga2,
  ReporteEnvio,
};