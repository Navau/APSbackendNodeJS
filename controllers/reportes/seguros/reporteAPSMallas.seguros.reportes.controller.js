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
  formatDataReportExcel,
  singleFormatDataReportExcel,
} = require("../../../utils/opcionesReportes");

async function APSMallas(req, res) {
  try {
    const { fecha } = req.body;
    const nameExcelExport = "Reporte-APS-Mallas-test.xlsx";

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
    const segurosIdData = map(segurosHeadersUniques, (item) => {
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
          valuesWhereIn: segurosIdData,
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
        "'RECURSOS DE INVERSIÓN ADMISIBLES' AS tipo_indicador",
        "CASE WHEN id_indicador = 9 THEN 'Valores' ELSE indicador END",
        "limite_max",
        "ria",
        "rir",
        "resultado",
      ],
      where: [
        {
          key: "fecha",
          value: fecha,
        },
        {
          key: "id_entidad",
          valuesWhereIn: segurosIdData,
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
          valuesWhereIn: segurosIdData,
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
          valuesWhereIn: segurosIdData,
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
    //#region OBTENIENDO INFORMACION DE APS_seguros_view_CEM
    const queryCEM = EscogerInternoUtil("APS_seguros_view_CEM", {
      select: [
        "cod_institucion",
        "fecha_informacion",
        "tipo_instrumento",
        "serie",
        "total_usd",
        "emision",
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
          valuesWhereIn: segurosIdData,
          whereIn: true,
        },
      ],
      orderby: {
        field: "cod_institucion",
      },
    });

    const segurosCEM = await pool
      .query(queryCEM)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (segurosCEM.ok === null) {
      respErrorServidor500END(res, segurosCEM.err);
      return null;
    } else if (segurosCEM.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, segurosCEM.result);
      return null;
    }
    //#endregion
    //#region OBTENIENDO INFORMACION DE APS_seguros_view_CIR
    const queryCIR = EscogerInternoUtil("APS_seguros_view_CIR", {
      select: [
        "cod_institucion",
        "fecha_informacion",
        "tipo_indicador",
        "indicador",
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
          valuesWhereIn: segurosIdData,
          whereIn: true,
        },
      ],
      orderby: {
        field: "cod_institucion, indicador",
      },
    });

    const segurosCIR = await pool
      .query(queryCIR)
      .then((result) => {
        if (result.rowCount > 0) return { ok: true, result: result.rows };
        else return { ok: false, result: result.rows };
      })
      .catch((err) => {
        return { ok: null, err };
      });

    if (segurosCIR.ok === null) {
      respErrorServidor500END(res, segurosCIR.err);
      return null;
    } else if (segurosCIR.ok === false) {
      respResultadoIncorrectoObjeto200(res, null, segurosCIR.result);
      return null;
    }
    //#endregion

    //#region JUNTANDO TODA LA INFORMACION EN segurosDataFinal
    forEach(segurosRIR.result, (itemI) => {
      !("codeSeguros" in itemI) ? (itemI["codeSeguros"] = "RIR") : "";
    });
    forEach(segurosRIA.result, (itemI) => {
      !("codeSeguros" in itemI) ? (itemI["codeSeguros"] = "RIA") : "";
    });
    forEach(segurosCIG.result, (itemI) => {
      !("codeSeguros" in itemI) ? (itemI["codeSeguros"] = "CIG") : "";
    });
    forEach(segurosCIE.result, (itemI) => {
      !("codeSeguros" in itemI) ? (itemI["codeSeguros"] = "CIE") : "";
    });
    forEach(segurosCEM.result, (itemI) => {
      !("codeSeguros" in itemI) ? (itemI["codeSeguros"] = "CEM") : "";
    });
    forEach(segurosCIR.result, (itemI) => {
      !("codeSeguros" in itemI) ? (itemI["codeSeguros"] = "CIR") : "";
    });

    const segurosCEMFinal = singleFormatDataReportExcel(
      "CEM",
      segurosCEM.result
    );
    console.log("TEST");

    const segurosDataFinal = [
      ...segurosRIR.result,
      ...segurosRIA.result,
      ...segurosCIG.result,
      ...segurosCIE.result,
      ...segurosCEMFinal,
      ...segurosCIR.result,
    ];
    //#endregion

    const wb = new xl.Workbook(defaultOptionsReportExcel()); //INSTANCIA DEL OBJETO
    formatDataReportExcel(segurosHeadersUniques, segurosDataFinal, wb);
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
  APSMallas,
};
