const { size, isEmpty } = require("lodash");
const pool = require("../../database");
const {
  EjecutarProcedimientoSQL,
  EscogerInternoUtil,
  EjecutarFuncionSQL,
  EjecutarVariosQuerys,
} = require("../../utils/consulta.utils");
const {
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respDatosNoRecibidos400,
  respResultadoIncorrectoObjeto200,
} = require("../../utils/respuesta.utils");

async function Validar(req, res) {
  const { fecha } = req.body;
  const { id_rol } = req.user;
  const params = {
    body: {
      fecha,
    },
  };
  const query =
    id_rol === 7
      ? EjecutarProcedimientoSQL(
          `aps_proc_valoracion_cartera_pensiones`,
          params
        )
      : id_rol === 10
      ? EjecutarProcedimientoSQL(`aps_proc_valoracion_cartera_seguros`, params)
      : null;

  if (query === null) {
    respDatosNoRecibidos400(res, "El rol debe ser 10 o 7");
    return;
  }

  await pool
    .query(query)
    .then((result) => {
      respResultadoCorrectoObjeto200(res, result.rows);
    })
    .catch((err) => {
      respErrorServidor500END(res, err);
    });
}

async function ObtenerInformacion(req, res) {
  try {
    const { fecha, id_rol, cargado, estado } = req.body;
    const idRolFinal = id_rol ? id_rol : req.user.id_rol;
    const cargadoFinal = cargado === true || cargado === false ? cargado : null;
    const estadoFinal = isEmpty(estado) ? null : estado;
    if (!fecha) {
      respDatosNoRecibidos400(res, "La fecha es obligatorio");
    }
    const params = {
      body: {
        fecha,
        idRolFinal,
      },
    };
    params.where = [];
    params.where = [...params.where, { key: "descripcion", value: "Diaria" }];
    if (cargadoFinal !== null) {
      params.where = [...params.where, { key: "cargado", value: cargadoFinal }];
    }
    if (estadoFinal !== null) {
      params.where = [...params.where, { key: "estado", value: estadoFinal }];
    }

    const querys = [
      EjecutarFuncionSQL("aps_reporte_control_envio", params),
      EscogerInternoUtil("APS_oper_tipo_cambio", {
        select: ["*"],
        where: [{ key: `fecha`, value: fecha }],
      }),
      EscogerInternoUtil("APS_oper_archivo_n", {
        select: ["*"],
        where: [{ key: `fecha`, value: fecha }],
      }),
      `SELECT COUNT(*) 
    FROM public."APS_aud_valora_archivos_pensiones_seguros" 
    WHERE fecha_operacion='${fecha}' AND valorado=true AND id_usuario IN (CAST((SELECT DISTINCT cod_institucion
    FROM public."APS_aud_carga_archivos_pensiones_seguros"
    WHERE cargado = true AND fecha_operacion = '${fecha}' AND id_rol = 8) AS INTEGER))
  `,
    ];
    id_rol === 10
      ? querys.push(
          `SELECT COUNT(*) FROM public."APS_view_existe_valores_seguros";`
        )
      : id_rol === 7
      ? querys.push(
          `SELECT COUNT(*) FROM public."APS_view_existe_valores_pensiones`
        )
      : null;

    const results = await EjecutarVariosQuerys(querys);

    if (results.ok === null) {
      throw results.result;
    }
    if (results.ok === false) {
      throw results.errors;
    }

    const messages = [];

    if (size(results.result[1].data) === 0) {
      messages.push("No existe Tipo de Cambio para la Fecha seleccionada");
    }
    if (size(results.result[2].data) === 0) {
      messages.push("No existe información en la Bolsa");
    }
    const counterRegistros = results.result?.[3]?.data?.[0]?.count;
    if (counterRegistros > 0) {
      messages.push("La información ya fue valorada");
    }
    const counterVistas = results.result?.[4]?.data?.[0]?.count;
    if (counterVistas > 0) {
      messages.push(
        "No existen características para los siguientes valores, favor registrar"
      );
    }

    if (size(messages) > 0) {
      respResultadoIncorrectoObjeto200(res, null, [], messages);
      return;
    }
    respResultadoCorrectoObjeto200(res, results.result[0].data);
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  Validar,
  ObtenerInformacion,
};
