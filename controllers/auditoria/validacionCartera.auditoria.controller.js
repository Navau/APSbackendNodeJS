const { size } = require("lodash");
const pool = require("../../database");
const {
  EjecutarProcedimientoSQL,
  EscogerInternoUtil,
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
  const { fecha } = req.body;
  if (!fecha) {
    respDatosNoRecibidos400(res, "La fecha es obligatorio");
  }
  //#region CONSULTAS
  // { key: `id_moneda`, valuesWhereIn: [3], whereIn: true },
  const queryTipoCambio = EscogerInternoUtil("APS_oper_tipo_cambio", {
    select: ["*"],
    where: [{ key: `fecha`, value: fecha }],
  });

  const tipoCambio = await pool
    .query(queryTipoCambio)
    .then((result) => {
      console.log(result.rows);
      if (result.rowCount > 0) {
        return {
          ok: true,
          result: result.rows,
        };
      } else {
        return {
          ok: false,
          result: result.rows,
        };
      }
    })
    .catch((err) => {
      return {
        ok: null,
        err,
      };
    });
  const queryArchivoN = EscogerInternoUtil("APS_oper_archivo_n", {
    select: ["*"],
    where: [{ key: `fecha`, value: fecha }],
  });

  const archivoN = await pool
    .query(queryArchivoN)
    .then((result) => {
      if (result.rowCount > 0) {
        return {
          ok: true,
          result: result.rows,
        };
      } else {
        return {
          ok: false,
          result: result.rows,
        };
      }
    })
    .catch((err) => {
      return {
        ok: null,
        err,
      };
    });
  //#endregion
  if (tipoCambio?.err) {
    respErrorServidor500END(res, tipoCambio.err);
    return;
  }
  if (archivoN?.err) {
    respErrorServidor500END(res, archivoN.err);
    return;
  }

  const messages = [];

  if (tipoCambio.ok === false) {
    messages.push("No existe Tipo de Cambio para la Fecha seleccionada");
  }
  if (archivoN.ok === false) {
    messages.push("No existe información en la Bolsa");
  }

  if (size(messages) > 0) {
    respResultadoIncorrectoObjeto200(res, null, [], messages);
    return;
  }
  respResultadoCorrectoObjeto200(res, archivoN.result);
}

module.exports = {
  Validar,
  ObtenerInformacion,
};
