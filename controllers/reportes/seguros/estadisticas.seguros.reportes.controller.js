const pool = require("../../../database");
const xl = require("excel4node");
const path = require("path");
const { forEach, map, uniqBy, uniq, findIndex } = require("lodash");

const {
  respErrorServidor500END,
  respDescargarArchivos200,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
  respDatosNoRecibidos400,
} = require("../../../utils/respuesta.utils");
const {
  EscogerInternoUtil,
  EjecutarFuncionSQL,
} = require("../../../utils/consulta.utils");
const {
  defaultOptionsReportExcel,
  defaultStyleReportExcel,
  alignTextStyleReportExcel,
  headerStyleReportExcel,
  bodyCommonStyleReportExcel,
  formatDataReportExcel,
  singleFormatDataReportExcel,
  formatDataChartsReportExcel,
  createChart,
} = require("../../../utils/opcionesReportes");
const dayjs = require("dayjs");
require("dayjs/locale/es");

async function estadisticasInversiones(req, res) {
  try {
    const { fecha } = req.body;
    if (!fecha) {
      respDatosNoRecibidos400(res, "La fecha no fue recibida");
      return;
    }
    const nameExcelExport = `Estadisticas_Inversiones ${dayjs(fecha)
      .locale("es")
      .format("MMMM YYYY")
      .toUpperCase()}.xlsx`;

    //#region OBTENIENDO INFORMACION DE aps_fun_seguros_cartera_valorada
    const queryBoletinCuadro1_4 = EjecutarFuncionSQL(
      "aps_fun_seguros_cartera_valorada",
      {
        body: {
          fecha,
        },
      }
    );

    const boletinCuadro1_4 = await pool
      .query(queryBoletinCuadro1_4)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (boletinCuadro1_4.ok === null) {
      respErrorServidor500END(res, boletinCuadro1_4.err);
      return null;
    } else if (boletinCuadro1_4.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, boletinCuadro1_4.result);
      return null;
    }
    //#endregion

    //#region JUNTANDO TODA LA INFORMACION EN segurosDataFinal
    forEach(boletinCuadro1_4.result, (itemI) => {
      !("codeSeguros" in itemI) ? (itemI["codeSeguros"] = "BC1_4") : "";
    });

    const segurosDataFinal = [...boletinCuadro1_4.result];
    // console.log("segurosDataFinal", segurosDataFinal);
    //#endregion

    const wb = new xl.Workbook(defaultOptionsReportExcel()); //INSTANCIA DEL OBJETO
    formatDataChartsReportExcel(fecha, segurosDataFinal, wb);
    const pathExcel = path.join("reports", nameExcelExport);

    wb.write(pathExcel, (err, stats) => {
      // console.log("ERR", err);
      //   console.log("stats", stats);
      // console.log("RIR", segurosRIR);
      if (err) {
        respErrorServidor500END(res, err);
      } else {
        respDescargarArchivos200(res, pathExcel);
      }
    });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  estadisticasInversiones,
};
