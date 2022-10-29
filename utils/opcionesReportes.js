const dayjs = require("dayjs");
const {
  forEach,
  trimStart,
  map,
  uniqBy,
  uniq,
  findIndex,
  indexOf,
} = require("lodash");
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
function formatDataReportExcel(headers, body, wb) {
  //#region CLASIFICANDO LAS INSTITUCIONES DE body
  const segurosClassified = {};
  let valueIdEntidadAux = null;
  body.push({
    cod_institucion: "301",
    fecha_informacion: new Date(),
    tipo_indicador: "Peticion de Inversión Reportados",
    indicador: "Detalle de Cartera Inversiones en exceso",
    valor: "3983900.78",
    compra: "6.86000",
    id_limite: 0,
    id_indicador: 10,
    codeSeguros: "RIR",
  });
  forEach(body, (item, index) => {
    const idEntidadAux = item?.cod_institucion
      ? item?.cod_institucion
      : item?.id_entidad
      ? item.id_entidad
      : null;
    if (valueIdEntidadAux !== idEntidadAux.toString()) {
      valueIdEntidadAux = idEntidadAux.toString();
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
    const ws = wb.addWorksheet(item.id_entidad); // HOJA DE INSTITUCION
    const dataReportHeader = {
      code: item.id_entidad.toString(),
      data: {
        title: item.institucion,
        date: item.fecha,
        typeOfChange: parseFloat(item.compra),
        amountBs: parseFloat(item.monto_bs),
        amountUSD: parseFloat(item.monto_usd),
      },
    };
    headerStyleReportExcel(ws, wb, dataReportHeader);
    const entidadClassified = segurosClassified[`${item.id_entidad}`];
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

      !("typeCoin" in itemI) ? (itemI["typeCoin"] = "USD") : "";
      !("percentageRIR" in itemI)
        ? (itemI["percentageRIR"] = "En % (RIR)")
        : "";
      !("maxLimit" in itemI) ? (itemI["maxLimit"] = "Límite Máx.") : "";
      !("result" in itemI) ? (itemI["result"] = "Resultado") : "";
    });
    //#endregion

    // console.log("ARRAY", Object.values(indicadoresArray));
    // console.log("OBJECT", indicadoresArray);
    // console.log("indicadoresArray", indicadoresArray);

    const dataReportBody = {
      code: item.id_entidad.toString(),
      data: Object.values(indicadoresArray),
    };
    // console.log(dataReportBody.data);
    bodyCommonStyleReportExcel(ws, wb, dataReportBody);
  });
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
  if (report.code === "108" || report.code === "301") {
    const date = report?.data.date;
    const styleDefault = defaultStyleReportExcel("header");
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
    ws.column(2).setWidth(20);
    ws.column(3).setWidth(20);
    ws.column(4).setWidth(20);
    ws.column(5).setWidth(20);
    ws.column(6).setWidth(20);

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

function bodyCommonStyleReportExcel(ws, wb, report) {
  // console.log(report.data);
  if (report.code === "108" || report.code === "301") {
    const styleDefault = defaultStyleReportExcel("body");
    let posXInitial = 8;
    let posXIteration = posXInitial;
    let posYInitial = 1;
    let posYIteration = posYInitial;
    let posSumaTotalCounter = posXInitial;
    const conditionsAux = {
      valores: false,
    };
    console.log(report?.data);
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
              posSumaTotalCounter++;
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
              .string(itemData?.limite_max)
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
            ws.cell(posXIteration, posYIteration)
              .string(`${itemData?.descripcion_corta}`)
              .style(styleDefault)
              .style({ ...indentStyleReportExcel(1, 2) })
              .style(
                itemData.descripcion_corta
                  .toLowerCase()
                  .includes("deuda bancaria") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("patrimonios autonomos") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("Acciones") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("otros valores") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("inversiones") ||
                  itemData.descripcion_corta.toLowerCase().includes("corto") ||
                  itemData.descripcion_corta.toLowerCase().includes("largo")
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
                itemData.grupo.toLowerCase().includes("total")
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
                itemData.descripcion_corta
                  .toLowerCase()
                  .includes("deuda bancaria") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("patrimonios autonomos") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("Acciones") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("otros valores") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("inversiones") ||
                  itemData.descripcion_corta.toLowerCase().includes("corto") ||
                  itemData.descripcion_corta.toLowerCase().includes("largo")
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
                itemData.grupo.toLowerCase().includes("final") ||
                  itemData.grupo.toLowerCase().includes("total")
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
                itemData.descripcion_corta
                  .toLowerCase()
                  .includes("deuda bancaria") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("patrimonios autonomos") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("Acciones") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("otros valores") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("inversiones") ||
                  itemData.descripcion_corta.toLowerCase().includes("corto") ||
                  itemData.descripcion_corta.toLowerCase().includes("largo")
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
                itemData.grupo.toLowerCase().includes("final") ||
                  itemData.grupo.toLowerCase().includes("total")
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
              .string(itemData?.porcentaje)
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
                itemData.descripcion_corta
                  .toLowerCase()
                  .includes("deuda bancaria") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("patrimonios autonomos") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("Acciones") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("otros valores") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("inversiones") ||
                  itemData.descripcion_corta.toLowerCase().includes("corto") ||
                  itemData.descripcion_corta.toLowerCase().includes("largo")
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
                itemData.grupo.toLowerCase().includes("final") ||
                  itemData.grupo.toLowerCase().includes("total")
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
                itemData.descripcion_corta
                  .toLowerCase()
                  .includes("deuda bancaria") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("patrimonios autonomos") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("Acciones") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("otros valores") ||
                  itemData.descripcion_corta
                    .toLowerCase()
                    .includes("inversiones") ||
                  itemData.descripcion_corta.toLowerCase().includes("corto") ||
                  itemData.descripcion_corta.toLowerCase().includes("largo")
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
                itemData.grupo.toLowerCase().includes("final") ||
                  itemData.grupo.toLowerCase().includes("total")
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
              .string(itemData?.limite)
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
      }
      posXIteration += 1;
      posXInitial = posXIteration;
      posSumaTotalCounter = posXIteration;
    });
  }
}

module.exports = {
  alignTextStyleReportExcel,
  defaultOptionsReportExcel,
  defaultStyleReportExcel,
  headerStyleReportExcel,
  bodyCommonStyleReportExcel,
  formatDataReportExcel,
};
