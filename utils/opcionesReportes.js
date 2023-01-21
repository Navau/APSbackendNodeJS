const dayjs = require("dayjs");
const {
  forEach,
  trimStart,
  trim,
  map,
  uniqBy,
  uniq,
  findIndex,
  indexOf,
  size,
  filter,
  isObject,
  isArray,
  includes,
  toString,
  toLower,
  isEmpty,
  isUndefined,
  isString,
  isNumber,
} = require("lodash");
const fs = require("fs");
const path = require("path");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const { formatoMiles, separarStringPorCaracter } = require("./formatearDatos");

require("dayjs/locale/es");
dayjs.locale("es");

function alignTextStyleReportExcel(horizontal, vertical) {
  return {
    alignment: {
      horizontal: horizontal || "left",
      vertical: vertical || "center",
    },
  };
}
//TOP, RIGHT, BOTTOM, LEFT
function marginStyleReportExcel(align) {
  return {
    marginTop: `${align?.[0] || 0}pt`,
    marginRight: `${align?.[1] || 0}pt`,
    marginBottom: `${align?.[2] || 0}pt`,
    marginLeft: `${align?.[3] || 0}pt`,
  };
}

function toAlpha(num) {
  if (num < 1 || num > 26 || typeof num !== "number") {
    return -1;
  }
  const leveller = 64;
  //since actually A is represented by 65 and we want to represent it with one
  return String.fromCharCode(num + leveller);
}

function toUpperCaseToWord(word) {
  const words = word.split(" ");

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ");
}

//SANGRIA
function indentStyleReportExcel(indent, relativeIndent) {
  return {
    alignment: {
      indent,
      relativeIndent,
    },
  };
}

function defaultOptionsReportExcel() {
  return {
    // jszip: {
    //   compression: "DEFLATE",
    // },
    defaultFont: {
      size: 10,
      name: "Arial",
      color: "0A0A0A",
    },
    dateFormat: "m/d/yy hh:mm:ss",
    // workbookView: {
    //   activeTab: 1, // Specifies an unsignedInt that contains the index to the active sheet in this book view.
    //   autoFilterDateGrouping: true, // Specifies a boolean value that indicates whether to group dates when presenting the user with filtering options in the user interface.
    //   firstSheet: 1, // Specifies the index to the first sheet in this book view.
    //   minimized: false, // Specifies a boolean value that indicates whether the workbook window is minimized.
    //   showHorizontalScroll: true, // Specifies a boolean value that indicates whether to display the horizontal scroll bar in the user interface.
    //   showSheetTabs: true, // Specifies a boolean value that indicates whether to display the sheet tabs in the user interface.
    //   showVerticalScroll: true, // Specifies a boolean value that indicates whether to display the vertical scroll bar.
    //   tabRatio: 600, // Specifies ratio between the workbook tabs bar and the horizontal scroll bar.
    //   visibility: "visible", // Specifies visible state of the workbook window. ('hidden', 'veryHidden', 'visible') (§18.18.89)
    //   windowHeight: 17620, // Specifies the height of the workbook window. The unit of measurement for this value is twips.
    //   windowWidth: 28800, // Specifies the width of the workbook window. The unit of measurement for this value is twips..
    //   xWindow: 0, // Specifies the X coordinate for the upper left corner of the workbook window. The unit of measurement for this value is twips.
    //   yWindow: 440, // Specifies the Y coordinate for the upper left corner of the workbook window. The unit of measurement for this value is twips.
    // },
    // logLevel: 0, // 0 - 5. 0 suppresses all logs, 1 shows errors only, 5 is for debugging
    // author: "APS", // Name for use in features such as comments
  };
}

function defaultStyleReportExcel(wb, custom) {
  if (custom === "header") {
    return customSingleStyleReportExcel(wb, {
      font: {
        bold: true,
        size: 12,
      },
      alignment: {
        shrinkToFit: true,
        wrapText: true,
        horizontal: "left",
      },
      numberFormat: "#,##0.00; (#,##0.00); 0",
    });
  } else if (custom === "subheaders") {
    return customSingleStyleReportExcel(wb, {
      font: {
        color: "#F4F4F4",
        bold: true,
        size: 12,
      },
      alignment: {
        shrinkToFit: true,
        wrapText: true,
        horizontal: "left",
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        fgColor: "95B3D7",
      },
      border: {
        top: { style: "medium" },
        bottom: { style: "medium" },
        left: { style: "medium" },
        right: { style: "hair" },
      },
      numberFormat: "#,##0.00; (#,##0.00); 0",
      ...alignTextStyleReportExcel("center"),
    });
  } else if (custom === "body") {
    return customSingleStyleReportExcel(wb, {
      font: {
        bold: true,
        size: 10,
      },
      alignment: {
        shrinkToFit: true,
        wrapText: true,
        horizontal: "left",
      },
      numberFormat: "#,##0.00; (#,##0.00); 0",
    });
  }
}

function defaultStyleReport(type, custom, wb, valueAux) {
  const TYPE_REPORT = {
    ESTADISTICO: {
      header: customSingleStyleReportExcel(wb, {
        font: {
          color: "#FFFFFF",
          bold: true,
          size: 12,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "366092",
        },
        border: {
          top: { style: "hair" },
          bottom: { style: "hair" },
          left: { style: "hair" },
          right: { style: "hair" },
        },
        alignment: {
          shrinkToFit: true,
          wrapText: true,
          horizontal: "left",
        },
        numberFormat: "#,##0.00; (#,##0.00); 0",
        ...alignTextStyleReportExcel("center"),
      }),
      subheader: customSingleStyleReportExcel(wb, {
        font: {
          color: "#F4F4F4",
          bold: true,
          size: 12,
        },
        alignment: {
          shrinkToFit: true,
          wrapText: true,
          horizontal: "left",
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "95B3D7",
        },
        border: {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "medium" },
          right: { style: "hair" },
        },
        numberFormat: "#,##0.00; (#,##0.00); 0",
        ...alignTextStyleReportExcel("center"),
      }),
      data: customSingleStyleReportExcel(wb, {
        font: {
          bold: true,
          size: 10,
        },
        alignment: {
          shrinkToFit: true,
          wrapText: true,
          horizontal: "left",
        },
        numberFormat: "#,##0.00; (#,##0.00); 0",
      }),
      value_total: {
        border: {
          border: {
            bottom: { style: "medium" },
          },
        },
        indent: (a = 0, b = 0) => {
          return indentStyleReportExcel(a, b);
        },
        fill: customSingleStyleReportExcel(wb, {
          fill: {
            type: "pattern",
            patternType: "solid",
            fgColor: "8EA9DB",
          },
        }),
        align: (orientation = "center") => {
          return alignTextStyleReportExcel(orientation);
        },
        fontBold: (bold = true) => {
          return customSingleStyleReportExcel(wb, {
            font: {
              bold,
            },
          });
        },
      },
      value_group: {
        border: {
          border: {
            bottom: { style: "dashed" },
            right: { style: "thin" },
            left: { style: "medium" },
          },
        },
        indent: (a = 3, b = 3) => {
          return indentStyleReportExcel(a, b);
        },
        align: (orientation = "center") => {
          return alignTextStyleReportExcel(orientation);
        },
        fontBold: (bold = false) => {
          return customSingleStyleReportExcel(wb, {
            font: {
              bold,
            },
          });
        },
      },
    },
  };

  return TYPE_REPORT[type][custom];
}

function borderAndCellsCommonReportExcel(
  ws,
  wb,
  x1,
  x2,
  y1,
  yPlus,
  borderMain
) {
  cellsBorderStyleReportExcel(x1, y1, x2, y1 + yPlus, ws, wb);
  customBorderStyleReportExcel(x1, y1, x2, y1 + yPlus, ws, wb, {
    top: { style: borderMain },
  });
  customBorderStyleReportExcel(x2, y1, x2, y1 + yPlus, ws, wb, {
    bottom: { style: borderMain },
  });
  customBorderStyleReportExcel(x1, y1, x2, y1, ws, wb, {
    left: { style: borderMain },
  });
  customBorderStyleReportExcel(x1, y1 + 1, x2, y1 + yPlus, ws, wb, {
    right: { style: borderMain },
  });
}

function cellsBorderStyleReportExcel(
  x1,
  x2,
  y1,
  y2,
  ws,
  wb,
  styleBorder = {
    left: {
      style: "dashed",
      color: "black",
    },
    right: {
      style: "dashed",
      color: "black",
    },
    top: {
      style: "dashed",
      color: "black",
    },
    bottom: {
      style: "dashed",
      color: "black",
    },
    outline: false,
  }
) {
  return ws.cell(x1, x2, y1, y2).style(
    wb.createStyle({
      border: styleBorder,
    })
  );
}

function customBorderStyleReportExcel(x1, x2, y1, y2, ws, wb, styleBorder) {
  return ws.cell(x1, x2, y1, y2).style(
    wb.createStyle({
      border: styleBorder,
    })
  );
}

function customSingleStyleReportExcel(wb, style) {
  return wb.createStyle(style);
}

function singleFormatDataReportExcel(sigla, data) {
  const REPORTS_DATA = {
    CIG: () => {
      return map(data, (item, index) => {
        const valueGroup = {
          grupo: item.grupo,
          plazo: item.plazo,
          descripcion_corta: item.descripcion_corta,
        };
        return { ...item, grupoFinal: valueGroup };
      });
    },
    CEM: () => {
      let tipoInstrumentoAux = null;
      const arrayResult = [];
      forEach(data, (item, index) => {
        if (tipoInstrumentoAux !== item.tipo_instrumento) {
          tipoInstrumentoAux = item.tipo_instrumento;
          arrayResult.push({
            ...item,
            tipo_instrumento: item.tipo_instrumento,
            serie: "",
          });
        } else {
          arrayResult.push({
            ...item,
          });
        }
      });
      return arrayResult;
    },
  };

  return REPORTS_DATA[sigla]();
}

function formatDataReportExcel(headers, body, wb) {
  //#region CLASIFICANDO LAS INSTITUCIONES DE body
  const segurosClassified = {};
  let valueIdEntidadAux = null;
  forEach(body, (item, index) => {
    const idEntidadAux = item?.cod_institucion
      ? item?.cod_institucion
      : item?.id_entidad
      ? item.id_entidad
      : null;
    if (valueIdEntidadAux !== idEntidadAux?.toString()) {
      valueIdEntidadAux = idEntidadAux?.toString();
      segurosClassified[valueIdEntidadAux] = [item];
    } else {
      segurosClassified[valueIdEntidadAux] = [
        ...segurosClassified[valueIdEntidadAux],
        item,
      ];
    }
  });
  //#endregion

  forEach(headers, (item, index) => {
    let tipoIndicador = null;
    const indicadoresArray = {};
    const ws = wb.addWorksheet(item.sigla); // HOJA DE INSTITUCION
    const dataReportHeader = {
      code: item.sigla,
      data: {
        title: item.institucion,
        date: item.fecha,
        typeOfChange: parseFloat(item.compra),
        amountBs: parseFloat(item.monto_bs),
        amountUSD: parseFloat(item.monto_usd),
      },
    };
    headerStyleReportExcel(ws, wb, dataReportHeader);
    const entidadClassified =
      size(segurosClassified[`${item.id_entidad}`]) > 0
        ? segurosClassified[`${item.id_entidad}`]
        : [];
    // console.log("id_entidad", item.id_entidad);
    // console.log("segurosDataFinal", segurosClassified);
    // console.log("entidadClassified", entidadClassified);

    //#region CLASIFICANDO POR TIPO_INDICADOR LA INFORMACION Y TAMBIEN AÑADIENDO TIPO_INDICADOR_FINAL A CADA CLASIFICACION
    for (const dataEntidad of entidadClassified) {
      let TIPO_INDICADOR = {
        indicador: null,
        total: null,
      };
      if (dataEntidad?.tipo_indicador) {
        TIPO_INDICADOR.indicador = dataEntidad.tipo_indicador;
      } else if (dataEntidad.codeSeguros === "CIG") {
        TIPO_INDICADOR.indicador =
          "CARTERA DE INVERSIONES POR TIPO GENÉRICO DE VALOR";
      } else if (
        dataEntidad.codeSeguros === "CIE" &&
        dataEntidad.codigo_rmv.includes("TOTAL")
      ) {
        TIPO_INDICADOR.indicador =
          "CARTERA DE INVERSIONES POR CONCENTRACIÓN EN PROPIEDAD";
        TIPO_INDICADOR.total = "TOTAL CARTERA POR EMISOR";
      } else if (dataEntidad.codeSeguros === "CEM") {
        TIPO_INDICADOR.indicador = "CARTERA DE INVERSIONES POR EMISIÓN";
      }

      if (tipoIndicador !== TIPO_INDICADOR.indicador && !TIPO_INDICADOR.total) {
        tipoIndicador = TIPO_INDICADOR.indicador;
        indicadoresArray[
          TIPO_INDICADOR.indicador + "-" + dataEntidad.codeSeguros
        ] = [dataEntidad];
      } else {
        indicadoresArray[
          TIPO_INDICADOR.indicador + "-" + dataEntidad.codeSeguros
        ] = [
          ...indicadoresArray[
            TIPO_INDICADOR.indicador + "-" + dataEntidad.codeSeguros
          ],
          dataEntidad,
        ];
      }
    }

    forEach(indicadoresArray, (itemI, indexI) => {
      !("typeIndicatorFinal" in itemI)
        ? (itemI["typeIndicatorFinal"] = indexI.substring(
            0,
            indexI.indexOf("-")
          ))
        : "";
      !("codeSegurosAux" in itemI)
        ? (itemI["codeSegurosAux"] = indexI.substring(
            indexI.indexOf("-") + 1,
            indexI.length
          ))
        : "";
      !("details" in itemI) ? (itemI["details"] = "Detalle") : "";
      !("serie" in itemI) ? (itemI["serie"] = "Serie") : "";

      !("typeCoin" in itemI) ? (itemI["typeCoin"] = "USD") : "";
      !("valNominal" in itemI) ? (itemI["valNominal"] = "Val. Nominal") : "";

      !("percentageRIR" in itemI)
        ? (itemI["percentageRIR"] = "En % (RIR)")
        : "";
      !("percentageEmision" in itemI)
        ? (itemI["percentageEmision"] = "En % (Emisión)")
        : "";

      !("maxLimit" in itemI) ? (itemI["maxLimit"] = "Límite Máx.") : "";
      !("result" in itemI) ? (itemI["result"] = "Resultado") : "";
    });
    //#endregion

    // console.log("ARRAY", Object.values(indicadoresArray));
    // console.log("OBJECT", indicadoresArray);
    // console.log("indicadoresArray", indicadoresArray);

    const dataReportBody = {
      code: item.sigla,
      data: Object.values(indicadoresArray),
    };
    // console.log(dataReportBody.data);
    bodyCommonStyleReportExcel(ws, wb, dataReportBody);
  });
}

function formatDataChartsReportExcel(fecha, body, header, wb) {
  // #region AÑADIENDO CAMPOS NECESARIOS AL OBJETO FINAL
  !("codeSegurosAux" in body)
    ? (body["codeSegurosAux"] = body[0]?.codeSeguros)
    : "";

  !("header" in body) ? (body["header"] = header) : "";

  !("typeInstrument" in body)
    ? (body["typeInstrument"] = "TIPO INSTRUMENTO")
    : "";

  !("dateInfoM1" in body)
    ? (body["dateInfoM1"] = dayjs(body?.[0]?.fecha_informacion_m1)
        .locale("es")
        .format("MMMM YYYY")
        .toUpperCase())
    : "";
  !("dateInfoM2" in body)
    ? (body["dateInfoM2"] = dayjs(body?.[0]?.fecha_informacion_m2)
        .locale("es")
        .format("MMMM YYYY")
        .toUpperCase())
    : "";

  !("portfolioValueM1" in body)
    ? (body["portfolioValueM1"] = "Valor de cartera")
    : "";
  !("participationM1" in body)
    ? (body["participationM1"] = "Participación %")
    : "";
  !("portfolioValueM2" in body)
    ? (body["portfolioValueM2"] = "Valor de cartera")
    : "";
  !("participationM2" in body)
    ? (body["participationM2"] = "Participación %")
    : "";

  !("titulo_codeEmisor" in body) ? (body["titulo_codeEmisor"] = "Código") : "";
  !("titulo_emisor" in body) ? (body["titulo_emisor"] = "Emisor") : "";

  !("titulo_general" in body)
    ? (body["titulo_general"] = "Seguros Generales")
    : "";

  !("titulo_personal" in body)
    ? (body["titulo_personal"] = "Seguros Personales")
    : "";

  !("titulo_prepago" in body)
    ? (body["titulo_prepago"] = "Seguros Prepago")
    : "";

  !("titulo_entidades" in body)
    ? (body["titulo_entidades"] = "Total entidades")
    : "";

  !("titulo_monto_valorado" in body)
    ? (body["titulo_monto_valorado"] = "Monto Valorado $us")
    : "";
  !("titulo_porcentaje_valorado" in body)
    ? (body["titulo_porcentaje_valorado"] = "Porcentaje %")
    : "";

  !("titulo_porcentaje_valorado" in body)
    ? (body["titulo_porcentaje_valorado"] = "Porcentaje %")
    : "";

  !("titulo_extranjero" in body)
    ? (body["titulo_extranjero"] = "Extranjero")
    : "";
  !("titulo_nacional" in body) ? (body["titulo_nacional"] = "Nacional") : "";
  !("titulo_total_general" in body)
    ? (body["titulo_total_general"] = "Total General")
    : "";
  !("titulo_instrumento" in body)
    ? (body["titulo_instrumento"] = "Instrumento")
    : "";
  !("titulo_serie" in body) ? (body["titulo_serie"] = "Serie") : "";
  !("titulo_cantidad_valores" in body)
    ? (body["titulo_cantidad_valores"] = "Cantidad de valores")
    : "";
  !("titulo_moneda" in body) ? (body["titulo_moneda"] = "Moneda") : "";
  !("titulo_total_valorado_us" in body)
    ? (body["titulo_total_valorado_us"] = "Total valorado US$")
    : "";
  !("titulo_total_valorado_bs" in body)
    ? (body["titulo_total_valorado_bs"] = "Total valorado en Bs")
    : "";

  // console.log(body);
  //#endregion
  //#endregion
  // console.log(body.header.nameExcel);
  const ws = wb.addWorksheet(body.codeSegurosAux); // HOJA DE INSTITUCION

  const dataReportBody = {
    code: body.codeSegurosAux,
    data: body,
  };
  // console.log(dataReportBody.data);
  bodyCommonStyleReportExcel(ws, wb, dataReportBody);
}

function headerStyleReportExcel(ws, wb, report) {
  if (report.code === "ALI-G" || report.code === "INN-R") {
    const date = report?.data.date;
    const styleDefault = defaultStyleReportExcel(wb, "header");
    cellsBorderStyleReportExcel(4, 1, 6, 3, ws, wb);
    customBorderStyleReportExcel(4, 1, 4, 3, ws, wb, {
      top: { style: "medium" },
    });
    customBorderStyleReportExcel(6, 1, 6, 3, ws, wb, {
      bottom: { style: "medium" },
    });
    customBorderStyleReportExcel(4, 1, 6, 1, ws, wb, {
      left: { style: "medium" },
    });
    customBorderStyleReportExcel(4, 3, 6, 3, ws, wb, {
      right: { style: "medium" },
    });
    ws.column(1).setWidth(70);
    ws.column(2).setWidth(25);
    ws.column(3).setWidth(25);
    ws.column(4).setWidth(25);
    ws.column(5).setWidth(25);
    ws.column(6).setWidth(25);

    ws.cell(1, 1)
      .string(report?.data.title)
      .style({
        ...styleDefault,
        font: {
          ...styleDefault.font,
          size: 12,
        },
      });
    ws.cell(2, 1)
      .string("Fecha del reporte:")
      .style({
        ...styleDefault,
        font: {
          ...styleDefault.font,
          size: 12,
        },
      });
    ws.cell(2, 2)
      .string(dayjs(date).format("DD-MMM-YYYY"))
      .style({
        ...styleDefault,
        font: {
          ...styleDefault.font,
          size: 12,
        },
      });

    ws.cell(4, 1).string("Tipo de Cambio de Compra").style(styleDefault);
    ws.cell(4, 2)
      .string("USD")
      .style(styleDefault)
      .style({
        ...alignTextStyleReportExcel("center"),
        ...customSingleStyleReportExcel(wb, {
          border: {
            right: { style: "thin" },
            left: { style: "thin" },
          },
        }),
      });
    ws.cell(4, 3)
      .number(report?.data.typeOfChange)
      .style(styleDefault)
      .style(alignTextStyleReportExcel("right"));

    ws.cell(5, 1)
      .string("Recursos de Inversión Requeridos en Bs al")
      .style(styleDefault);

    ws.cell(5, 2, 5, 3, true)
      .number(report?.data.amountBs)
      .style(styleDefault)
      .style({
        ...alignTextStyleReportExcel("right"),
        ...customSingleStyleReportExcel(wb, {
          border: {
            left: { style: "thin" },
          },
        }),
      });

    ws.cell(6, 1)
      .string("Recursos de Inversión Requeridos en USD")
      .style(styleDefault);

    ws.cell(6, 2, 6, 3, true)
      .number(report?.data.amountUSD)
      .style(styleDefault)
      .style(alignTextStyleReportExcel("right"))
      .style(
        customSingleStyleReportExcel(wb, {
          fill: { type: "pattern", patternType: "solid", fgColor: "8EA9DB" },
          border: {
            left: { style: "thin" },
          },
        })
      );
  }
}

async function createChart(data, labels, header) {
  const width = 800; //px
  const height = 400; //px
  const backgroundColour = "white"; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour,
  });

  const configuration = {
    type: "pie", // for line chart
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sample 1",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      title: header.title,
      layout: {
        padding: 30,
      },
      interaction: {
        mode: "nearest",
      },
      plugins: {
        legend: {
          position: "right",
          labels: {
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  };

  async function run() {
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl;

    var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");

    const dateChart = dayjs()
      .tz("America/La_Paz")
      .format("DD-MM-YYYY_HH-mm-ss");

    fs.writeFile(
      `reports/charts/${dateChart}.png`,
      base64Data,
      "base64",
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
    return dateChart;
  }
  return await run();
}

async function bodyCommonStyleReportExcel(ws, wb, report) {
  // console.log(report.code);
  if (report.code === "ALI-G" || report.code === "INN-R") {
    const styleDefault = defaultStyleReportExcel(wb, "body");
    let posXInitial = 8;
    let posXIteration = posXInitial;
    let posYInitial = 1;
    let posYIteration = posYInitial;
    const conditionsAux = {
      valores: false,
    };
    // console.log(report?.data);
    forEach(report?.data, (itemRD, indexRD) => {
      if (itemRD.codeSegurosAux === "RIR") {
        ws.cell(posXIteration, posYIteration)
          .string(itemRD?.typeIndicatorFinal)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 1)
          .string(itemRD?.typeCoin)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });

        posXIteration++;
        forEach(itemRD, (itemData, indexData) => {
          if (itemData.codeSeguros === "RIR") {
            if (itemData?.indicador[0] === " ") {
              conditionsAux.valores = true;
            } else {
              conditionsAux.valores = false;
            }
            ws.cell(posXIteration, posYIteration)
              .string(
                !conditionsAux.valores
                  ? ` -   ${trimStart(itemData?.indicador)}`
                  : `${itemData?.indicador}`
              )
              .style(styleDefault)
              .style(
                !conditionsAux.valores
                  ? {
                      ...indentStyleReportExcel(1, 3),
                    }
                  : {
                      ...indentStyleReportExcel(5, 3),
                      ...customSingleStyleReportExcel(wb, {
                        font: {
                          bold: false,
                        },
                      }),
                    }
              )
              .style(
                itemData.indicador === "Valores" ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "thin" },
                        left: { style: "medium" },
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "thin" },
                        left: { style: "medium" },
                      },
                    })
              )
              .style(
                itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            ws.cell(posXIteration, posYIteration + 1)
              .number(parseFloat(itemData?.valor))
              .style({
                ...styleDefault,
                ...customSingleStyleReportExcel(wb, {
                  font: {
                    bold: false,
                  },
                }),
                ...alignTextStyleReportExcel("center"),
              })
              .style(
                itemData.indicador === "Valores" ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                    })
              )
              .style(
                itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            posXIteration++;
          }
        });
      } else if (itemRD.codeSegurosAux === "RIA") {
        ws.cell(posXIteration, posYIteration)
          .string(itemRD?.typeIndicatorFinal)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 1)
          .string(itemRD?.typeCoin)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });

        ws.cell(posXIteration, posYIteration + 2)
          .string(itemRD?.percentageRIR)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 3)
          .string(itemRD?.maxLimit)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 4)
          .string(itemRD?.result)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });

        posXIteration++;
        forEach(itemRD, (itemData, indexData) => {
          if (itemData.codeSeguros === "RIA") {
            ws.cell(posXIteration, posYIteration)
              .string(` -   ${trimStart(itemData?.indicador)}`)
              .style(styleDefault)
              .style({ ...indentStyleReportExcel(1, 3) })
              .style(
                itemData.indicador
                  .toLowerCase()
                  .includes("recursos de inversión admisibles") ||
                  itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "thin" },
                        left: { style: "medium" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "thin" },
                        left: { style: "medium" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.indicador.toLowerCase().includes("menos") ||
                  itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            ws.cell(posXIteration, posYIteration + 1)
              .number(parseFloat(itemData?.ria))
              .style({
                ...styleDefault,
                ...customSingleStyleReportExcel(wb, {
                  font: {
                    bold: false,
                  },
                }),
                ...alignTextStyleReportExcel("center"),
              })
              .style(
                itemData.indicador
                  .toLowerCase()
                  .includes("recursos de inversión admisibles") ||
                  itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            ws.cell(posXIteration, posYIteration + 2)
              .string(itemData?.rir + "%")
              .style({
                ...styleDefault,
                ...customSingleStyleReportExcel(wb, {
                  font: {
                    bold: false,
                  },
                }),
                ...alignTextStyleReportExcel("center"),
              })
              .style(
                itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            ws.cell(posXIteration, posYIteration + 3)
              .string(itemData?.limite_max ? itemData.limite_max + "%" : "")
              .style({
                ...styleDefault,
                ...customSingleStyleReportExcel(wb, {
                  font: {
                    bold: false,
                  },
                }),
                ...alignTextStyleReportExcel("center"),
              })
              .style(
                itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            ws.cell(posXIteration, posYIteration + 4)
              .string(itemData?.resultado)
              .style({
                ...styleDefault,
                ...customSingleStyleReportExcel(wb, {
                  font: {
                    bold: false,
                  },
                }),
                ...alignTextStyleReportExcel("center"),
              })
              .style(
                itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.indicador.toLowerCase().includes("final") ||
                  itemData.indicador.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            posXIteration++;
          }
        });
      } else if (itemRD.codeSegurosAux === "CIG") {
        ws.cell(
          posXIteration,
          posYIteration,
          posXIteration,
          posYIteration + 4,
          true
        )
          .string(itemRD?.typeIndicatorFinal)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        posXIteration++;
        ws.cell(posXIteration, posYIteration)
          .string(itemRD?.details)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 1)
          .string(itemRD?.typeCoin)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });

        ws.cell(posXIteration, posYIteration + 2)
          .string(itemRD?.percentageRIR)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 3)
          .string(itemRD?.maxLimit)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 4)
          .string(itemRD?.result)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });

        posXIteration++;
        forEach(itemRD, (itemData, indexData) => {
          if (itemData.codeSeguros === "CIG") {
            const VALUE_TOTAL =
              itemData.grupo.toLowerCase().includes("final") ||
              itemData.grupo.toLowerCase().includes("total")
                ? {
                    border: {
                      border: {
                        bottom: { style: "medium" },
                      },
                    },
                    fill: customSingleStyleReportExcel(wb, {
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    }),
                    align: alignTextStyleReportExcel("center"),
                    fontBold: (bold = true) => {
                      return customSingleStyleReportExcel(wb, {
                        font: {
                          bold,
                        },
                      });
                    },
                  }
                : {
                    border: {},
                    fill: {},
                    align: alignTextStyleReportExcel("center"),
                    fontBold: () => {
                      return {};
                    },
                  };
            const VALUE_GROUP =
              size(trim(itemData?.descripcion_corta)) > 0
                ? {
                    value: itemData.descripcion_corta,
                    key: "descripcion_corta",
                    indent: { ...indentStyleReportExcel(3, 3) },
                    style: {
                      ...customSingleStyleReportExcel(wb, {
                        border: {
                          bottom: { style: "dashed" },
                          right: { style: "thin" },
                          left: { style: "medium" },
                        },
                      }),
                    },
                    fontBold: (bold = false) => {
                      return customSingleStyleReportExcel(wb, {
                        font: {
                          bold,
                        },
                      });
                    },
                  }
                : size(trim(itemData?.plazo)) > 0
                ? {
                    value: itemData.plazo,
                    key: "plazo",
                    indent: indentStyleReportExcel(2, 3),
                    style: {
                      ...customSingleStyleReportExcel(wb, {
                        border: {
                          bottom: { style: "dashed" },
                          right: { style: "thin" },
                          left: { style: "medium" },
                        },
                      }),
                    },
                    fontBold: (bold = true) => {
                      return customSingleStyleReportExcel(wb, {
                        font: {
                          bold,
                        },
                      });
                    },
                  }
                : size(trim(itemData?.grupo)) > 0
                ? {
                    value: itemData.grupo,
                    key: "grupo",
                    indent: indentStyleReportExcel(1, 2),
                    style: {
                      ...customSingleStyleReportExcel(wb, {
                        border: {
                          top: { style: "medium" },
                          bottom: { style: "medium" },
                          right: { style: "thin" },
                          left: { style: "medium" },
                        },
                      }),
                    },
                    fontBold: (bold = true) => {
                      return customSingleStyleReportExcel(wb, {
                        font: {
                          bold,
                        },
                      });
                    },
                  }
                : {
                    value: "Sin información",
                    key: "",
                    indent: {},
                    style: {},
                    fontBold: (bold) => {
                      return {};
                    },
                  };
            ws.cell(posXIteration, posYIteration)
              .string(`${VALUE_GROUP.value}`)
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.indent)
              .style(VALUE_GROUP.fontBold())
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fontBold());

            ws.cell(posXIteration, posYIteration + 1)
              .number(parseFloat(itemData?.total_usd))
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold())
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fill)
              .style(VALUE_TOTAL.fontBold())
              .style(VALUE_TOTAL.align);
            ws.cell(posXIteration, posYIteration + 2)
              .string(itemData?.rir ? itemData.rir + "%" : "")
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold(false))
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fill)
              .style(VALUE_TOTAL.fontBold())
              .style(VALUE_TOTAL.align);
            ws.cell(posXIteration, posYIteration + 3)
              .string(itemData?.porcentaje ? itemData.porcentaje + "%" : "")
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold(false))
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fill)
              .style(VALUE_TOTAL.fontBold())
              .style(VALUE_TOTAL.align);
            ws.cell(posXIteration, posYIteration + 4)
              .string(itemData?.resultado)
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold(false))
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fill)
              .style(VALUE_TOTAL.fontBold())
              .style(VALUE_TOTAL.align);
            posXIteration++;
          }
        });
      } else if (itemRD.codeSegurosAux === "CIE") {
        ws.cell(
          posXIteration,
          posYIteration,
          posXIteration,
          posYIteration + 4,
          true
        )
          .string(itemRD?.typeIndicatorFinal)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        posXIteration++;
        ws.cell(posXIteration, posYIteration)
          .string(itemRD?.details)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 1)
          .string(itemRD?.typeCoin)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });

        ws.cell(posXIteration, posYIteration + 2)
          .string(itemRD?.percentageRIR)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 3)
          .string(itemRD?.maxLimit)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 4)
          .string(itemRD?.result)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });

        posXIteration++;
        forEach(itemRD, (itemData, indexData) => {
          if (itemData.codeSeguros === "CIE") {
            ws.cell(posXIteration, posYIteration)
              .string(`${itemData?.codigo_rmv}`)
              .style(styleDefault)
              .style({ ...indentStyleReportExcel(1, 3) })
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "thin" },
                        left: { style: "medium" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "thin" },
                        left: { style: "medium" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            ws.cell(posXIteration, posYIteration + 1)
              .number(parseFloat(itemData?.total_usd))
              .style({
                ...styleDefault,
                ...customSingleStyleReportExcel(wb, {
                  font: {
                    bold: false,
                  },
                }),
                ...alignTextStyleReportExcel("center"),
              })
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            ws.cell(posXIteration, posYIteration + 2)
              .string(itemData?.rir + "%")
              .style({
                ...styleDefault,
                ...customSingleStyleReportExcel(wb, {
                  font: {
                    bold: false,
                  },
                }),
                ...alignTextStyleReportExcel("center"),
              })
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            ws.cell(posXIteration, posYIteration + 3)
              .string(itemData?.limite ? itemData.limite + "%" : "")
              .style({
                ...styleDefault,
                ...customSingleStyleReportExcel(wb, {
                  font: {
                    bold: false,
                  },
                }),
                ...alignTextStyleReportExcel("center"),
              })
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            ws.cell(posXIteration, posYIteration + 4)
              .string(itemData?.resultado)
              .style({
                ...styleDefault,
                ...customSingleStyleReportExcel(wb, {
                  font: {
                    bold: false,
                  },
                }),
                ...alignTextStyleReportExcel("center"),
              })
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        top: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: true,
                      },
                    })
                  : customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "dashed" },
                        right: { style: "medium" },
                        left: { style: "thin" },
                      },
                      font: {
                        bold: false,
                      },
                    })
              )
              .style(
                itemData.codigo_rmv.toLowerCase().includes("total")
                  ? customSingleStyleReportExcel(wb, {
                      border: {
                        bottom: { style: "medium" },
                      },
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    })
                  : customSingleStyleReportExcel(wb, {})
              );
            posXIteration++;
          }
        });
      } else if (itemRD.codeSegurosAux === "CEM") {
        ws.cell(
          posXIteration,
          posYIteration,
          posXIteration,
          posYIteration + 4,
          true
        )
          .string(itemRD?.typeIndicatorFinal)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        posXIteration++;
        ws.cell(posXIteration, posYIteration)
          .string(itemRD?.serie)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 1)
          .string(itemRD?.valNominal)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 2)
          .string(itemRD?.percentageEmision)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 3)
          .string(itemRD?.maxLimit)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 4)
          .string(itemRD?.result)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });

        posXIteration++;
        forEach(itemRD, (itemData, indexData) => {
          if (itemData.codeSeguros === "CEM") {
            const VALUE_GROUP =
              size(trim(itemData?.serie)) > 0
                ? {
                    value: itemData.serie,
                    key: "serie",
                    indent: indentStyleReportExcel(3, 3),
                    align: alignTextStyleReportExcel("center"),
                    style: {
                      ...customSingleStyleReportExcel(wb, {
                        border: {
                          bottom: { style: "dashed" },
                          right: { style: "thin" },
                          left: { style: "medium" },
                        },
                      }),
                    },
                    fontBold: (bold = false) => {
                      return customSingleStyleReportExcel(wb, {
                        font: {
                          bold,
                        },
                      });
                    },
                  }
                : size(trim(itemData?.tipo_instrumento)) > 0
                ? {
                    value: itemData.tipo_instrumento,
                    key: "tipo_instrumento",
                    indent: indentStyleReportExcel(1, 2),
                    align: alignTextStyleReportExcel("center"),
                    style: {
                      ...customSingleStyleReportExcel(wb, {
                        border: {
                          top: { style: "medium" },
                          bottom: { style: "medium" },
                          right: { style: "thin" },
                          left: { style: "medium" },
                        },
                      }),
                    },
                    fontBold: (bold = true) => {
                      return customSingleStyleReportExcel(wb, {
                        font: {
                          bold,
                        },
                      });
                    },
                  }
                : {
                    value: "Sin información",
                    key: "",
                    indent: {},
                    style: {},
                    align: {},
                    fontBold: (bold) => {
                      return {};
                    },
                  };
            ws.cell(posXIteration, posYIteration)
              .string(`${VALUE_GROUP.value}`)
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.indent)
              .style(VALUE_GROUP.fontBold());

            ws.cell(posXIteration, posYIteration + 1)
              .number(parseFloat(itemData?.total_usd))
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold())
              .style(VALUE_GROUP.align);
            ws.cell(posXIteration, posYIteration + 2)
              .string(itemData?.emision ? itemData.emision + "%" : "")
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold(false))
              .style(VALUE_GROUP.align);
            ws.cell(posXIteration, posYIteration + 3)
              .string(itemData?.porcentaje ? itemData.porcentaje + "%" : "")
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold(false))
              .style(VALUE_GROUP.align);
            ws.cell(posXIteration, posYIteration + 4)
              .string(itemData?.resultado)
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold(false))
              .style(VALUE_GROUP.align);
            posXIteration++;
          }
        });
      } else if (itemRD.codeSegurosAux === "CIR") {
        ws.cell(
          posXIteration,
          posYIteration,
          posXIteration,
          posYIteration + 4,
          true
        )
          .string(itemRD?.typeIndicatorFinal)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        posXIteration++;
        ws.cell(posXIteration, posYIteration)
          .string(itemRD?.details)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                left: { style: "medium" },
                right: { style: "hair" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 1)
          .string(itemRD?.typeCoin)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 2)
          .string(itemRD?.percentageRIR)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 3)
          .string(itemRD?.maxLimit)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });
        ws.cell(posXIteration, posYIteration + 4)
          .string(itemRD?.result)
          .style(styleDefault)
          .style({
            ...alignTextStyleReportExcel("center"),
            ...customSingleStyleReportExcel(wb, {
              border: {
                top: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
              },
            }),
          });

        posXIteration++;
        forEach(itemRD, (itemData, indexData) => {
          if (itemData.codeSeguros === "CIR") {
            const VALUE_TOTAL =
              itemData.indicador.toLowerCase().includes("final") ||
              itemData.indicador.toLowerCase().includes("total")
                ? {
                    border: {
                      border: {
                        bottom: { style: "medium" },
                      },
                    },
                    fill: customSingleStyleReportExcel(wb, {
                      fill: {
                        type: "pattern",
                        patternType: "solid",
                        fgColor: "8EA9DB",
                      },
                    }),
                    align: alignTextStyleReportExcel("center"),
                    fontBold: (bold = true) => {
                      return customSingleStyleReportExcel(wb, {
                        font: {
                          bold,
                        },
                      });
                    },
                  }
                : {
                    border: {},
                    fill: {},
                    align: alignTextStyleReportExcel("center"),
                    fontBold: () => {
                      return {};
                    },
                  };
            const VALUE_GROUP =
              size(trim(itemData?.indicador)) > 0
                ? {
                    value: itemData.indicador,
                    key: "indicador",
                    indent: indentStyleReportExcel(3, 3),
                    align: alignTextStyleReportExcel("center"),
                    style: {
                      ...customSingleStyleReportExcel(wb, {
                        border: {
                          bottom: { style: "dashed" },
                          right: { style: "thin" },
                          left: { style: "medium" },
                        },
                      }),
                    },
                    fontBold: (bold = false) => {
                      return customSingleStyleReportExcel(wb, {
                        font: {
                          bold,
                        },
                      });
                    },
                  }
                : {
                    value: "Sin información",
                    key: "",
                    indent: {},
                    style: {},
                    align: {},
                    fontBold: (bold) => {
                      return {};
                    },
                  };
            ws.cell(posXIteration, posYIteration)
              .string(`${VALUE_GROUP.value}`)
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.indent)
              .style(VALUE_GROUP.fontBold())
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fontBold());
            ws.cell(posXIteration, posYIteration + 1)
              .number(parseFloat(itemData?.total_usd))
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold())
              .style(VALUE_GROUP.align)
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fill)
              .style(VALUE_TOTAL.fontBold())
              .style(VALUE_TOTAL.align);
            ws.cell(posXIteration, posYIteration + 2)
              .string(itemData?.rir ? itemData.rir + "%" : "")
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold(false))
              .style(VALUE_GROUP.align)
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fill)
              .style(VALUE_TOTAL.fontBold())
              .style(VALUE_TOTAL.align);
            ws.cell(posXIteration, posYIteration + 3)
              .string(itemData?.porcentaje ? itemData.porcentaje + "%" : "")
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold(false))
              .style(VALUE_GROUP.align)
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fill)
              .style(VALUE_TOTAL.fontBold())
              .style(VALUE_TOTAL.align);
            ws.cell(posXIteration, posYIteration + 4)
              .string(itemData?.resultado)
              .style(styleDefault)
              .style(VALUE_GROUP.style)
              .style(VALUE_GROUP.fontBold(false))
              .style(VALUE_GROUP.align)
              .style(VALUE_TOTAL.border)
              .style(VALUE_TOTAL.fill)
              .style(VALUE_TOTAL.fontBold())
              .style(VALUE_TOTAL.align);

            posXIteration++;
          }
        });
      }
      posXIteration += 1;
      posXInitial = posXIteration;
    });
  } else if (report.code === "Boletín Cuadro 1.4") {
    const styleDefault = defaultStyleReportExcel("body");
    let posXInitial = 4;
    let posXIteration = posXInitial;
    let posYInitial = 1;
    let posYIteration = posYInitial;
    const data = report?.data;
    // console.log(data);
    ws.column(1).setWidth(70);
    ws.column(2).setWidth(25);
    ws.column(3).setWidth(30);
    ws.column(4).setWidth(25);
    ws.column(5).setWidth(30);
    ws.column(6).setWidth(25);
    //#region CABECERAS
    const cellHeaderStyle = {
      style: customSingleStyleReportExcel(wb, {
        font: {
          color: "#FFFFFF",
          size: 14,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "366092",
        },
        border: {
          top: { style: "hair" },
          bottom: { style: "hair" },
          left: { style: "hair" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    const cellTitleStyle = {
      style: customSingleStyleReportExcel(wb, {
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "95B3D7",
        },
        border: {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "medium" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 4,
      true
    )
      .string(data?.header.title)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 4,
      true
    )
      .string(data?.header.portfolio)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 4,
      true
    )
      .string(`Expresado en ${data?.header.expressedIn}`)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;

    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration + 1,
      posYIteration,
      true
    )
      .string(data?.typeInstrument)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 1,
      posXIteration,
      posYIteration + 2,
      true
    )
      .string(data?.dateInfoM1)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 1)
      .string(data?.portfolioValueM1)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 2)
      .string(data?.participationM1)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 3,
      posXIteration,
      posYIteration + 4,
      true
    )
      .string(data?.dateInfoM2)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 3)
      .string(data?.portfolioValueM2)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 4)
      .string(data?.participationM2)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    //#endregion
    posXIteration += 2;
    forEach(data, (itemData) => {
      if (itemData.codeSeguros === "Boletín Cuadro 1.4") {
        //#region ESTIDLOS BODY
        const VALUE_TOTAL =
          itemData.tipo_instrumento.toLowerCase().includes("final") ||
          itemData.tipo_instrumento.toLowerCase().includes("total")
            ? {
                border: {
                  border: {
                    bottom: { style: "medium" },
                  },
                },
                fill: customSingleStyleReportExcel(wb, {
                  fill: {
                    type: "pattern",
                    patternType: "solid",
                    fgColor: "8EA9DB",
                  },
                }),
                align: alignTextStyleReportExcel("right"),
                fontBold: (bold = true) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                border: {},
                fill: {},
                align: alignTextStyleReportExcel("right"),
                fontBold: () => {
                  return {};
                },
              };
        const VALUE_GROUP =
          size(trim(itemData?.tipo_instrumento)) > 0
            ? {
                value: itemData.tipo_instrumento,
                key: "tipo_instrumento",
                indent: indentStyleReportExcel(3, 3),
                align: alignTextStyleReportExcel("right"),
                style: {
                  ...customSingleStyleReportExcel(wb, {
                    border: {
                      bottom: { style: "dashed" },
                      right: { style: "thin" },
                      left: { style: "medium" },
                    },
                  }),
                },
                fontBold: (bold = false) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                value: "Sin información",
                key: "",
                indent: {},
                style: {},
                align: {},
                fontBold: (bold) => {
                  return {};
                },
              };
        //#endregion
        ws.cell(posXIteration, posYIteration)
          .string(`${VALUE_GROUP.value}`)
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.indent)
          .style(VALUE_GROUP.fontBold())
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 1)
          .string(
            itemData?.valor_cartera_m1 || itemData?.valor_cartera_m1 === 0
              ? formatoMiles(parseFloat(itemData.valor_cartera_m1).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 2)
          .string(
            itemData?.participacion_m1 || itemData?.participacion_m1 === 0
              ? parseFloat(itemData.participacion_m1).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 3)
          .string(
            itemData?.valor_cartera_m2 || itemData?.valor_cartera_m2 === 0
              ? formatoMiles(parseFloat(itemData.valor_cartera_m2).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 4)
          .string(
            itemData?.participacion_m2 || itemData?.participacion_m2 === 0
              ? parseFloat(itemData.participacion_m2).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        posXIteration++;
      }
    });

    posXIteration += 1;
    posXInitial = posXIteration;

    // const labelsChart = [];
    // forEach(data, (item) => {
    //   if (!item.tipo_instrumento.toLowerCase().includes("total")) {
    //     labelsChart.push(
    //       item.tipo_instrumento + " " + item.participacion_m2 + "%"
    //     );
    //   }
    // });
    // const dataChart = [];
    // forEach(data, (item) => {
    //   if (item?.participacion_m2) {
    //     if (!item.tipo_instrumento.toLowerCase().includes("total")) {
    //       dataChart.push(item.participacion_m2);
    //     }
    //   }
    // });

    // const image = await createChart(dataChart, labelsChart, data.header);
    // const pathImage = path.join("reports/charts", `${image}.png`);
  } else if (report.code === "REP EMISOR TIPO ASEGURADORA") {
    const styleDefault = defaultStyleReportExcel("body");
    let posXInitial = 4;
    let posXIteration = posXInitial;
    let posYInitial = 1;
    let posYIteration = posYInitial;
    const data = report?.data;
    // console.log("data", data);
    ws.column(1).setWidth(20);
    ws.column(2).setWidth(60);
    ws.column(3).setWidth(25);
    ws.column(4).setWidth(25);
    ws.column(5).setWidth(25);
    ws.column(6).setWidth(25);
    ws.column(7).setWidth(25);
    ws.column(8).setWidth(25);
    ws.column(9).setWidth(25);
    ws.column(10).setWidth(25);
    //#region CABECERAS
    const cellHeaderStyle = {
      style: customSingleStyleReportExcel(wb, {
        font: {
          color: "#FFFFFF",
          size: 14,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "366092",
        },
        border: {
          top: { style: "hair" },
          bottom: { style: "hair" },
          left: { style: "hair" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    const cellTitleStyle = {
      style: customSingleStyleReportExcel(wb, {
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "95B3D7",
        },
        border: {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "medium" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    //#region CABECERAS PRINCIPALES
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.header.title)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.header.subtitle1)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.header.subtitle2)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.header.subtitle3)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    //#endregion

    //#region CABECERAS SECUNDARIAS
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration + 1,
      posYIteration,
      true
    )
      .string(data?.titulo_codeEmisor)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 1,
      posXIteration + 1,
      posYIteration + 1,
      true
    )
      .string(data?.titulo_emisor)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 2,
      posXIteration,
      posYIteration + 3,
      true
    )
      .string(data?.titulo_general)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 2)
      .string(data?.titulo_monto_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 3)
      .string(data?.titulo_porcentaje_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 4,
      posXIteration,
      posYIteration + 5,
      true
    )
      .string(data?.titulo_personal)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 4)
      .string(data?.titulo_monto_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 5)
      .string(data?.titulo_porcentaje_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 6,
      posXIteration,
      posYIteration + 7,
      true
    )
      .string(data?.titulo_prepago)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 6)
      .string(data?.titulo_monto_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 7)
      .string(data?.titulo_porcentaje_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 8,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.titulo_entidades)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 8)
      .string(data?.titulo_monto_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 9)
      .string(data?.titulo_porcentaje_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    //#endregion
    //#endregion
    posXIteration += 2;
    forEach(data, (itemData) => {
      if (itemData.codeSeguros === "REP EMISOR TIPO ASEGURADORA") {
        //#region ESTILOS BODY
        const VALUE_TOTAL =
          itemData.codemisor.toLowerCase().includes("final") ||
          itemData.codemisor.toLowerCase().includes("total")
            ? {
                border: {
                  border: {
                    bottom: { style: "medium" },
                  },
                },
                fill: customSingleStyleReportExcel(wb, {
                  fill: {
                    type: "pattern",
                    patternType: "solid",
                    fgColor: "8EA9DB",
                  },
                }),
                align: alignTextStyleReportExcel("right"),
                fontBold: (bold = true) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                border: {},
                fill: {},
                align: alignTextStyleReportExcel("center"),
                fontBold: () => {
                  return {};
                },
              };
        const VALUE_GROUP =
          size(trim(itemData?.codemisor)) > 0
            ? {
                value: itemData.codemisor,
                key: "codemisor",
                indent: indentStyleReportExcel(3, 3),
                align: alignTextStyleReportExcel("right"),
                style: {
                  ...customSingleStyleReportExcel(wb, {
                    border: {
                      bottom: { style: "dashed" },
                      right: { style: "thin" },
                      left: { style: "medium" },
                    },
                  }),
                },
                fontBold: (bold = false) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                value: "Sin información",
                key: "",
                indent: {},
                style: {},
                align: {},
                fontBold: (bold) => {
                  return {};
                },
              };
        //#endregion
        ws.cell(posXIteration, posYIteration)
          .string(`${VALUE_GROUP.value}`)
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.indent)
          .style(VALUE_GROUP.fontBold())
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 1)
          .string(itemData?.emisor)
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 2)
          .string(
            itemData?.sgeneralcartera || itemData?.sgeneralcartera === 0
              ? formatoMiles(parseFloat(itemData.sgeneralcartera).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());
        // number.toLocaleString('es-MX')
        ws.cell(posXIteration, posYIteration + 3)
          .string(
            itemData?.sgeneralporcentaje || itemData?.sgeneralporcentaje === 0
              ? parseFloat(itemData.sgeneralporcentaje).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 4)
          .string(
            itemData?.spersonascartera || itemData?.spersonascartera === 0
              ? formatoMiles(parseFloat(itemData.spersonascartera).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 5)
          .string(
            itemData?.spersonasporcentaje
              ? parseFloat(itemData.spersonasporcentaje).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 6)
          .string(
            itemData?.sprepagocartera || itemData?.sprepagocartera === 0
              ? formatoMiles(parseFloat(itemData.sprepagocartera).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 7)
          .string(
            itemData?.sprepagoporcentaje
              ? parseFloat(itemData.sprepagoporcentaje).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 8)
          .string(
            itemData?.totalsprepagocartera ||
              itemData?.totalsprepagocartera === 0
              ? formatoMiles(
                  parseFloat(itemData.totalsprepagocartera).toFixed(2)
                )
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 9)
          .string(
            itemData?.totalporcentaje
              ? parseFloat(itemData.totalporcentaje).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        posXIteration++;
      }
    });

    posXIteration += 1;
    posXInitial = posXIteration;

    // const labelsChart = [];
    // forEach(data, (item) => {
    //   if (!item.tipo_instrumento.toLowerCase().includes("total")) {
    //     labelsChart.push(
    //       item.tipo_instrumento + " " + item.participacion_m2 + "%"
    //     );
    //   }
    // });
    // const dataChart = [];
    // forEach(data, (item) => {
    //   if (item?.participacion_m2) {
    //     if (!item.tipo_instrumento.toLowerCase().includes("total")) {
    //       dataChart.push(item.participacion_m2);
    //     }
    //   }
    // });

    // const image = await createChart(dataChart, labelsChart, data.header);
    // const pathImage = path.join("reports/charts", `${image}.png`);
  } else if (report.code === "REP EMISOR") {
    const styleDefault = defaultStyleReportExcel("body");
    let posXInitial = 4;
    let posXIteration = posXInitial;
    let posYInitial = 1;
    let posYIteration = posYInitial;
    const data = report?.data;
    // console.log("data", data);
    ws.column(1).setWidth(30);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(30);
    ws.column(4).setWidth(30);
    //#region CABECERAS
    const cellHeaderStyle = {
      style: customSingleStyleReportExcel(wb, {
        font: {
          color: "#FFFFFF",
          size: 14,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "366092",
        },
        border: {
          top: { style: "hair" },
          bottom: { style: "hair" },
          left: { style: "hair" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    const cellTitleStyle = {
      style: customSingleStyleReportExcel(wb, {
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "95B3D7",
        },
        border: {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "medium" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    //#region CABECERAS PRINCIPALES
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 3,
      true
    )
      .string(data?.header.title)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 3,
      true
    )
      .string(data?.header.subtitle1)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 3,
      true
    )
      .string(data?.header.subtitle2)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    //#endregion

    //#region CABECERAS SECUNDARIAS
    ws.cell(posXIteration, posYIteration)
      .string(data?.titulo_emisor)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration, posYIteration + 1)
      .string(data?.titulo_extranjero)
      .style(styleDefault)
      .style(cellTitleStyle.style);
    ws.cell(posXIteration, posYIteration + 2)
      .string(data?.titulo_nacional)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration, posYIteration + 3)
      .string(data?.titulo_total_general)
      .style(styleDefault)
      .style(cellTitleStyle.style);
    //#endregion
    //#endregion
    posXIteration += 1;
    forEach(data, (itemData) => {
      if (itemData.codeSeguros === "REP EMISOR") {
        //#region ESTILOS BODY
        const VALUE_TOTAL =
          itemData.emisor.toLowerCase().includes("final") ||
          itemData.emisor.toLowerCase().includes("total")
            ? {
                border: {
                  border: {
                    bottom: { style: "medium" },
                  },
                },
                fill: customSingleStyleReportExcel(wb, {
                  fill: {
                    type: "pattern",
                    patternType: "solid",
                    fgColor: "8EA9DB",
                  },
                }),
                align: alignTextStyleReportExcel("right"),
                fontBold: (bold = true) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                border: {},
                fill: {},
                align: alignTextStyleReportExcel("center"),
                fontBold: () => {
                  return {};
                },
              };
        const VALUE_GROUP =
          size(trim(itemData?.emisor)) > 0
            ? {
                value: itemData.emisor,
                key: "emisor",
                indent: indentStyleReportExcel(3, 3),
                align: alignTextStyleReportExcel("right"),
                style: {
                  ...customSingleStyleReportExcel(wb, {
                    border: {
                      bottom: { style: "dashed" },
                      right: { style: "thin" },
                      left: { style: "medium" },
                    },
                  }),
                },
                fontBold: (bold = false) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                value: "Sin información",
                key: "",
                indent: {},
                style: {},
                align: {},
                fontBold: (bold) => {
                  return {};
                },
              };
        //#endregion
        ws.cell(posXIteration, posYIteration)
          .string(`${VALUE_GROUP.value}`)
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.indent)
          .style(VALUE_GROUP.fontBold())
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 1)
          .string(
            itemData?.extranjero || itemData?.extranjero === 0
              ? formatoMiles(parseFloat(itemData.extranjero).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 2)
          .string(
            itemData?.nacional || itemData?.nacional === 0
              ? formatoMiles(parseFloat(itemData.nacional).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 3)
          .string(
            itemData?.totalgeneral || itemData?.totalgeneral === 0
              ? formatoMiles(parseFloat(itemData.totalgeneral).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        posXIteration++;
      }
    });

    posXIteration += 1;
    posXInitial = posXIteration;
  } else if (report.code === "TGN-BCB") {
    const styleDefault = defaultStyleReportExcel("body");
    let posXInitial = 4;
    let posXIteration = posXInitial;
    let posYInitial = 1;
    let posYIteration = posYInitial;
    const data = report?.data;
    // console.log("data", data);
    ws.column(1).setWidth(30);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(30);
    ws.column(4).setWidth(30);
    ws.column(5).setWidth(30);
    //#region CABECERAS
    const cellHeaderStyle = {
      style: customSingleStyleReportExcel(wb, {
        font: {
          color: "#FFFFFF",
          size: 14,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "366092",
        },
        border: {
          top: { style: "hair" },
          bottom: { style: "hair" },
          left: { style: "hair" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    const cellTitleStyle = {
      style: customSingleStyleReportExcel(wb, {
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "95B3D7",
        },
        border: {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "medium" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    //#region CABECERAS PRINCIPALES
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 4,
      true
    )
      .string(data?.header.title)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 4,
      true
    )
      .string(data?.header.subtitle1)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 4,
      true
    )
      .string(data?.header.subtitle2)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    //#endregion

    //#region CABECERAS SECUNDARIAS
    ws.cell(posXIteration, posYIteration)
      .string(data?.titulo_instrumento)
      .style(styleDefault)
      .style(cellTitleStyle.style)
      .style(alignTextStyleReportExcel("left"));

    ws.cell(posXIteration, posYIteration + 1)
      .string(data?.titulo_serie)
      .style(styleDefault)
      .style(cellTitleStyle.style)
      .style(alignTextStyleReportExcel("left"));

    ws.cell(posXIteration, posYIteration + 2)
      .string(data?.titulo_cantidad_valores)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration, posYIteration + 3)
      .string(data?.titulo_moneda)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration, posYIteration + 4)
      .string(data?.titulo_total_valorado_us)
      .style(styleDefault)
      .style(cellTitleStyle.style);
    //#endregion
    //#endregion
    posXIteration += 1;
    forEach(data, (itemData) => {
      if (itemData.codeSeguros === "TGN-BCB") {
        //#region ESTILOS BODY
        const VALUE_TOTAL =
          itemData.instrumento.toLowerCase().includes("final") ||
          itemData.instrumento.toLowerCase().includes("total")
            ? {
                border: {
                  border: {
                    bottom: { style: "medium" },
                  },
                },
                fill: customSingleStyleReportExcel(wb, {
                  fill: {
                    type: "pattern",
                    patternType: "solid",
                    fgColor: "8EA9DB",
                  },
                }),
                align: alignTextStyleReportExcel("right"),
                fontBold: (bold = true) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                border: {},
                fill: {},
                align: alignTextStyleReportExcel("center"),
                fontBold: () => {
                  return {};
                },
              };
        const VALUE_GROUP =
          size(trim(itemData?.instrumento)) > 0
            ? {
                value: itemData.instrumento,
                key: "instrumento",
                indent: indentStyleReportExcel(3, 3),
                align: alignTextStyleReportExcel("right"),
                style: {
                  ...customSingleStyleReportExcel(wb, {
                    border: {
                      bottom: { style: "dashed" },
                      right: { style: "thin" },
                      left: { style: "medium" },
                    },
                  }),
                },
                fontBold: (bold = false) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                value: "Sin información",
                key: "",
                indent: {},
                style: {},
                align: {},
                fontBold: (bold) => {
                  return {};
                },
              };
        //#endregion
        ws.cell(posXIteration, posYIteration)
          .string(`${VALUE_GROUP.value}`)
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.indent)
          .style(VALUE_GROUP.fontBold())
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 1)
          .string(itemData?.serie)
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 2)
          .string(`${itemData?.cantidad}`)
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 3)
          .string(
            itemData?.totalvaloradousd || itemData?.totalvaloradousd === 0
              ? formatoMiles(parseFloat(itemData.totalvaloradousd).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 4)
          .string(
            itemData?.totalvaloradobs || itemData?.totalvaloradobs === 0
              ? formatoMiles(parseFloat(itemData.totalvaloradobs).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        posXIteration++;
      }
    });

    posXIteration += 1;
    posXInitial = posXIteration;
  } else if (report.code === "REP INSTRUMENTO TIPO ASEGURADORA") {
    const styleDefault = defaultStyleReportExcel("body");
    let posXInitial = 4;
    let posXIteration = posXInitial;
    let posYInitial = 1;
    let posYIteration = posYInitial;
    const data = report?.data;
    // console.log("data", data);
    ws.column(1).setWidth(20);
    ws.column(2).setWidth(60);
    ws.column(3).setWidth(25);
    ws.column(4).setWidth(25);
    ws.column(5).setWidth(25);
    ws.column(6).setWidth(25);
    ws.column(7).setWidth(25);
    ws.column(8).setWidth(25);
    ws.column(9).setWidth(25);
    ws.column(10).setWidth(25);
    //#region CABECERAS
    const cellHeaderStyle = {
      style: customSingleStyleReportExcel(wb, {
        font: {
          color: "#FFFFFF",
          size: 14,
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "366092",
        },
        border: {
          top: { style: "hair" },
          bottom: { style: "hair" },
          left: { style: "hair" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    const cellTitleStyle = {
      style: customSingleStyleReportExcel(wb, {
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "95B3D7",
        },
        border: {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "medium" },
          right: { style: "hair" },
        },
        ...alignTextStyleReportExcel("center"),
      }),
    };
    //#region CABECERAS PRINCIPALES
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.header.title)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.header.subtitle1)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.header.subtitle2)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.header.subtitle3)
      .style(styleDefault)
      .style(cellHeaderStyle.style);
    posXIteration += 1;
    //#endregion

    //#region CABECERAS SECUNDARIAS
    ws.cell(
      posXIteration,
      posYIteration,
      posXIteration + 1,
      posYIteration,
      true
    )
      .string(data?.titulo_codeEmisor)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 1,
      posXIteration + 1,
      posYIteration + 1,
      true
    )
      .string(data?.titulo_emisor)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 2,
      posXIteration,
      posYIteration + 3,
      true
    )
      .string(data?.titulo_general)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 2)
      .string(data?.titulo_monto_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 3)
      .string(data?.titulo_porcentaje_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 4,
      posXIteration,
      posYIteration + 5,
      true
    )
      .string(data?.titulo_personal)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 4)
      .string(data?.titulo_monto_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 5)
      .string(data?.titulo_porcentaje_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 6,
      posXIteration,
      posYIteration + 7,
      true
    )
      .string(data?.titulo_prepago)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 6)
      .string(data?.titulo_monto_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 7)
      .string(data?.titulo_porcentaje_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(
      posXIteration,
      posYIteration + 8,
      posXIteration,
      posYIteration + 9,
      true
    )
      .string(data?.titulo_entidades)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 8)
      .string(data?.titulo_monto_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    ws.cell(posXIteration + 1, posYIteration + 9)
      .string(data?.titulo_porcentaje_valorado)
      .style(styleDefault)
      .style(cellTitleStyle.style);

    //#endregion
    //#endregion
    posXIteration += 2;
    forEach(data, (itemData) => {
      if (itemData.codeSeguros === "REP INSTRUMENTO TIPO ASEGURADORA") {
        //#region ESTILOS BODY
        const VALUE_TOTAL =
          itemData.codemisor.toLowerCase().includes("final") ||
          itemData.codemisor.toLowerCase().includes("total")
            ? {
                border: {
                  border: {
                    bottom: { style: "medium" },
                  },
                },
                fill: customSingleStyleReportExcel(wb, {
                  fill: {
                    type: "pattern",
                    patternType: "solid",
                    fgColor: "8EA9DB",
                  },
                }),
                align: alignTextStyleReportExcel("right"),
                fontBold: (bold = true) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                border: {},
                fill: {},
                align: alignTextStyleReportExcel("center"),
                fontBold: () => {
                  return {};
                },
              };
        const VALUE_GROUP =
          size(trim(itemData?.codemisor)) > 0
            ? {
                value: itemData.codemisor,
                key: "codemisor",
                indent: indentStyleReportExcel(3, 3),
                align: alignTextStyleReportExcel("right"),
                style: {
                  ...customSingleStyleReportExcel(wb, {
                    border: {
                      bottom: { style: "dashed" },
                      right: { style: "thin" },
                      left: { style: "medium" },
                    },
                  }),
                },
                fontBold: (bold = false) => {
                  return customSingleStyleReportExcel(wb, {
                    font: {
                      bold,
                    },
                  });
                },
              }
            : {
                value: "Sin información",
                key: "",
                indent: {},
                style: {},
                align: {},
                fontBold: (bold) => {
                  return {};
                },
              };
        //#endregion
        ws.cell(posXIteration, posYIteration)
          .string(`${VALUE_GROUP.value}`)
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.indent)
          .style(VALUE_GROUP.fontBold())
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 1)
          .string(itemData?.emisor)
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 2)
          .string(
            itemData?.sgeneralcartera || itemData?.sgeneralcartera === 0
              ? formatoMiles(parseFloat(itemData.sgeneralcartera).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());
        // number.toLocaleString('es-MX')
        ws.cell(posXIteration, posYIteration + 3)
          .string(
            itemData?.sgeneralporcentaje || itemData?.sgeneralporcentaje === 0
              ? parseFloat(itemData.sgeneralporcentaje).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 4)
          .string(
            itemData?.spersonascartera || itemData?.spersonascartera === 0
              ? formatoMiles(parseFloat(itemData.spersonascartera).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 5)
          .string(
            itemData?.spersonasporcentaje
              ? parseFloat(itemData.spersonasporcentaje).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 6)
          .string(
            itemData?.sprepagocartera || itemData?.sprepagocartera === 0
              ? formatoMiles(parseFloat(itemData.sprepagocartera).toFixed(2))
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 7)
          .string(
            itemData?.sprepagoporcentaje
              ? parseFloat(itemData.sprepagoporcentaje).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 8)
          .string(
            itemData?.totalsprepagocartera ||
              itemData?.totalsprepagocartera === 0
              ? formatoMiles(
                  parseFloat(itemData.totalsprepagocartera).toFixed(2)
                )
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        ws.cell(posXIteration, posYIteration + 9)
          .string(
            itemData?.totalporcentaje
              ? parseFloat(itemData.totalporcentaje).toFixed(2) + "%"
              : ""
          )
          .style(styleDefault)
          .style(VALUE_GROUP.style)
          .style(VALUE_GROUP.fontBold(false))
          .style(VALUE_GROUP.align)
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.fontBold());

        posXIteration++;
      }
    });

    posXIteration += 1;
    posXInitial = posXIteration;
  }
}

function StatisticalReport(params) {
  try {
    const { fecha, fields, data, header, mainValues, wb } = params;
    const ws = wb.addWorksheet(header?.name || "Reporte");
    const sizeColumnsAux = [];
    const styleDefaultTitle = defaultStyleReport("ESTADISTICO", "header", wb);
    const styleDefaultSubtitle = defaultStyleReport(
      "ESTADISTICO",
      "subheader",
      wb
    );

    const styleDefaultData = defaultStyleReport("ESTADISTICO", "data", wb);

    let counterSizeSubtitleYAux = 1;
    forEach(fields, (field) => {
      if (isArray(field)) {
        if (size(field) > counterSizeSubtitleYAux)
          counterSizeSubtitleYAux = size(field);
      }
    });

    const maxFields = (fieldsAux) => {
      let counterMax = 0;
      forEach(fieldsAux, (field) => {
        if (isArray(field)) {
          forEach(field, (subfield) => {
            counterMax += 1;
          });
        } else {
          counterMax += 1;
        }
      });
      return counterMax;
    };

    const CONF_POSITIONS = {
      initialX: 1,
      initialY: 1,
      iterationX: 6,
      iterationY: 1,
      columnCounter: 0,
      sizeSubTitleY: counterSizeSubtitleYAux,
      max_X: maxFields(fields),
    };

    addLogoAPS(ws, CONF_POSITIONS); //LOGO

    forEach(header.titles, (title) => {
      ws.cell(
        CONF_POSITIONS.iterationX,
        CONF_POSITIONS.iterationY,
        CONF_POSITIONS.iterationX,
        CONF_POSITIONS.max_X,
        true
      )
        .string(title)
        .style(styleDefaultTitle);
      CONF_POSITIONS.iterationX += 1;
    });

    forEach(fields, (field, index) => {
      let aux = CONF_POSITIONS.sizeSubTitleY > 1 ? 1 : 0;
      if (isArray(field)) {
        ws.cell(
          CONF_POSITIONS.iterationX,
          CONF_POSITIONS.iterationY,
          CONF_POSITIONS.iterationX,
          CONF_POSITIONS.iterationY - 1 + CONF_POSITIONS.sizeSubTitleY,
          true
        )
          .string(separarStringPorCaracter(index, "_", " "))
          .style(styleDefaultSubtitle);

        forEach(field, (subfield) => {
          const sizeColumn = size(subfield) + 10;
          sizeColumnsAux.push({
            indexSize: CONF_POSITIONS.iterationY,
            sizeColumn: sizeColumn,
          });
          ws.column(CONF_POSITIONS.iterationY).setWidth(sizeColumn);
          ws.cell(
            CONF_POSITIONS.iterationX + aux,
            CONF_POSITIONS.iterationY,
            CONF_POSITIONS.iterationX + aux,
            CONF_POSITIONS.iterationY,
            true
          )
            .string(separarStringPorCaracter(subfield, "_", " "))
            .style(styleDefaultSubtitle);
          CONF_POSITIONS.iterationY += 1;
        });
      } else {
        const sizeColumn = size(field) + 10;
        sizeColumnsAux.push({
          indexSize: CONF_POSITIONS.iterationY,
          sizeColumn: sizeColumn,
        });
        ws.column(CONF_POSITIONS.iterationY).setWidth(sizeColumn);
        ws.cell(
          CONF_POSITIONS.iterationX,
          CONF_POSITIONS.iterationY,
          CONF_POSITIONS.iterationX + aux,
          CONF_POSITIONS.iterationY,
          true
        )
          .string(separarStringPorCaracter(field, "_", " "))
          .style(styleDefaultSubtitle);
        CONF_POSITIONS.iterationY += 1;
      }
    });
    CONF_POSITIONS.iterationX += CONF_POSITIONS.sizeSubTitleY > 1 ? 2 : 1;

    CONF_POSITIONS.iterationY = CONF_POSITIONS.initialY;

    const VALUE_TOTAL = defaultStyleReport("ESTADISTICO", "value_total", wb);
    const VALUE_GROUP = defaultStyleReport("ESTADISTICO", "value_group", wb);
    const VALUES_TOTAL_AUX = {
      index: CONF_POSITIONS.iterationX,
      ok: false,
    };
    forEach(data, (itemData) => {
      CONF_POSITIONS.iterationY = CONF_POSITIONS.initialY;
      let counterAux = 0;
      forEach(itemData, (value, index) => {
        const sizeColumnConf = sizeColumnsAux[CONF_POSITIONS.iterationY - 1];
        if (size(value) + 10 > sizeColumnConf.sizeColumn) {
          sizeColumnConf.sizeColumn = size(value) + 10;
          ws.column(CONF_POSITIONS.iterationY).setWidth(size(value) + 10);
        }
        showCellStatisticalReport({
          ws,
          value,
          x: CONF_POSITIONS.iterationX,
          y: CONF_POSITIONS.iterationY,
          styleDefaultData,
          VALUE_TOTAL,
          VALUE_GROUP,
          mainValue: !isUndefined(mainValues?.[counterAux]) ? true : false,
          VALUES_TOTAL_AUX,
        });
        counterAux += 1;
        CONF_POSITIONS.iterationY += 1;
      });
      VALUES_TOTAL_AUX.ok === false
        ? (VALUES_TOTAL_AUX.index += 1)
        : (VALUES_TOTAL_AUX.index += 0);
      CONF_POSITIONS.iterationX += 1;
    });

    return { ok: true };
  } catch (err) {
    return { ok: null, err };
  }
}

function SimpleReport(params) {
  const { wb, data, nameSheet } = params;
  const { headers, values } = data;
  const ws = wb.addWorksheet(nameSheet);
  const styleDefault = defaultStyleReportExcel(wb, "body");
  let posXInitial = 6;
  let posXIteration = posXInitial;
  let posYInitial = 1;
  let posYIteration = posYInitial;
  addLogoAPS(ws, { max_X: size(headers), initialY: posYInitial });
  forEach(values, (itemValue, indexValue) => {
    posYIteration = posYInitial;
    if (indexValue === 0) {
      forEach(headers, (itemHeader, indexHeader) => {
        ws.column(indexHeader + 1).setWidth(30);
        ws.cell(posXIteration, posYIteration)
          .string(itemHeader)
          .style(styleDefault)
          .style(cellHeaderStyleDefault(wb));
        posYIteration += 1;
      });
    } else {
      const VALUES_STYLE = {
        indent: indentStyleReportExcel(3, 3),
        align: alignTextStyleReportExcel("center"),
        style: {
          ...customSingleStyleReportExcel(wb, {
            border: {
              bottom: { style: "dashed" },
              right: { style: "thin" },
              left: { style: "medium" },
            },
          }),
        },
        fontBold: (bold = false) => {
          return customSingleStyleReportExcel(wb, {
            font: {
              bold,
            },
          });
        },
      };
      forEach(itemValue, (itemValue2, indexValue) => {
        showCell({
          value: itemValue2,
          index: indexValue,
          x: posXIteration,
          y: posYIteration,
          ws,
        })
          .style(styleDefault)
          .style(VALUES_STYLE.indent)
          .style(VALUES_STYLE.align)
          .style(VALUES_STYLE.style)
          .style(VALUES_STYLE.fontBold(false));
        posYIteration += 1;
      });
    }
    posXIteration += 1;
  });
}

function showValueInCell(value) {
  if (value instanceof Date) {
    return dayjs(value).format("DD/MM/YYYY");
  } else if (typeof value === "number") {
    return formatoMiles(parseFloat(value).toFixed(2));
  } else {
    return value;
  }
}

function showCell(params) {
  const { ws, index, value, x, y } = params;
  // console.log(!isNaN(value), index, value);
  if (value instanceof Date) {
    return ws.cell(x, y).string(dayjs(value).format("DD/MM/YYYY"));
  } else if (
    typeof value === "number" ||
    (!isNaN(parseFloat(value)) && !isEmpty(value) && index !== "Código")
  ) {
    return ws.cell(x, y).number(parseFloat(value));
  } else {
    return ws.cell(x, y).string(toString(value));
  }
}

function showCellStatisticalReport(params) {
  const {
    ws,
    value,
    x,
    y,
    styleDefaultData,
    VALUE_TOTAL,
    VALUE_GROUP,
    mainValue,
    VALUES_TOTAL_AUX,
  } = params;
  if (value instanceof Date) {
    return ws
      .cell(x, y)
      .string(showValueInCell(value))
      .style(styleDefaultData)
      .style(VALUE_GROUP.border)
      .style(VALUE_GROUP.align("center"))
      .style(VALUE_GROUP.fontBold(false));
  } else if (typeof value === "number" || (!isNaN(value) && !isEmpty(value))) {
    // console.log(VALUES_TOTAL_AUX, value);
    if (VALUES_TOTAL_AUX.ok === true && !isNaN(value)) {
      //TO DO: SEGUIR PROBANDO LOS REPORTES
      return ws
        .cell(VALUES_TOTAL_AUX.index, y)
        .number(parseFloat(value))
        .style(VALUE_GROUP.border)
        .style(VALUE_TOTAL.border)
        .style(VALUE_TOTAL.fill)
        .style(VALUE_GROUP.align("center"))
        .style(VALUE_GROUP.fontBold(true));
    } else {
      return ws
        .cell(x, y)
        .number(parseFloat(value))
        .style(styleDefaultData)
        .style(VALUE_GROUP.border)
        .style(VALUE_GROUP.align("center"))
        .style(VALUE_GROUP.fontBold(false));
    }
  } else {
    const valueAux = toLower(toString(value));
    if (includes(valueAux, "total") || includes(valueAux, "final")) {
      VALUES_TOTAL_AUX.ok = true;
      return ws
        .cell(x, y)
        .string(showValueInCell(value))
        .style(VALUE_TOTAL.border)
        .style(VALUE_TOTAL.fill)
        .style(VALUE_TOTAL.indent(3, 3))
        .style(VALUE_TOTAL.align("left"))
        .style(VALUE_TOTAL.fontBold(true));
    } else {
      if (mainValue === true) {
        return ws
          .cell(x, y)
          .string(showValueInCell(value))
          .style(VALUE_GROUP.border)
          .style(VALUE_GROUP.indent(3, 3))
          .style(VALUE_GROUP.align("left"))
          .style(VALUE_GROUP.fontBold(false));
      } else if (VALUES_TOTAL_AUX.ok === true) {
        return ws
          .cell(VALUES_TOTAL_AUX.index, y)
          .string(showValueInCell(value))
          .style(VALUE_TOTAL.border)
          .style(VALUE_TOTAL.fill)
          .style(VALUE_TOTAL.indent(3, 3))
          .style(VALUE_TOTAL.align("left"))
          .style(VALUE_TOTAL.fontBold(true));
      } else {
        return ws
          .cell(x, y)
          .string(showValueInCell(value))
          .style(VALUE_GROUP.border)
          .style(VALUE_GROUP.align("center"))
          .style(VALUE_GROUP.fontBold(false));
      }
    }
  }
}

function cellHeaderStyleDefault(wb) {
  return customSingleStyleReportExcel(wb, {
    font: {
      color: "#FFFFFF",
      size: 14,
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "366092",
    },
    border: {
      top: { style: "hair" },
      bottom: { style: "hair" },
      left: { style: "hair" },
      right: { style: "hair" },
    },
    ...alignTextStyleReportExcel("center"),
  });
}

function addLogoAPS(ws, CONF_POSITIONS) {
  ws.addImage({
    path: "./assets/aps-logo.png",
    name: "logo",
    type: "picture",
    position: {
      type: "twoCellAnchor",
      from: {
        col: CONF_POSITIONS.max_X,
        colOff: 0,
        row: CONF_POSITIONS.initialY,
        rowOff: 0,
      },
      to: {
        col: CONF_POSITIONS.max_X + 1,
        colOff: 0,
        row: CONF_POSITIONS.initialY + 4,
        rowOff: 0,
      },
    },
  });
}

module.exports = {
  alignTextStyleReportExcel,
  defaultOptionsReportExcel,
  defaultStyleReportExcel,
  headerStyleReportExcel,
  bodyCommonStyleReportExcel,
  formatDataReportExcel,
  singleFormatDataReportExcel,
  formatDataChartsReportExcel,
  SimpleReport,
  createChart,
  StatisticalReport,
};
