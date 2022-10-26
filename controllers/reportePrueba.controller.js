const pool = require("../database");
const xl = require("excel4node");
const path = require("path");
const {
  respErrorServidor500END,
  respDescargarArchivos200,
  respResultadoCorrectoObjeto200,
  respResultadoIncorrectoObjeto200,
} = require("../utils/respuesta.utils");
const { EscogerInternoUtil } = require("../utils/consulta.utils");

async function Reporte(req, res) {
  try {
    const { fecha } = req.body;

    //#region OBTENIENDO INFORMACION DE APS_seguros_view_RIR
    const query = EscogerInternoUtil("APS_seguros_view_RIR", {
      select: ["*"],
      where: [
        {
          key: "fecha_informacion",
          value: fecha,
        },
      ],
    });

    const segurosRIR = await pool
      .query(query)
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

    const nameExcelExport = "test.xlsx";
    const titleExcelExport = "Alianza Compañía de Seguros y Reaseguros S.A.";
    // Create a new instance of a Workbook class
    const wb = new xl.Workbook();

    // Add Worksheets to the workbook
    const ws = wb.addWorksheet("ALI");
    // const ws2 = wb.addWorksheet("Sheet 2");

    // Create a reusable style
    const style = wb.createStyle({
      font: {
        color: "#0A0A0A",
        size: 14,
      },
      alignment: {
        shrinkToFit: true,
        wrapText: true,
      },
      numberFormat: "#,##0.00; (#,##0.00); -",
    });

    const style_centered = wb.createStyle({
      alignment: {
        shrinkToFit: true,
        wrapText: true,
        horizontal: "center",
      },
    });
    const style_right = wb.createStyle({
      alignment: {
        shrinkToFit: true,
        wrapText: true,
        horizontal: "right",
      },
    });

    const style_thinBorder = wb.createStyle({
      border: {
        left: {
          style: "thin",
          color: "black",
        },
        right: {
          style: "thin",
          color: "black",
        },
        top: {
          style: "thin",
          color: "black",
        },
        bottom: {
          style: "thin",
          color: "black",
        },
        outline: false,
      },
    });
    ws.cell(4, 1, 6, 3).style(style_thinBorder);
    ws.cell(4, 1, 4, 3).style({ border: { top: { style: "thick" } } });
    ws.cell(6, 1, 6, 3).style({ border: { bottom: { style: "thick" } } });
    ws.cell(4, 1, 6, 1).style({ border: { left: { style: "thick" } } });
    ws.cell(4, 3, 6, 3).style({ border: { right: { style: "thick" } } });
    ws.column(1).setWidth(titleExcelExport.length + 10);
    ws.column(2).setWidth(20);
    ws.column(3).setWidth(20);
    ws.column(4).setWidth(20);

    ws.cell(1, 1).string(titleExcelExport).style(style);
    ws.cell(2, 1).string("Fecha del reporte:").style(style);
    ws.cell(2, 2).string(fecha).style(style);

    ws.cell(4, 1).string("Tipo de Cambio de Compra").style(style);
    ws.cell(4, 2).string("USD").style(style).style(style_centered);
    ws.cell(4, 3).number(6.86).style(style).style(style_right);

    ws.cell(5, 1)
      .string("Recursos de Inversión Requeridos en Bs al")
      .style(style);
    ws.cell(5, 2).string(fecha).style(style).style(style_centered);
    ws.cell(5, 3).number(312198803.96).style(style).style(style_right);

    ws.cell(6, 1)
      .string("Recursos de Inversión Requeridos en USD")
      .style(style);
    ws.cell(6, 2, 6, 3, true).formula("+C5/C4").style(style).style(style_right);

    const pathExcel = path.join("reports", nameExcelExport);

    wb.write(pathExcel, (err, stats) => {
      console.log("ERR", err);
      //   console.log("stats", stats);
      //   console.log("RIR", segurosRIR);
      if (err) {
        respErrorServidor500END(res, err);
      } else {
        respDescargarArchivos200(res, pathExcel);
      }
    });
  } catch (err) {
    console.log("ERR CATCH", err);
    respErrorServidor500END(res, err);
  }
}

module.exports = {
  Reporte,
};
