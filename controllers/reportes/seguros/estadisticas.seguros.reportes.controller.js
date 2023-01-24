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
  split,
  lastIndexOf,
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
  ListarUtil,
  EjecutarQuerysReportes,
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
  StatisticalReport2,
} = require("../../../utils/opcionesReportes");
const dayjs = require("dayjs");
const { TransformarArrayAObjeto } = require("../../../utils/formatearDatos");
require("dayjs/locale/es");

function tipoReporte(id, fecha) {
  const REPORTES_FUNCIONES = {
    1: {
      id: 1,
      fun: ["aps_fun_seguros_cartera_valorada"],
      editFields: true,
      editData: true,
      mainValues: [0, 1],
      header: {
        name: "BOLETÍN CUADRO 1.4",
        nameExcel: "Comparativo Tipo Instrumento.xlsx",
        tables: [
          {
            title1: `INVERSIONES SEGUROS AL ${dayjs(fecha)
              .locale("es")
              .format("DD [DE] MMMM [DE] YYYY")
              .toUpperCase()}`,
            title2: "CARTERA VALORADA A PRECIOS DE  MERCADO",
            title3: "Expresado en Bolivianos",
          },
        ],
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
      mainValues: [0, 1],
      header: {
        name: "REP INSTITUCION (3)",
        nameExcel: "Tipo Instrumento Valor Mercado.xlsx",
        tables: [
          {
            title1: `INVERSIONES POR TIPO INSTRUMENTO`,
            title2: "TOTAL SEGUROS GENERALES",
            title3: `CARTERA A VALOR DE MERCADO AL ${dayjs(fecha)
              .locale("es")
              .format("DD [DE] MMMM [DE] YYYY")
              .toUpperCase()}`,
            title4: `EN DOLARES ESTADOUNIDENSES`,
          },
          {
            title1: `INVERSIONES POR TIPO INSTRUMENTO`,
            title2: "TOTAL SEGUROS PERSONALES",
            title3: `CARTERA A VALOR DE MERCADO AL ${dayjs(fecha)
              .locale("es")
              .format("DD [DE] MMMM [DE] YYYY")
              .toUpperCase()}`,
            title4: `EN DOLARES ESTADOUNIDENSES`,
          },
          {
            title1: `INVERSIONES POR TIPO INSTRUMENTO`,
            title2: "TOTAL SEGUROS PREPAGO",
            title3: `CARTERA A VALOR DE MERCADO AL ${dayjs(fecha)
              .locale("es")
              .format("DD [DE] MMMM [DE] YYYY")
              .toUpperCase()}`,
            title4: `EN DOLARES ESTADOUNIDENSES`,
          },
          {
            title1: `INVERSIONES POR TIPO INSTRUMENTO`,
            title2: "TOTAL MERCADO DE SEGUROS",
            title3: `CARTERA A VALOR DE MERCADO AL ${dayjs(fecha)
              .locale("es")
              .format("DD [DE] MMMM [DE] YYYY")
              .toUpperCase()}`,
            title4: `EN DOLARES ESTADOUNIDENSES`,
          },
        ],
      },
    },
    5: {
      id: 5,
      fun: ["aps_fun_diversificacion_emisor_tipoaseguradora"],
      mainValues: [0, 1, 2], //FECHA, CODIGO, EMISOR
      header: {
        name: "ASEGURADORA POR EMISOR",
        nameExcel: "Diversificacion Emisor.xlsx",
        tables: [
          {
            title1: `DIVERSIFICACIÓN POR EMISOR DE LA CARTERA DE INVERSIONES SEGUROS`,
            title2: "Entidades de Seguros y Reaseguros",
            title3: "Cartera a Valor de Mercado",
            title4: dayjs(fecha)
              .locale("es")
              .format("[AL] DD [DE] MMMM [DE] YYYY")
              .toUpperCase(),
          },
        ],
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
      fun: ["aps_fun_inversiones_tgn"],
      mainValues: [0, 1],
      header: {
        name: "TGN-BCB",
        nameExcel: "RIA TGN-BCB.xlsx",
        tables: [
          {
            title1: `AUTORIDAD DE FISCALIZACIÓN Y CONTROL DE PENSIONES Y SEGUROS`,
            title2: "DIRECCIÓN DE INVERSIONES",
            title3: dayjs(fecha)
              .locale("es")
              .format(
                "[Detalle de cartera de inversión admisible total mercado por emisor TGN - BCB al] DD [DE] MMMM [DE] YYYY"
              )
              .toUpperCase(),
          },
        ],
      },
    },
    11: {
      id: 11,
      mainValues: [0],
      fun: ["aps_fun_inversiones_por_emisor"],
      header: {
        name: "REP EMISOR",
        nameExcel: "Valores por Emisor.xlsx",
        tables: [
          {
            title1: `CARTERA DE INVERSIONES DE VALORES POR EMISOR`,
            title2: "Seguros Generales y Seguros de Personas",
            title3: dayjs(fecha)
              .locale("es")
              .format("[INVERSIONES SEGUROS AL] DD [DE] MMMM [DE] YYYY")
              .toUpperCase(),
          },
        ],
      },
    },
    24: {
      id: 24,
      mainValues: [0, 1, 2],
      fun: ["aps_fun_diversificacion_emisor_tipoaseguradora"],
      header: {
        name: "REP INSTRUMENTO",
        nameExcel: "Inversiones Tipo Instrumento.xlsx",
        tables: [
          {
            title1: `INVERSIONES POR TIPO INSTRUMENTO`,
            title2: "TOTAL Seguros Personales",
            title3: "Cartera a Valor de Mercado",
            title4: dayjs(fecha)
              .locale("es")
              .format("[AL] DD [DE] MMMM [DE] YYYY")
              .toUpperCase(),
          },
        ],
      },
    },
  };
  return REPORTES_FUNCIONES[id];
}

function PrepararReportes(reportes, instituciones) {
  const ID_TIPO_REPORTE = {
    1: (reporte) => {
      forEach(reporte, (item) => {
        //#region FIELDS
        let fieldsAux = {};
        const formatFields = map(item.fields, (field) => {
          if (includes(field, "participacion")) {
            const identificador = includes(field, "_m1") ? "_m1" : "_m2";
            return `participación_(%)${identificador}`;
          }
          return field;
        });

        forEach(formatFields, (fField) => {
          if (
            fField === "fecha_informacion_m1" ||
            fField === "fecha_informacion_m2"
          ) {
            const identificador = includes(fField, "m1") ? "m1" : "m2";
            const value = item.data[0]?.[fField]
              ? item.data[0]?.[fField]
              : fecha;
            const fechaFinal =
              includes(fField, "m1") && !item.data[0]?.[fField]
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
          } else if (fField === "tipo_instrumento") {
            fieldsAux = { ...fieldsAux, [`${fField}_main`]: fField };
          } else {
            fieldsAux = { ...fieldsAux, [fField]: fField };
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
        item.fields = fieldsAux;
        //#endregion
        //#region DATA
        forEach(item.data, (itemData) => {
          delete itemData.fecha_informacion_m1;
          delete itemData.fecha_informacion_m2;
        });
        //#endregion
      });
    },
    3: (reporte) => {
      forEach(reporte, (item) => {
        forEach(item.fields, (field, indexField) => {
          const institucionAux = find(instituciones, (itemInstitucion) => {
            return field.substring(1, size(field)) === itemInstitucion.codigo;
          });
          if (institucionAux?.institucion)
            set(item.fields, indexField, institucionAux.institucion);
          else if (field === "titulo")
            set(item.fields, indexField, "instrumento");
          else if (field === "total" || field === "ctotal")
            set(item.fields, indexField, "total");
        });
        item.fields = TransformarArrayAObjeto(item.fields);

        const arrayAux = [];
        forEach(item.fields, (field, indexField) => {
          if (field !== "fecha" && field !== "instrumento") {
            arrayAux.push(
              field === "composicion" || field === "porcentaje"
                ? `${field}_(%)`
                : field
            );
            delete item.fields[indexField];
          }
        });
        const indexFieldAux = item.fun.substring(
          lastIndexOf(item.fun, "_"),
          size(item.fun)
        );
        item.fields[
          `seguros${
            includes(indexFieldAux, "totalmercado")
              ? "_total_mercado"
              : indexFieldAux
          }`
        ] = arrayAux;
        // console.log(item.fields);
      });
    },
    5: (reporte) => {
      const formatFields = {
        fecha: "fecha",
        codigo: "codigo",
        emisor: "emisor",
        seguros_generales: ["monto_valorado_$us", "porcentaje_(%)"],
        seguros_personales: ["monto_valorado_$us", "porcentaje_(%)"],
        seguros_prepago: ["monto_valorado_$us", "porcentaje_(%)"],
        total_entidades: ["monto_valorado_$us", "porcentaje_(%)"],
      };
      forEach(reporte, (item) => {
        item.fields = formatFields;
      });
    },
    10: (reporte) => {
      forEach(reporte, (item) => {
        item.fields = {
          fecha: "fecha",
          instrumento: "instrumento",
          serie: "serie",
          cantidad: "cantidad_de_valores",
          moneda: "moneda",
          totalvaloradousd: "total_valorado_usd",
          totalvaloradobs: "total_valorado_en_bs",
        };
      });
    },
    11: (reporte) => {
      forEach(reporte, (item) => {
        item.fields = {
          emisor: "emisor",
          extranjero: "extranjero",
          nacional: "nacional",
          totalgeneral: "total_general",
        };
      });
    },
    24: (reporte) => {
      forEach(reporte, (item) => {
        item.fields = {
          fecha: "fecha",
          codigo: "codigo",
          emisor: "emisor",
          seguros_generales: ["monto_valorado_$us", "porcentaje_(%)"],
          seguros_personales: ["monto_valorado_$us", "porcentaje_(%)"],
          seguros_prepago: ["monto_valorado_$us", "porcentaje_(%)"],
          total_entidades: ["monto_valorado_$us", "porcentaje_(%)"],
        };
      });
    },
  };
  forEach(reportes, (item, index) => {
    ID_TIPO_REPORTE[split(index, "(-separador-)")[0]](item);
  });

  return reportes;
}

async function EstadisticasInversiones(req, res) {
  try {
    const { fecha, reportes } = req.body;
    const errorsReports = [];
    if (!fecha || !reportes) {
      respDatosNoRecibidos400(res, "Los datos no fueron recibidos");
      return;
    }
    //#region OBTENIENDO INSTITUCIONES
    const queryInstituciones = ListarUtil("aps_view_modalidad_seguros", {
      activo: null,
    });
    const instituciones = await pool
      .query(queryInstituciones)
      .then((result) => {
        return { ok: true, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });
    if (instituciones.ok === null) {
      throw instituciones.err;
    }
    //#endregion

    //#region DECLARACION DE VARIABLES
    const nameAux = `Estadisticas_Inversiones ${dayjs(fecha)
      .locale("es")
      .format("MMMM YYYY")
      .toUpperCase()}.xlsx`;
    const ExcelExport = {
      name: nameAux,
      count: 0,
    };
    //#endregion

    const optionsReport = [];
    forEach(reportes, (id_reporte, index) => {
      const infoReporte = tipoReporte(id_reporte, fecha);
      ExcelExport.name = infoReporte.header.nameExcel;
      ExcelExport.count = index;
      optionsReport.push(
        map(infoReporte.fun, (item) => {
          const bodyAux = { fecha };
          if (infoReporte?.moneda) {
            bodyAux.moneda = infoReporte.moneda;
          }
          return {
            id: id_reporte,
            fun: item,
            query: EjecutarFuncionSQL(item, {
              body: bodyAux,
            }),
            header: infoReporte.header,
            mainValuesAux: infoReporte.mainValues,
          };
        })
      );
    });
    const results = await EjecutarQuerysReportes(optionsReport, "ESTADISTICOS");
    if (results.ok === null) throw results.result;
    if (results.ok === false) throw results.result;

    const wb = new xl.Workbook(defaultOptionsReportExcel()); //INSTANCIA DEL OBJETO PARA CREAR EL ARCHIVO EXCEL
    const reportesEstadisticosFinal = PrepararReportes(
      results.result,
      instituciones.result
    );
    // console.log(reportesEstadisticosFinal);
    forEach(reportesEstadisticosFinal, (item, index) => {
      const resultReport = StatisticalReport2({
        fecha,
        reporte: item,
        indexReporteAux: index,
        wb,
      });
      if (resultReport.ok === null) errorsReports.push(resultReport.err);
    });
    if (size(errorsReports) > 0) throw errorsReports;
    const nameExcelFinal = ExcelExport.count > 0 ? nameAux : ExcelExport.name;
    const pathExcel = path.join("reports/estadisticos", nameExcelFinal);

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
  EstadisticasInversiones,
  NombreReporte,
};
