const pool = require("../../database");
const {
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
  EscogerInternoUtil,
} = require("../../utils/consulta.utils");
const {
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respDatosNoRecibidos400,
} = require("../../utils/respuesta.utils");
const moment = require("moment");

async function obtenerFechaOperacion(req, res) {
  try {
    function padTo2Digits(num) {
      return num.toString().padStart(2, "0");
    }

    function formatDate(date) {
      return (
        [
          date.getFullYear(),
          padTo2Digits(date.getMonth() + 1),
          padTo2Digits(date.getDate()),
        ].join("-") +
        " " +
        [
          padTo2Digits(date.getHours()),
          padTo2Digits(date.getMinutes()),
          padTo2Digits(date.getSeconds()),
        ].join(":") +
        "." +
        [padTo2Digits(date.getMilliseconds())].join()
      );
    }

    const { tipo_periodo, tipo_archivo } = req.body; //tipo_archivo = PENSIONES O BOLSA
    const { id_rol, id_usuario } = req.user;
    const tableQuery =
      tipo_archivo === "PENSIONES"
        ? "APS_aud_carga_archivos_pensiones_seguros"
        : tipo_archivo === "BOLSA"
        ? "APS_aud_carga_archivos_bolsa"
        : null;
    let cod_institucion = null;
    if (tipo_archivo !== "BOLSA") {
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

      cod_institucion = await institucion();

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
    }

    if (tableQuery === null) {
      respErrorServidor500END(res, {
        message: "No se especificó el tipo_archivo.",
        value: FECHA_OPERACION[tipo_periodo],
      });
      return;
    }
    if (!tipo_periodo) {
      respDatosNoRecibidos400(res, "No se especifico el tipo periodo.");
      return;
    }

    let whereMax = [];

    if (tipo_archivo === "BOLSA") {
      whereMax = [
        {
          key: "id_rol",
          value: id_rol,
        },
        {
          key: "cargado",
          value: true,
        },
      ];
    } else if (tipo_archivo === "PENSIONES") {
      whereMax = [
        {
          key: "id_rol",
          value: id_rol,
        },
        {
          key: "cod_institucion",
          value: cod_institucion.result.codigo,
        },
        {
          key: "id_periodo",
          value: tipo_periodo === "D" ? 154 : tipo_periodo === "M" ? 155 : null,
        },
        {
          key: "cargado",
          value: true,
        },
      ];
    }

    const queryMax = ValorMaximoDeCampoUtil(tableQuery, {
      fieldMax: "fecha_operacion",
      where: whereMax,
    });
    console.log(queryMax);

    const maxFechaOperacion = await pool
      .query(queryMax)
      .then((result) => {
        if (!result.rowCount || result.rowCount < 1) {
          return formatDate(new Date());
        } else if (result?.rows[0]?.max === null) {
          return formatDate(new Date());
        } else {
          return result.rows[0].max;
        }
      })
      .catch((err) => {
        console.log(err);
        respErrorServidor500END(res, err);
        return null;
      });

    const addValues = (date, days) => {
      date.setDate(date.getDate() + days);
      return date;
    };
    const addMonths = (date, months) => {
      date.setMonth(date.getMonth() + months);
      return date;
    };

    const lastDate = new Date(maxFechaOperacion);
    console.log("lastDate", lastDate);

    const fechaOperacionMensual = () => {
      const year = lastDate.getFullYear(); //2022
      const month = lastDate.getMonth(); //06
      const day = lastDate.getDay(); //30
      const firstDayMonth = new Date(year, month, 1); // 2022-06-01
      const lastDayMonth = addMonths(firstDayMonth, 2); // 2022-08-01
      const fechaOperacion = addValues(lastDayMonth, -1); // 2022-07-31

      return fechaOperacion;
    };

    const fechaOperacionDiaria = () => {
      if (tipo_archivo === "PENSIONES") {
        const fechaOperacion = addValues(lastDate, 1); //VIERNES + 1 = SABADO
        return fechaOperacion;
      } else if (tipo_archivo === "BOLSA") {
        console.log(tipo_archivo);
        const checkDate = addValues(lastDate, 1); //VIERNES + 1 = SABADO
        console.log(checkDate);
        let fechaOperacion = null;
        // const dayLastDate = checkDate.getUTCDay(); //6 = SABADO; 0 = DOMINGO
        // if (dayLastDate === 0) {
        //   //SI ES DOMINGO
        //   fechaOperacion = addValues(lastDate, 1); // ENTONCES SERA LUNES
        // } else if (dayLastDate === 6) {
        //   // SI ES SABADO
        //   fechaOperacion = addValues(lastDate, 2); // ENTONCES SERA LUNES
        // } else {
        //   // SI ES DIA HABIL
        //   fechaOperacion = checkDate; // ENTONCES SERA LUNES
        // }
        fechaOperacion = checkDate; // ENTONCES SERA LUNES
        return fechaOperacion;
      } else {
        return null;
      }
    };

    const FECHA_OPERACION = {
      M: fechaOperacionMensual,
      D: fechaOperacionDiaria,
    };

    const result = FECHA_OPERACION[tipo_periodo]();

    if (isNaN(Date.parse(result))) {
      respErrorServidor500END(res, {
        message: "Hubo un error al obtener la fecha de operación.",
        value: result,
      });
    } else {
      respResultadoCorrectoObjeto200(res, result);
    }
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  obtenerFechaOperacion,
};
