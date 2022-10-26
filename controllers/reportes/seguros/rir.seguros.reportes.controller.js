const pool = require("../../../database");
const xl = require("excel4node");
const path = require("path");
const { forEach, map, uniqBy, uniq, findIndex } = require("lodash");

const {
  respErrorServidor500END,
  respDescargarArchivos200,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
} = require("../../../utils/respuesta.utils");
const { EscogerInternoUtil } = require("../../../utils/consulta.utils");
const {
  defaultOptionsReportExcel,
  defaultStyleReportExcel,
  alignTextStyleReportExcel,
  headerStyleReportExcel,
  bodyCommonStyleReportExcel,
} = require("../../../utils/opcionesReportes");

async function ReporteRIR(req, res) {
  try {
    const code = "RIR";
    const { fecha } = req.body;
    const nameExcelExport = "Reporte-APS-RIR.xlsx";
    const titleExcelExport = "Alianza Compañía de Seguros y Reaseguros S.A.";

    //#region OBTENIENDO INFORMACION DE APS_seguros_view_malla_cabecera
    const queryHeaders = EscogerInternoUtil("APS_seguros_view_malla_cabecera", {
      select: ["*"],
      where: [
        {
          key: "fecha",
          value: fecha,
        },
      ],
      orderby: {
        field: "id_entidad",
      },
    });

    const segurosHeaders = await pool
      .query(queryHeaders)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (segurosHeaders.ok === null) {
      respErrorServidor500END(res, segurosHeaders.err);
      return null;
    } else if (segurosHeaders.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, segurosHeaders.result);
      return null;
    }
    //#endregion

    //#region OBTENIENDO TODAS LAS INSTITUCIONES Y CLASIFICANDO IDs UNICAS DE LA TABLA APS_seguros_view_malla_cabecera
    const segurosHeadersUniques = uniqBy(segurosHeaders.result, "id_entidad");

    const segurosRIRIdData = map(segurosHeadersUniques, (item) => {
      const resultItem = `'${item.id_entidad}'`;
      return resultItem;
    });
    //#endregion

    //#region OBTENIENDO INFORMACION DE APS_seguros_view_RIR
    const queryRIR = EscogerInternoUtil("APS_seguros_view_RIR", {
      select: [
        "cod_institucion",
        "fecha_informacion",
        "tipo_indicador",
        "indicador",
        "valor",
        "compra",
        "id_limite",
        "id_indicador",
        "es_indicador",
      ],
      where: [
        {
          key: "fecha_informacion",
          value: fecha,
        },
        {
          key: "cod_institucion",
          valuesWhereIn: segurosRIRIdData,
          whereIn: true,
        },
      ],
      orderby: {
        field: "id_indicador",
      },
    });

    const segurosRIR = await pool
      .query(queryRIR)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (segurosRIR.ok === null) {
      respErrorServidor500END(res, segurosRIR.err);
      return null;
    } else if (segurosRIR.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, segurosRIR.result);
      return null;
    }
    //#endregion
    //#region OBTENIENDO INFORMACION DE APS_seguros_view_RIA
    const queryRIA = EscogerInternoUtil("APS_seguros_view_RIA", {
      select: [
        "id_entidad",
        "fecha",
        "'RECURSOS DE INVERSIÓN ADMISIBLES'",
        "CASE WHEN id_indicador = 9 THEN 'Valores' ELSE indicador END",
        "limite_max",
        "ria",
        "rir",
        "resultado",
      ],
      where: [
        {
          key: "fecha_informacion",
          value: fecha,
        },
        {
          key: "cod_institucion",
          valuesWhereIn: segurosRIRIdData,
          whereIn: true,
        },
      ],
      orderby: {
        field: "id_indicador",
      },
    });

    const segurosRIA = await pool
      .query(queryRIA)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (segurosRIA.ok === null) {
      respErrorServidor500END(res, segurosRIA.err);
      return null;
    } else if (segurosRIA.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, segurosRIA.result);
      return null;
    }
    //#endregion
    //#region OBTENIENDO INFORMACION DE APS_seguros_view_CIG
    const queryCIG = EscogerInternoUtil("APS_seguros_view_CIG", {
      select: [
        "cod_institucion",
        "fecha_informacion",
        "grupo",
        "plazo",
        "descripcion_corta",
        "total_usd",
        "rir",
        "porcentaje",
        "resultado",
      ],
      where: [
        {
          key: "fecha_informacion",
          value: fecha,
        },
        {
          key: "cod_institucion",
          valuesWhereIn: segurosRIRIdData,
          whereIn: true,
        },
      ],
      orderby: {
        field: "cod_institucion",
      },
    });

    const segurosCIG = await pool
      .query(queryCIG)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (segurosCIG.ok === null) {
      respErrorServidor500END(res, segurosCIG.err);
      return null;
    } else if (segurosCIG.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, segurosCIG.result);
      return null;
    }
    //#endregion
    //#region OBTENIENDO INFORMACION DE APS_seguros_view_CIE
    const queryCIE = EscogerInternoUtil("APS_seguros_view_CIE", {
      select: [
        "cod_institucion",
        "fecha_informacion",
        "tipo_indicador",
        "codigo_rmv",
        "total_usd",
        "rir",
        "limite",
        "resultado",
      ],
      where: [
        {
          key: "fecha_informacion",
          value: fecha,
        },
        {
          key: "cod_institucion",
          valuesWhereIn: segurosRIRIdData,
          whereIn: true,
        },
      ],
      orderby: {
        field: "cod_institucion",
      },
    });

    const segurosCIE = await pool
      .query(queryCIE)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (segurosCIE.ok === null) {
      respErrorServidor500END(res, segurosCIE.err);
      return null;
    } else if (segurosCIE.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, segurosCIE.result);
      return null;
    }
    //#endregion

    //#region CLASIFICANDO LAS INSTITUCIONES DE LA TABLA APS_seguros_view_RIR
    const segurosRIRClassified = {};
    let idEntidadAux = null;
    segurosRIR.result.push({
      cod_institucion: "108",
      fecha_informacion: new Date(),
      tipo_indicador: "Peticion de Inversión Reportados",
      indicador: "Detalle de Cartera Inversiones en exceso",
      valor: "3983900.78",
      compra: "6.86000",
      id_limite: 0,
      id_indicador: 10,
    });
    forEach(segurosRIR.result, (item, index) => {
      if (idEntidadAux !== item.cod_institucion) {
        idEntidadAux = item.cod_institucion;
        segurosRIRClassified[idEntidadAux] = [item];
      } else {
        segurosRIRClassified[idEntidadAux] = [
          ...segurosRIRClassified[idEntidadAux],
          item,
        ];
      }
    });
    //#endregion

    const wb = new xl.Workbook(defaultOptionsReportExcel()); //INSTANCIA DEL OBJETO
    const segurosHeadersFinal = [];

    //#region OBTENIENDO EL ARRAY FINAL DE INSTITUCIONES QUE EXISTEN EN RIR
    const segurosRIRUniqued = uniqBy(
      map(segurosRIR.result, (item, index) => {
        return item.cod_institucion;
      }),
      "cod_institucion"
    );

    for (let i = 0; i < segurosHeadersUniques.length; i++) {
      const itemHeaders = segurosHeadersUniques[i];
      for (let j = 0; j < segurosRIRUniqued.length; j++) {
        const itemRIR = segurosRIRUniqued[j];
        if (itemHeaders.id_entidad === parseInt(itemRIR)) {
          segurosHeadersFinal.push(itemHeaders);
        }
      }
    }
    //#endregion

    // segurosHeadersFinal.push({
    //   id_entidad: 108,
    //   institucion: "XDDDDDDDDDD",
    //   fecha: new Date(),
    //   monto_bs: "312198803.96",
    //   monto_usd: "45510029.73",
    //   compra: "6.86000",
    // });
    // console.log("segurosHeadersFinal", segurosHeadersFinal);
    for (const entidad of segurosHeadersFinal) {
      let tipoIndicador = null;
      const indicadoresArray = {};
      const ws = wb.addWorksheet(entidad.id_entidad); // HOJA DE INSTITUCION
      const dataReportHeader = {
        code,
        data: {
          title: entidad.institucion,
          date: entidad.fecha,
          typeOfChange: parseFloat(entidad.compra),
          amountBs: parseFloat(entidad.monto_bs),
          amountUSD: parseFloat(entidad.monto_usd),
        },
      };
      headerStyleReportExcel(ws, wb, dataReportHeader);
      const entidadClassified = segurosRIRClassified[`${entidad.id_entidad}`];

      //#region UNICOS PARA CLASIFICAR INFORMACION DE REPORTE, REGION SIN USAR
      // console.log("segurosRIRClassified", segurosRIRClassified);

      // const typeIndicatorsArray = uniq(
      //   map(entidadClassified, (itemEC, indexEC) => {
      //     return itemEC.tipo_indicador;
      //   })
      // );

      // console.log("typeIndicatorsArray", typeIndicatorsArray);
      // for (const indexEntidad of typeIndicatorsArray) {
      //   for (const dataEntidad of entidadClassified) {
      //     if(dataEntidad)
      //   }
      // }
      //#endregion

      //#region CLASIFICANDO POR TIPO_INDICADOR LA INFORMACION Y TAMBIEN AÑADIENDO TIPO_INDICADOR_FINAL A CADA CLASIFICACION
      for (const dataEntidad of entidadClassified) {
        if (tipoIndicador !== dataEntidad.tipo_indicador) {
          tipoIndicador = dataEntidad.tipo_indicador;
          indicadoresArray[dataEntidad.tipo_indicador] = [dataEntidad];
        } else {
          indicadoresArray[dataEntidad.tipo_indicador] = [
            ...indicadoresArray[dataEntidad.tipo_indicador],
            dataEntidad,
          ];
        }
      }

      forEach(indicadoresArray, (itemI, indexI) => {
        !("typeIndicatorFinal" in itemI)
          ? (itemI["typeIndicatorFinal"] = indexI)
          : "";

        !("typeCoin" in itemI) ? (itemI["typeCoin"] = "USD") : "";
      });
      //#endregion

      // console.log("ARRAY", Object.values(indicadoresArray));
      // console.log("OBJECT", indicadoresArray);
      // console.log("indicadoresArray", indicadoresArray);

      const dataReportBody = {
        code,
        data: Object.values(indicadoresArray),
      };
      forEach(Object.values(indicadoresArray), (itemAux, indexAux) => {
        console.log(itemAux.length);
        forEach(itemAux, (itemAux2, indexAux2) => {});
      });
      // console.log(dataReportBody.data);
      bodyCommonStyleReportExcel(ws, wb, dataReportBody);
    }

    const pathExcel = path.join("reports", nameExcelExport);

    wb.write(pathExcel, (err, stats) => {
      console.log("ERR", err);
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
  ReporteRIR,
};
