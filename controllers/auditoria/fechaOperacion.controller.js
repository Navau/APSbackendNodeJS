const pool = require("../../database");
const {
  ValorMaximoDeCampoUtil,
  ObtenerUltimoRegistro,
} = require("../../utils/consulta.utils");
const {
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
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

    // 👇️ 2021-10-24 16:21:23 (yyyy-mm-dd hh:mm:ss)
    console.log(formatDate(new Date()));

    const { tipo_periodo, tipo_archivo } = req.body; //tipo_archivo = PENSIONES O BOLSA
    const { id_rol, id_usuario } = req.user;
    const tableQuery =
      tipo_archivo === "PENSIONES"
        ? "APS_aud_carga_archivos_pensiones_seguros"
        : tipo_archivo === "BOLSA"
        ? "APS_aud_carga_archivos_bolsa"
        : null;

    if (tableQuery === null) {
      respErrorServidor500END(res, {
        message: "No se especificó el tipo_archivo.",
        value: FECHA_OPERACION[tipo_periodo],
      });
      return;
    }

    const queryMax = ValorMaximoDeCampoUtil(tableQuery, {
      fieldMax: "fecha_operacion",
      where: [
        {
          key: "id_rol",
          value: id_rol,
        },
        {
          key: "id_usuario",
          value: id_usuario,
        },
        {
          key: "id_periodo",
          value: tipo_periodo === "M" ? 155 : tipo_periodo === "D" ? 154 : null,
        },
        {
          key: "cargado",
          value: true,
        },
      ],
    });
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
    const queryUltimoRegistro = ObtenerUltimoRegistro(tableQuery, {
      where: [
        {
          key: "id_usuario",
          value: id_usuario,
        },
        {
          key: "id_rol",
          value: id_rol,
        },
        {
          key: "fecha_operacion",
          value: new Date(maxFechaOperacion).toISOString().split("T")[0],
        },
        {
          key: "cargado",
          value: true,
        },
      ],
      orderby: {
        field: "nro_carga",
      },
    });

    const ultimoRegistro = await pool
      .query(queryUltimoRegistro)
      .then((result) => {
        return result.rows.length >= 1
          ? formatDate(new Date(result.rows?.[0]?.fecha_operacion))
          : formatDate(new Date());
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

    const lastDate = new Date(ultimoRegistro);

    const fechaOperacionMensual = () => {
      const year = lastDate.getFullYear(); //2022
      const month = lastDate.getMonth(); //08
      const day = lastDate.getDay(); //10
      const firstDayMonth = new Date(year, month, 1); // 2022-08-01
      const fechaOperacion = addValues(firstDayMonth, -1); // 2022-07-31

      return fechaOperacion;
    };
    const fechaOperacionDiaria = () => {
      if (tipo_archivo === "PENSIONES") {
        const fechaOperacion = addValues(lastDate, 1); //VIERNES + 1 = SABADO
        return fechaOperacion;
      } else if (tipo_archivo === "BOLSA") {
        const checkDate = addValues(lastDate, 1); //VIERNES + 1 = SABADO
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
      M: fechaOperacionMensual(),
      D: fechaOperacionDiaria(),
    };

    if (isNaN(Date.parse(FECHA_OPERACION[tipo_periodo]))) {
      respErrorServidor500END(res, {
        message: "Hubo un error al obtener la fecha de operación.",
        value: FECHA_OPERACION[tipo_periodo],
      });
    } else {
      respResultadoCorrectoObjeto200(res, FECHA_OPERACION[tipo_periodo]);
    }
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  obtenerFechaOperacion,
};
