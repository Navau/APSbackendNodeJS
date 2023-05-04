const { isUndefined, minBy } = require("lodash");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

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
    const { tipo_periodo, tipo_archivo, reproceso } = req.body; //tipo_archivo = PENSIONES O BOLSA
    let lastDateFinal;
    let tipoArchivoFinal;
    tipoArchivoFinal = tipo_archivo;
    const { id_rol, id_usuario } = req.user;
    console.log("TIPO PERIODO Y TIPO ARCHIVO", {
      tipo_periodo,
      tipo_archivo,
      reproceso,
    });
    const fechaOperacionMensual = () => {
      const year = lastDateFinal.getFullYear(); //2022
      const month = lastDateFinal.getMonth(); //06
      const day = lastDateFinal.getDay(); //30
      const firstDayMonth = new Date(year, month, 1); // 2022-06-01
      const lastDayMonth = addMonths(firstDayMonth, 2); // 2022-08-01
      const fechaOperacion = addValues(lastDayMonth, -1); // 2022-07-31

      return fechaOperacion;
    };

    const fechaOperacionDiaria = () => {
      // console.log("lastDateFinal", lastDateFinal);
      // console.log("tipoArchivoFinal", tipoArchivoFinal);
      if (tipoArchivoFinal === "PENSIONES") {
        const fechaOperacion = addValues(lastDateFinal, 1); //VIERNES + 1 = SABADO
        return fechaOperacion;
      }
      if (tipoArchivoFinal === "SEGUROS") {
        const fechaOperacion = addValues(lastDateFinal, 1); //VIERNES + 1 = SABADO
        return fechaOperacion;
      } else if (tipoArchivoFinal === "BOLSA") {
        // console.log(tipoArchivoFinal);
        const checkDate =
          reproceso === true ? lastDateFinal : addValues(lastDateFinal, 1); //VIERNES + 1 = SABADO
        // console.log(checkDate);
        let fechaOperacion = null;
        fechaOperacion = checkDate;
        return fechaOperacion;
      } else if (tipoArchivoFinal === "CUSTODIO") {
        // console.log(tipoArchivoFinal);
        const checkDate = addValues(lastDateFinal, 1); //VIERNES + 1 = SABADO
        // console.log(checkDate);
        let fechaOperacion = null;
        fechaOperacion = checkDate;
        return fechaOperacion;
      } else {
        return null;
      }
    };

    const FECHA_OPERACION = {
      M: fechaOperacionMensual,
      D: fechaOperacionDiaria,
    };

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
    const tableQuery =
      tipo_archivo === "PENSIONES" || tipo_archivo === "SEGUROS"
        ? "APS_aud_carga_archivos_pensiones_seguros"
        : tipo_archivo === "BOLSA"
        ? "APS_aud_carga_archivos_bolsa"
        : tipo_archivo === "CUSTODIO"
        ? "APS_aud_carga_archivos_custodio"
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
        message: "No se especificó el tipo_archivo",
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
      ];
      if (reproceso === true)
        whereMax.push(
          {
            key: "reproceso",
            value: true,
          },
          {
            key: "reprocesado",
            value: false,
          },
          {
            key: "cargado",
            value: false,
          }
        );
      else
        whereMax.push({
          key: "cargado",
          value: true,
        });
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
    } else if (tipo_archivo === "SEGUROS") {
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
    } else if (tipo_archivo === "CUSTODIO") {
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
    }

    let queryMax;
    let maxFechaOperacion;
    if (tipo_archivo === "BOLSA" && reproceso === true) {
      queryMax = EscogerInternoUtil(tableQuery, {
        select: ["fecha_operacion"],
        where: whereMax,
      });
      maxFechaOperacion = await pool
        .query(queryMax)
        .then((result) => {
          if (result.rowCount > 0) {
            const value = minBy(result.rows, "fecha_operacion");
            if (isUndefined(value))
              throw new Error("No existe una fecha válida");
            return value.fecha_operacion;
          } else return formatDate(new Date());
        })
        .catch((err) => {
          console.log(err);
          respErrorServidor500END(res, err);
          return null;
        });
    } else {
      queryMax = ValorMaximoDeCampoUtil(tableQuery, {
        fieldMax: "fecha_operacion",
        where: whereMax,
      });
      maxFechaOperacion = await pool
        .query(queryMax)
        .then((result) => {
          // console.log("RESULTADO DE MAX FECHA OPERACION", result.rows);
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
    }

    const addValues = (date, days) => {
      date.setDate(date.getDate() + days);
      return date;
    };
    const addMonths = (date, months) => {
      date.setMonth(date.getMonth() + months);
      return date;
    };

    lastDateFinal = new Date(maxFechaOperacion);
    // console.log("lastDate", lastDateFinal);

    const result = FECHA_OPERACION[tipo_periodo]();

    // console.log(result);

    if (isNaN(Date.parse(result))) {
      respErrorServidor500END(res, {
        message: "Hubo un error al obtener la fecha de operación",
        value: result,
      });
    } else {
      respResultadoCorrectoObjeto200(res, result);
    }
  } catch (err) {
    console.log(err);
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  obtenerFechaOperacion,
};
