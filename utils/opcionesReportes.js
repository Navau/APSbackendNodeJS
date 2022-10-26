const dayjs = require("dayjs");
const { forEach, trimStart } = require("lodash");
require("dayjs/locale/es");

dayjs.locale("es");
marginLeft: "200pt";
function alignTextStyleReportExcel(align) {
  return {
    alignment: {
      horizontal: align,
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

function defaultStyleReportExcel(custom) {
  if (custom === "header") {
    return {
      font: {
        bold: true,
        size: 10,
      },
      alignment: {
        shrinkToFit: true,
        wrapText: true,
        horizontal: "left",
      },
      numberFormat: "#,##0.00; (#,##0.00); -",
    };
  } else if (custom === "body") {
    return {
      font: {
        bold: true,
        size: 10,
      },
      alignment: {
        shrinkToFit: true,
        wrapText: true,
        horizontal: "left",
      },
      numberFormat: "#,##0.00; (#,##0.00); -",
    };
  }
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
  bigBorderStyleReportExcel(x1, y1, x2, y1 + yPlus, ws, wb);
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

function bigBorderStyleReportExcel(
  x1,
  x2,
  y1,
  y2,
  ws,
  wb,
  styleBorder = {
    left: {
      style: "hair",
      color: "black",
    },
    right: {
      style: "hair",
      color: "black",
    },
    top: {
      style: "hair",
      color: "black",
    },
    bottom: {
      style: "hair",
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
function formatDataReportExcel(data, code) {
  const DATA_CODE = {
    RIR: () => {},
  };
  return DATA_CODE[code]();
}

function SUMARExcelReport(x1, x2, y1) {
  let sumaFinal = "+";

  for (let i = x1; i <= x2; i++) {
    sumaFinal += `${toAlpha(y1)}${i}+`;
    console.log("sumaFinal", sumaFinal);
  }
  sumaFinal = sumaFinal.substring(0, sumaFinal.length - 2);
  return sumaFinal;
}

function headerStyleReportExcel(ws, wb, report) {
  console.log(report);
  if (report.code === "RIR") {
    const date = report?.data.date;
    const styleDefault = defaultStyleReportExcel("header");
    bigBorderStyleReportExcel(4, 1, 6, 3, ws, wb);
    customBorderStyleReportExcel(4, 1, 4, 3, ws, wb, {
      top: { style: "thick" },
    });
    customBorderStyleReportExcel(6, 1, 6, 3, ws, wb, {
      bottom: { style: "thick" },
    });
    customBorderStyleReportExcel(4, 1, 6, 1, ws, wb, {
      left: { style: "thick" },
    });
    customBorderStyleReportExcel(4, 3, 6, 3, ws, wb, {
      right: { style: "thick" },
    });
    ws.column(1).setWidth(report?.data.title.length + 10);
    ws.column(2).setWidth(20);
    ws.column(3).setWidth(20);
    ws.column(4).setWidth(20);

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
      .style(alignTextStyleReportExcel("center"));
    ws.cell(4, 3)
      .number(report?.data.typeOfChange)
      .style(styleDefault)
      .style(alignTextStyleReportExcel("right"));

    ws.cell(5, 1)
      .string("Recursos de Inversión Requeridos en Bs al")
      .style(styleDefault);

    ws.cell(5, 3)
      .number(report?.data.amountBs)
      .style(styleDefault)
      .style(alignTextStyleReportExcel("right"));

    ws.cell(6, 1)
      .string("Recursos de Inversión Requeridos en USD")
      .style(styleDefault);

    ws.cell(6, 2, 6, 3, true)
      .number(report?.data.amountUSD)
      .style(styleDefault)
      .style(alignTextStyleReportExcel("right"))
      .style(
        customSingleStyleReportExcel(wb, {
          fill: { type: "pattern", patternType: "solid", fgColor: "CCFFCC" },
        })
      );
  }
}

function bodyCommonStyleReportExcel(ws, wb, report) {
  // console.log(report.data);
  if (report.code === "RIR") {
    const styleDefault = defaultStyleReportExcel("body");
    let posXInitial = 8;
    let posXIteration = posXInitial;
    let posYInitial = 1;
    let posYIteration = posYInitial;
    let posSumaTotalCounter = posXInitial;
    const conditionsAux = {
      valores: false,
    };
    forEach(report?.data, (itemRD, indexRD) => {
      ws.cell(posXIteration, posYIteration)
        .string(itemRD.typeIndicatorFinal)
        .style(styleDefault)
        .style(alignTextStyleReportExcel("center"));
      ws.cell(posXIteration, posYIteration + 1)
        .string(itemRD.typeCoin)
        .style(styleDefault)
        .style(alignTextStyleReportExcel("center"));
      posXIteration++;
      forEach(itemRD, (itemData, indexData) => {
        if (itemData.indicador[0] === " ") {
          conditionsAux.valores = true;
        } else {
          posSumaTotalCounter++;
          conditionsAux.valores = false;
        }
        ws.cell(posXIteration, posYIteration)
          .string(
            !conditionsAux.valores
              ? ` -   ${trimStart(itemData.indicador)}`
              : `${itemData.indicador}`
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
          );
        ws.cell(posXIteration, posYIteration + 1)
          .number(parseFloat(itemData.valor))
          .style({
            ...styleDefault,
            ...customSingleStyleReportExcel(wb, {
              font: {
                bold: false,
              },
            }),
          })
          .style(alignTextStyleReportExcel("center"));
        posXIteration++;
      });
      borderAndCellsCommonReportExcel(
        ws,
        wb,
        posXInitial,
        posXIteration,
        posYInitial,
        1,
        "medium"
      );
      posXIteration += 2;
      posXInitial = posXIteration;
      posSumaTotalCounter = posXIteration;
    });

    // ws.cell(1, 1).string(report?.data.title).style(styleDefault);
    // ws.cell(2, 1).string("Fecha del reporte:").style(styleDefault);
    // ws.cell(2, 2).string(dayjs(date).format("DD-MMM-YYYY")).style(styleDefault);

    // ws.cell(4, 1).string("Tipo de Cambio de Compra").style(styleDefault);
    // ws.cell(4, 2)
    //   .string("USD")
    //   .style(styleDefault)
    //   .style(alignTextStyleReportExcel("center"));
    // ws.cell(4, 3)
    //   .number(report?.data.typeOfChange)
    //   .style(styleDefault)
    //   .style(alignTextStyleReportExcel("right"));

    // ws.cell(5, 1)
    //   .string("Recursos de Inversión Requeridos en Bs al")
    //   .style(styleDefault);

    // ws.cell(5, 2)
    //   .string(dayjs(date).format("DD-MMM"))
    //   .style(styleDefault)
    //   .style(alignTextStyleReportExcel("center"));

    // ws.cell(5, 3)
    //   .number(report?.data.amountBs)
    //   .style(styleDefault)
    //   .style(alignTextStyleReportExcel("right"));

    // ws.cell(6, 1)
    //   .string("Recursos de Inversión Requeridos en USD")
    //   .style(styleDefault);

    // ws.cell(6, 2, 6, 3, true)
    //   .number(report?.data.amountUSD)
    //   .style(styleDefault)
    //   .style(alignTextStyleReportExcel("right"))
    //   .style(
    //     customSingleStyleReportExcel(wb, {
    //       fill: { type: "pattern", patternType: "solid", fgColor: "CCFFCC" },
    //     })
    //   );
  }
}

module.exports = {
  alignTextStyleReportExcel,
  defaultOptionsReportExcel,
  defaultStyleReportExcel,
  headerStyleReportExcel,
  bodyCommonStyleReportExcel,
};
