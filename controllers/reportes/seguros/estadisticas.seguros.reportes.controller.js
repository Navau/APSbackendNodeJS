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
  set,
  includes,
  indexOf,
  filter,
  isArray,
  replace,
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
const { TransformarArrayAObjeto } = require("../../../utils/formatearDatos");
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
      id: 1,
      fun: "aps_fun_seguros_cartera_valorada",
      editFields: true,
      editData: true,
      header: {
        name: "Boletín Cuadro 1.4",
        nameExcel: "Comparativo Tipo Instrumento.xlsx",
        titles: {
          title1: `INVERSIONES SEGUROS AL ${dayjs(fecha)
            .locale("es")
            .format("DD [DE] MMMM [DE] YYYY")
            .toUpperCase()}`,
          title2: "CARTERA VALORADA A PRECIOS DE  MERCADO",
          title3: "Expresado en Bolivianos",
        },
        date: fecha,
        expressedIn: "Bolivianos",
      },
    },
    5: {
      id: 5,
      fun: "aps_fun_diversificacion_emisor_tipoaseguradora",
      header: {
        name: "REP EMISOR TIPO ASEGURADORA",
        nameExcel: "Diversificacion Emisor.xlsx",
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
    //   header: {
    //   name: "Boletín Cuadro 1.5",
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
      id: 10,
      fun: "aps_fun_inversiones_tgn",
      header: {
        name: "TGN-BCB",
        nameExcel: "RIA TGN-BCB.xlsx",
        titles: {
          title1: `AUTORIDAD DE FISCALIZACIÓN Y CONTROL DE PENSIONES Y SEGUROS`,
          title2: "DIRECCIÓN DE INVERSIONES",
          title3: dayjs(fecha)
            .locale("es")
            .format(
              "[Detalle de cartera de inversión admisible total mercado por emisor TGN - BCB al] DD [DE] MMMM [DE] YYYY"
            )
            .toUpperCase(),
        },
        date: fecha,
      },
    },
    11: {
      id: 11,
      fun: "aps_fun_inversiones_por_emisor",
      header: {
        name: "REP EMISOR",
        nameExcel: "Valores por Emisor.xlsx",
        titles: {
          title1: `CARTERA DE INVERSIONES DE VALORES POR EMISOR`,
          title2: "Seguros Generales y Seguros de Personas",
          title3: dayjs(fecha)
            .locale("es")
            .format("[INVERSIONES SEGUROS AL] DD [DE] MMMM [DE] YYYY")
            .toUpperCase(),
        },
        date: fecha,
      },
    },
    24: {
      id: 24,
      fun: "aps_fun_diversificacion_emisor_tipoaseguradora",
      header: {
        name: "REP INSTRUMENTO TIPO ASEGURADORA",
        nameExcel: "Inversiones Tipo Instrumento.xlsx",
        titles: {
          title1: `INVERSIONES POR TIPO INSTRUMENTO`,
          title2: "TOTAL Seguros Personales",
          title3: "Cartera a Valor de Mercado",
          title4: dayjs(fecha)
            .locale("es")
            .format("[AL] DD [DE] MMMM [DE] YYYY")
            .toUpperCase(),
        },
        date: fecha,
      },
    },
  };

  return REPORTES_FUNCIONES[id];
}

function EditarSubtitulos(id, data, fields, fecha) {
  const CHANGE_FIELDS = {
    1: () => {
      let fieldsAux = {};
      forEach(fields, (item) => {
        if (
          item === "fecha_informacion_m1" ||
          item === "fecha_informacion_m2"
        ) {
          const identificador = includes(item, "m1") ? "m1" : "m2";
          const value = data[0]?.[item] ? data[0]?.[item] : fecha;
          const fechaFinal =
            includes(item, "m1") && !data[0]?.[item]
              ? dayjs(value)
                  .add(-1, "month")
                  .locale("es")
                  .format("MMMM[_]YYYY")
                  .toUpperCase()
              : dayjs(value).locale("es").format("MMMM[_]YYYY").toUpperCase();
          fieldsAux = {
            ...fieldsAux,
            [fechaFinal]: filter(
              fields,
              (itemMap) =>
                includes(itemMap, identificador) &&
                !includes(itemMap, "fecha_informacion")
            ),
          };
        } else {
          fieldsAux = { ...fieldsAux, [item]: item };
        }
      });
      forEach(fieldsAux, (field, index) => {
        if (isArray(field)) {
          const aux = [];
          forEach(field, (subfield) => {
            delete fieldsAux[subfield];
            const identificador = includes(subfield, "_m1") ? "_m1" : "_m2";
            if (includes(subfield, identificador)) {
              aux.push(replace(subfield, identificador, ""));
            }
          });
          set(fieldsAux, index, aux);
        }
      });
      return fieldsAux;
    },
  };
  return CHANGE_FIELDS[id]();
}

function EditarInformacion(id, data, fecha) {
  const CHANGE_DATA = {
    1: () => {
      forEach(data, (item) => {
        delete item.fecha_informacion_m1;
        delete item.fecha_informacion_m2;
      });
      return data;
    },
  };
  return CHANGE_DATA[id]();
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
    const errorsReports = [];
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
      const report = infoReportesAuxArray[index];
      item.data["fields"] =
        report?.editFields === true
          ? EditarSubtitulos(report.id, item.data, item.fields, fecha)
          : TransformarArrayAObjeto(item.fields);
      item.data =
        report?.editData === true
          ? EditarInformacion(report.id, item.data, fecha)
          : item.data;
      item.data["header"] = report.header;
      return item.data;
    });

    const wb = new xl.Workbook(defaultOptionsReportExcel()); //INSTANCIA DEL OBJETO
    forEach(estadisticosDataFinal, (item) => {
      const resultReport = StatisticalReport({
        fecha,
        data: item,
        fields: item.fields,
        header: item.header,
        wb,
      });
      if (resultReport.ok === null) errorsReports.push(resultReport.err);
    });
    if (size(errorsReports) > 0) throw errorsReports;
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
