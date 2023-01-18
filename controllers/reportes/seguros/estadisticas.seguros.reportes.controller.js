const pool = require("../../../database");
const xl = require("excel4node");
const path = require("path");
const {
  forEach,
  map,
  uniqBy,
  uniq,
  findIndex,
  groupBy,
  size,
} = require("lodash");

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
  EjecutarVariosQuerys,
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
  StatisticalReport,
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

function tipoReporte(id, fecha) {
  const REPORTES_FUNCIONES = {
    1: {
      fun: "aps_fun_seguros_cartera_valorada",
      name: "Boletín Cuadro 1.4",
      header: {
        nameExcel: "Comparativo Tipo Instrumento.xlsx",
        acronym: "BC1_4",
        title: `INVERSIONES SEGUROS AL ${dayjs(fecha)
          .locale("es")
          .format("DD [DE] MMMM [DE] YYYY")
          .toUpperCase()}`,
        portfolio: "CARTERA VALORADA A PRECIOS DE  MERCADO",
        date: fecha,
        expressedIn: "Bolivianos",
      },
    },
    5: {
      fun: "aps_fun_diversificacion_emisor_tipoaseguradora",
      name: "REP EMISOR TIPO ASEGURADORA",
      header: {
        nameExcel: "Diversificacion Emisor.xlsx",
        acronym: "R.E.T.A",
        title: `DIVERSIFICACIÓN POR EMISOR DE LA CARTERA DE INVERSIONES SEGUROS`,
        subtitle1: "Entidades de Seguros y Reaseguros",
        subtitle2: "Cartera a Valor de Mercado",
        subtitle3: dayjs(fecha)
          .locale("es")
          .format("[AL] DD [DE] MMMM [DE] YYYY")
          .toUpperCase(),
        date: fecha,
      },
    },
    // 9: {
    //   fun: "aps_fun_inversionesrir",
    //   name: "Boletín Cuadro 1.5",
    //   header: {
    //     acronym: "Boletín Cuadro 1.5",
    //     titl1: `INVERSIONES QUE RESPALDAN LOS RECURSOS DE INVERSIÓN REQUERIDOS - SEGUROS DE PERSONAS`,
    //     title2: `INVERSIONES QUE RESPALDAN LOS RECURSOS DE INVERSIÓN REQUERIDOS - SEGUROS DE GENERALES`,
    //     title3: `INVERSIONES QUE RESPALDAN LOS RECURSOS DE INVERSIÓN REQUERIDOS - SEGUROS DE PREPAGO`,
    //     subtitle1: dayjs(fecha)
    //       .locale("es")
    //       .format("[Al] DD [DE] MMMM [DE] YYYY [- Expresado en Bolivianos]")
    //       .toUpperCase(),
    //     date: fecha,
    //   },
    // },
    10: {
      fun: "aps_fun_inversiones_tgn",
      name: "TGN-BCB",
      header: {
        nameExcel: "RIA TGN-BCB.xlsx",
        acronym: "TGN-BCB",
        title: `AUTORIDAD DE FISCALIZACIÓN Y CONTROL DE PENSIONES Y SEGUROS`,
        subtitle1: "DIRECCIÓN DE INVERSIONES",
        subtitle2: dayjs(fecha)
          .locale("es")
          .format(
            "[Detalle de cartera de inversión admisible total mercado por emisor TGN - BCB al] DD [DE] MMMM [DE] YYYY"
          )
          .toUpperCase(),
        date: fecha,
      },
    },
    11: {
      fun: "aps_fun_inversiones_por_emisor",
      name: "REP EMISOR",
      header: {
        nameExcel: "Valores por Emisor.xlsx",
        acronym: "R.E",
        title: `CARTERA DE INVERSIONES DE VALORES POR EMISOR`,
        subtitle1: "Seguros Generales y Seguros de Personas",
        subtitle2: dayjs(fecha)
          .locale("es")
          .format("[INVERSIONES SEGUROS AL] DD [DE] MMMM [DE] YYYY")
          .toUpperCase(),
        date: fecha,
      },
    },
    24: {
      fun: "aps_fun_diversificacion_emisor_tipoaseguradora",
      name: "REP INSTRUMENTO TIPO ASEGURADORA",
      header: {
        nameExcel: "Inversiones Tipo Instrumento.xlsx",
        acronym: "R.I.T.A",
        title: `INVERSIONES POR TIPO INSTRUMENTO`,
        subtitle1: "TOTAL Seguros Personales",
        subtitle2: "Cartera a Valor de Mercado",
        subtitle3: dayjs(fecha)
          .locale("es")
          .format("[AL] DD [DE] MMMM [DE] YYYY")
          .toUpperCase(),
        date: fecha,
      },
    },
  };

  return REPORTES_FUNCIONES[id];
}

async function estadisticasInversiones2(req, res) {
  try {
    const { fecha, id_reporte } = req.body;
    if (!fecha || !id_reporte) {
      respDatosNoRecibidos400(res, "Los datos no fueron recibidos");
      return;
    }
    const infoReporte = tipoReporte(id_reporte, fecha);
    const nameExcelExport = `Estadisticas_Inversiones ${dayjs(fecha)
      .locale("es")
      .format("MMMM YYYY")
      .toUpperCase()}.xlsx`;

    //#region OBTENIENDO INFORMACION DE REPORTE
    const queryReporte = EjecutarFuncionSQL(infoReporte.fun, {
      body: {
        fecha,
      },
    });
    const reporte = await pool
      .query(queryReporte)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (reporte.ok === null) {
      throw reporte.err;
    } else if (reporte.ok === false) {
      respResultadoIncorrectoObjeto200(
        res,
        null,
        reporte.result,
        "No existe información para este reporte"
      );
      return null;
    }
    //#endregion
    //#region JUNTANDO TODA LA INFORMACION EN estadisticosDataFinal
    forEach(reporte.result, (itemI) => {
      !("codeSeguros" in itemI)
        ? (itemI["codeSeguros"] = infoReporte.acronym)
        : "";
    });

    const estadisticosDataFinal = [...reporte.result];
    // console.log("estadisticosDataFinal", estadisticosDataFinal);
    //#endregion

    const wb = new xl.Workbook(defaultOptionsReportExcel()); //INSTANCIA DEL OBJETO
    formatDataChartsReportExcel(
      fecha,
      estadisticosDataFinal,
      infoReporte.header,
      wb
    );
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

async function EstadisticasInversiones3(req, res) {
  try {
    const { fecha, reportes } = req.body;
    if (!fecha || !reportes) {
      respDatosNoRecibidos400(res, "Los datos no fueron recibidos");
      return;
    }

    const infoReportesAuxArray = [];
    const nameAux = `Estadisticas_Inversiones ${dayjs(fecha)
      .locale("es")
      .format("MMMM YYYY")
      .toUpperCase()}.xlsx`;
    const ExcelExport = {
      name: nameAux,
      count: 0,
    };

    const querys = map(reportes, (id_reporte, index) => {
      const infoReporte = tipoReporte(id_reporte, fecha);
      ExcelExport.name = infoReporte.header.nameExcel;
      ExcelExport.count = index;

      infoReportesAuxArray.push(infoReporte);
      return EjecutarFuncionSQL(infoReporte.fun, {
        body: {
          fecha,
        },
      });
    });

    const results = await EjecutarVariosQuerys(querys);
    if (results.ok === null) {
      throw results.result;
    }
    if (results.ok === false) {
      throw results.errors;
    }

    const estadisticosDataFinal = map(results.result, (item, index) => {
      if (size(item.data) > 0) {
        forEach(item.data, (itemData) => {
          !("codeSeguros" in itemData)
            ? (itemData["codeSeguros"] = infoReportesAuxArray[index].name)
            : "";
          !("codeSeguros" in itemData)
            ? (item.data["codeSeguros"] = infoReportesAuxArray[index].name)
            : "";
          !("header" in item.data)
            ? (item.data["header"] = infoReportesAuxArray[index].header)
            : "";
        });
      } else {
        item.data.push({
          codeSeguros: infoReportesAuxArray[index].name,
        });
        item.data["codeSeguros"] = infoReportesAuxArray[index].name;
        item.data["header"] = infoReportesAuxArray[index].header;
      }
      item.data["fields"] = item.fields;
      return item.data;
    });

    const wb = new xl.Workbook(defaultOptionsReportExcel()); //INSTANCIA DEL OBJETO
    forEach(estadisticosDataFinal, (item) => {
      StatisticalReport({
        fecha,
        data: item,
        fields: item.fields,
        header: item.header,
        wb,
      });
    });
    return;
    const nameExcelFinal = ExcelExport.count > 0 ? nameAux : ExcelExport.name;
    const pathExcel = path.join("reports", nameExcelFinal);

    wb.write(pathExcel, (err, stats) => {
      if (err) {
        respErrorServidor500END(res, err);
      } else {
        respDescargarArchivos200(res, pathExcel, nameExcelFinal);
      }
    });
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

function NombreReporte(req, res) {
  try {
    const { reporte, fecha } = req.body;
    const nameAux = `Estadisticas_Inversiones ${dayjs(fecha)
      .locale("es")
      .format("MMMM YYYY")
      .toUpperCase()}.xlsx`;
    respResultadoCorrectoObjeto200(
      res,
      tipoReporte(reporte, fecha)?.header?.nameExcel || nameAux
    );
  } catch (err) {
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  estadisticasInversiones,
  estadisticasInversiones2,
  EstadisticasInversiones3,
  NombreReporte,
};
