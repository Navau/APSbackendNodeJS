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
  find,
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
      fun: ["aps_fun_seguros_cartera_valorada"],
      editFields: true,
      editData: true,
      mainValues: [0],
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
      },
    },
    2: {
      id: 2,
      fun: ["aps_fun_seguros_cartera_valorada"],
      editFields: true,
      editData: true,
      mainValues: [0],
      header: {
        name: "Boletín Cuadro 1.4",
        nameExcel: "RIR USD.xlsx",
        titles: {
          title1: `INVERSIONES SEGUROS AL ${dayjs(fecha)
            .locale("es")
            .format("DD [DE] MMMM [DE] YYYY")
            .toUpperCase()}`,
          title2: "CARTERA VALORADA A PRECIOS DE  MERCADO",
          title3: "Expresado en Bolivianos",
        },
      },
    },
    3: {
      id: 3,
      fun: [
        "aps_fun_inversiones_rir_generales",
        "aps_fun_inversiones_rir_personales",
        "aps_fun_inversiones_rir_prepago",
        "aps_fun_inversiones_rir_totalmercado",
      ],
      moneda: 3,
      editFields: true,
      mainValues: [0],
      multipleTables: true,
      header: {
        name: "REP INST (3)",
        nameExcel: "Tipo Instrumento Valor Mercado.xlsx",
        titles: {
          title1: `INVERSIONES SEGUROS AL ${dayjs(fecha)
            .locale("es")
            .format("DD [DE] MMMM [DE] YYYY")
            .toUpperCase()}`,
          title2: "CARTERA VALORADA A PRECIOS DE  MERCADO",
          title3: "Expresado en Bolivianos",
        },
      },
    },
    4: {
      id: 4,
      fun: ["aps_fun_seguros_cartera_valorada"],
      editFields: true,
      editData: true,
      mainValues: [0],
      header: {
        name: "Boletín Cuadro 1.4",
        nameExcel: "Tipo Instrumento Valor Nominal.xlsx",
        titles: {
          title1: `INVERSIONES SEGUROS AL ${dayjs(fecha)
            .locale("es")
            .format("DD [DE] MMMM [DE] YYYY")
            .toUpperCase()}`,
          title2: "CARTERA VALORADA A PRECIOS DE  MERCADO",
          title3: "Expresado en Bolivianos",
        },
      },
    },
    5: {
      id: 5,
      fun: ["aps_fun_diversificacion_emisor_tipoaseguradora"],
      editFields: true,
      mainValues: [0, 1, 2], //FECHA, CODIGO, EMISOR
      header: {
        name: "REP EMISOR TIPO ASEGURADORA",
        nameExcel: "Diversificacion Emisor.xlsx",
        titles: {
          title1: `DIVERSIFICACIÓN POR EMISOR DE LA CARTERA DE INVERSIONES SEGUROS`,
          title2: "Entidades de Seguros y Reaseguros",
          title3: "Cartera a Valor de Mercado",
          title4: dayjs(fecha)
            .locale("es")
            .format("[AL] DD [DE] MMMM [DE] YYYY")
            .toUpperCase(),
        },
      },
    },
    9: {
      id: 9,
      fun: ["aps_fun_diversificacion_emisor_tipoaseguradora"],
      editFields: true,
      mainValues: [0, 1, 2], //FECHA, CODIGO, EMISOR
      header: {
        name: "REP EMISOR TIPO ASEGURADORA",
        nameExcel: "RIR BOB.xlsx",
        titles: {
          title1: `DIVERSIFICACIÓN POR EMISOR DE LA CARTERA DE INVERSIONES SEGUROS`,
          title2: "Entidades de Seguros y Reaseguros",
          title3: "Cartera a Valor de Mercado",
          title4: dayjs(fecha)
            .locale("es")
            .format("[AL] DD [DE] MMMM [DE] YYYY")
            .toUpperCase(),
        },
      },
    },
    10: {
      id: 10,
      fun: ["aps_fun_inversiones_tgn"],
      editFields: true,
      mainValues: [0, 1],
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
      },
    },
    11: {
      id: 11,
      editFields: true,
      mainValues: [0],
      fun: ["aps_fun_inversiones_por_emisor"],
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
      },
    },
    12: {
      id: 12,
      editFields: true,
      mainValues: [0],
      fun: ["aps_fun_inversiones_por_emisor"],
      header: {
        name: "REP EMISOR",
        nameExcel: "DPF por Plazo.xlsx",
        titles: {
          title1: `CARTERA DE INVERSIONES DE VALORES POR EMISOR`,
          title2: "Seguros Generales y Seguros de Personas",
          title3: dayjs(fecha)
            .locale("es")
            .format("[INVERSIONES SEGUROS AL] DD [DE] MMMM [DE] YYYY")
            .toUpperCase(),
        },
      },
    },
    24: {
      id: 24,
      editFields: true,
      mainValues: [0, 1, 2],
      fun: ["aps_fun_diversificacion_emisor_tipoaseguradora"],
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
      },
    },
  };

  return REPORTES_FUNCIONES[id];
}

function EditarSubtitulos(id, data, fields, fecha) {
  const CHANGE_FIELDS = {
    1: () => {
      let fieldsAux = {};
      const formatFields = map(fields, (item) => {
        if (includes(item, "participacion")) {
          const identificador = includes(item, "_m1") ? "_m1" : "_m2";
          return `participación_(%)${identificador}`;
        }
        return item;
      });
      forEach(formatFields, (item) => {
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
              formatFields,
              (itemMap) =>
                includes(itemMap, identificador) &&
                !includes(itemMap, "fecha_informacion")
            ),
          };
        } else if (item === "tipo_instrumento") {
          fieldsAux = { ...fieldsAux, [`${item}_main`]: item };
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
    3: () => {
      return fields;
    },
    5: () => {
      const formatFields = {
        fecha: "fecha",
        codigo: "codigo",
        emisor: "emisor",
        seguros_generales: ["monto_valorado_$us", "porcentaje_(%)"],
        seguros_personales: ["monto_valorado_$us", "porcentaje_(%)"],
        seguros_prepago: ["monto_valorado_$us", "porcentaje_(%)"],
        total_entidades: ["monto_valorado_$us", "porcentaje_(%)"],
      };
      return formatFields;
    },
    10: () => {
      return {
        fecha: "fecha",
        instrumento: "instrumento",
        serie: "serie",
        cantidad: "cantidad_de_valores",
        moneda: "moneda",
        totalvaloradousd: "total_valorado_usd",
        totalvaloradobs: "total_valorado_en_bs",
      };
    },
    11: () => {
      return {
        emisor: "emisor",
        extranjero: "extranjero",
        nacional: "nacional",
        totalgeneral: "total_general",
      };
    },
    24: () => {
      const formatFields = {
        fecha: "fecha",
        codigo: "codigo",
        emisor: "emisor",
        seguros_generales: ["monto_valorado_$us", "porcentaje_(%)"],
        seguros_personales: ["monto_valorado_$us", "porcentaje_(%)"],
        seguros_prepago: ["monto_valorado_$us", "porcentaje_(%)"],
        total_entidades: ["monto_valorado_$us", "porcentaje_(%)"],
      };
      return formatFields;
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
      return map(infoReporte.fun, (item) => {
        const bodyAux = { fecha };
        if (infoReporte?.moneda) {
          bodyAux.moneda = infoReporte.moneda;
        }
        return EjecutarFuncionSQL(item, {
          body: bodyAux,
        });
      });
    });

    if (
      size(
        filter(
          reportes,
          (item) => item === 2 || item === 4 || item === 9 || item === 12
        )
      ) > 0
    ) {
      const nameExcelFinal = ExcelExport.count > 0 ? nameAux : ExcelExport.name;
      const pathExcel = path.join("reports", nameExcelFinal);

      respDescargarArchivos200(res, pathExcel, nameExcelFinal);
      return;
    }

    const results = await EjecutarVariosQuerys(
      map(querys, (query) => query[0])
    );
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
      item.data["mainValues"] = report?.mainValues;
      return item.data;
    });

    const wb = new xl.Workbook(defaultOptionsReportExcel()); //INSTANCIA DEL OBJETO
    forEach(estadisticosDataFinal, (item) => {
      const resultReport = StatisticalReport({
        fecha,
        data: item,
        fields: item.fields,
        header: item.header,
        mainValues: item?.mainValues,
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
