const multer = require("multer");
const path = require("path");
const { map } = require("lodash");
const fs = require("fs");
const pool = require("../database");
const moment = require("moment");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  EscogerInternoUtil,
  InsertarUtil,
  ActualizarUtil,
  DeshabilitarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  CargarArchivoABaseDeDatosUtil,
  EliminarUtil,
  ResetearIDUtil,
  InsertarVariosUtil,
  ObtenerColumnasDeTablaUtil,
} = require("../utils/consulta.utils");

const {
  respErrorServidor500,
  respErrorMulter500,
  respDatosNoRecibidos400,
  respArchivoErroneo415,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
} = require("../utils/respuesta.utils");
const { SelectInnerJoinSimple } = require("../utils/multiConsulta.utils");

async function obtenerInformacionDeArchivo(nameFile) {
  // console.log("nameFile", nameFile);
  const obtenerInformacionDeArchivoPromise = new Promise(
    async (resolve, reject) => {
      let codeCurrentFile = null;
      let nameTable = null;
      let paramsInstrumento = null;
      let paramsInstrumento135 = null;
      let paramsInstrumento136 = null;
      let paramsCortoPlazo = null;
      let paramsLargoPlazo = null;
      let paramsCodOperacion = null;
      let paramsCodValoracion = null;
      let paramsAccionesMO = null;
      let paramsCodMercado = null;
      let paramsCalfRiesgo = null;
      let paramsCodCustodia = null;
      let paramsTipoCuenta = null;
      let paramsFlujoTotal = null;
      let paramsCantidadPorPrecio = null;
      let paramsMayorACeroEntero = null;
      let paramsMayorACeroDecimal = null;
      let paramsTotalBsMenosPrevisionesInversiones = null;
      let paramsEntidadFinanciera = null;
      let paramsMoneda = null;
      let paramsFechaOperacionMenor = null;
      let paramsTipoDeCambio = null;
      let paramsBolsa = null;
      let paramsTipoValoracion = null;
      let paramsTipoActivo = null;
      let headers = null;

      if (nameFile.includes("K.")) {
        console.log("ARCHIVO CORRECTO : K", nameFile);
        codeCurrentFile = "K";
        nameTable = "APS_aud_carga_archivos_bolsa";
        headers = await formatoArchivo("K");
        paramsBolsa = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 1,
              },
            ],
          },
        };
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135, 137],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes("L.")) {
        console.log("ARCHIVO CORRECTO : L", nameFile);
        codeCurrentFile = "L";
        nameTable = "APS_aud_carga_archivos_bolsa";
        headers = await formatoArchivo("L");
        paramsBolsa = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 1,
              },
            ],
          },
        };
        paramsTipoValoracion = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 31,
              },
            ],
          },
        };
      } else if (nameFile.includes("N.")) {
        console.log("ARCHIVO CORRECTO : N", nameFile);
        codeCurrentFile = "N";
        nameTable = "APS_aud_carga_archivos_bolsa";
        headers = await formatoArchivo("N");
        paramsBolsa = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 1,
              },
            ],
          },
        };
      } else if (nameFile.includes("P.")) {
        console.log("ARCHIVO CORRECTO : P", nameFile);
        codeCurrentFile = "P";
        nameTable = "APS_aud_carga_archivos_bolsa";
        headers = await formatoArchivo("P");
        paramsBolsa = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 1,
              },
            ],
          },
        };
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 138,
              },
            ],
          },
        };
      } else if (nameFile.includes(".413")) {
        console.log("ARCHIVO CORRECTO : 413", nameFile);
        codeCurrentFile = "413";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [125, 214],
                whereIn: true,
              },
            ],
          },
        };
        paramsCodOperacion = {
          table: "APS_param_tipo_operacion",
          params: {
            select: ["codigo_aps"],
            where: [
              {
                key: "tipo",
                value: "V",
              },
            ],
          },
        };
        paramsAccionesMO = true;
        paramsCodMercado = {
          table: "APS_param_lugar_negociacion",
          params: {
            select: ["codigo_aps"],
            where: [
              {
                key: "id_tipo_lugar_negociacion",
                value: 148,
                operator: "<>",
              },
            ],
          },
        };
        paramsCalfRiesgo = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["descripcion"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 5,
              },
            ],
          },
        };
        paramsCodCustodia = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 9,
              },
            ],
          },
        };
      } else if (nameFile.includes(".411")) {
        console.log("ARCHIVO CORRECTO : 411", nameFile);
        codeCurrentFile = "411";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
        paramsCodOperacion = {
          table: "APS_param_tipo_operacion",
          params: {
            select: ["codigo_aps"],
            // where: [
            //   {
            //     key: "tipo",
            //     value: "V",
            //   },
            // ],
          },
        };
        paramsCodMercado = {
          table: "APS_param_lugar_negociacion",
          params: {
            select: ["codigo_aps"],
            where: [
              {
                key: "id_tipo_lugar_negociacion",
                value: 58,
                operator: "<>",
              },
            ],
          },
        };
        paramsCalfRiesgo = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["descripcion"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 6,
              },
            ],
          },
        };
        paramsCodCustodia = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 9,
              },
            ],
          },
        };
      } else if (nameFile.includes(".441")) {
        console.log("ARCHIVO CORRECTO : 441", nameFile);
        codeCurrentFile = "441";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".443")) {
        console.log("ARCHIVO CORRECTO : 443", nameFile);
        codeCurrentFile = "443";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [136],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".44C")) {
        console.log("ARCHIVO CORRECTO : 44C", nameFile);
        codeCurrentFile = "44C";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
            ],
          },
        };
        paramsFlujoTotal = true;
      } else if (nameFile.includes(".451")) {
        console.log("ARCHIVO CORRECTO : 451", nameFile);
        codeCurrentFile = "451";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsTipoCuenta = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 15,
              },
            ],
          },
        };
        paramsEntidadFinanciera = {
          table: "APS_param_emisor",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "id_sector_economico",
                value: 6,
              },
            ],
          },
        };
        paramsMoneda = {
          table: "APS_param_moneda",
          params: {
            select: ["sigla"],
          },
        };
        paramsTipoDeCambio = {
          table: "APS_oper_tipo_cambio",
          params: {
            select: ["fecha", "sigla", "compra"],
            innerjoin: [
              {
                table: "APS_param_moneda",
                on: [
                  {
                    table: "APS_oper_tipo_cambio",
                    key: "id_moneda",
                  },
                  {
                    table: "APS_param_moneda",
                    key: "id_moneda",
                  },
                ],
              },
            ],
          },
        };
      } else if (nameFile.includes(".481")) {
        console.log("ARCHIVO CORRECTO : 481", nameFile);
        codeCurrentFile = "481";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          sparams: {
            select: ["sigla"],
          },
        };
        paramsInstrumento135 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 135,
              },
            ],
          },
        };
        paramsInstrumento136 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
              },
            ],
          },
        };
        paramsLargoPlazo = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["descripcion"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 6,
              },
              {
                key: "sigla",
                value: "LP",
              },
            ],
          },
        };
        paramsCortoPlazo = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["descripcion"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 6,
              },
              {
                key: "sigla",
                value: "CP",
              },
            ],
          },
        };
        paramsCodValoracion = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 138,
              },
            ],
          },
        };
        paramsCalfRiesgo = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["descripcion"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 5,
              },
            ],
          },
        };
        paramsMoneda = {
          table: "APS_param_moneda",
          params: {
            select: ["codigo_valoracion"],
            where: [
              {
                key: "id_moneda",
                value: 5,
                operator: "<>",
              },
            ],
          },
        };
        paramsFechaOperacionMenor = true;
      } else if (nameFile.includes(".482")) {
        console.log("ARCHIVO CORRECTO : 482", nameFile);
        codeCurrentFile = "482";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
        };
        paramsInstrumento135 = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              value: 135,
            },
          ],
        };
        paramsInstrumento136 = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              value: 136,
            },
          ],
        };
        paramsLargoPlazo = {
          table: "APS_param_clasificador_comun",
          select: ["descripcion"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 6,
            },
            {
              key: "sigla",
              value: "LP",
            },
          ],
        };
        paramsCortoPlazo = {
          table: "APS_param_clasificador_comun",
          select: ["descripcion"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 6,
            },
            {
              key: "sigla",
              value: "CP",
            },
          ],
        };
        paramsCodValoracion = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 138,
              },
            ],
          },
        };
        paramsCalfRiesgo = {
          table: "APS_param_clasificador_comun",
          select: ["descripcion"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 5,
            },
          ],
        };
        paramsMoneda = {
          table: "APS_param_moneda",
          params: {
            select: ["codigo_valoracion"],
            where: [
              {
                key: "id_moneda",
                value: 5,
                operator: "<>",
              },
            ],
          },
        };
        paramsFechaOperacionMenor = true;
      } else if (nameFile.includes(".483")) {
        console.log("ARCHIVO CORRECTO : 483", nameFile);
        codeCurrentFile = "483";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsMayorACeroEntero = true;
        paramsMayorACeroDecimal = true;
        paramsCantidadPorPrecio = true;
        paramsTotalBsMenosPrevisionesInversiones = true;
      } else if (nameFile.includes(".484")) {
        console.log("ARCHIVO CORRECTO : 484", nameFile);
        codeCurrentFile = "484";
        nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        headers = await formatoArchivo(codeCurrentFile);
        paramsTipoActivo = {
          table: "APS_param_clasificador_comun",
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 30,
            },
          ],
        };
      } else {
        reject();
      }
      // console.log(codeCurrentFile);
      // console.log(headers);
      resolve({
        codeCurrentFile,
        nameTable,
        headers,
        paramsInstrumento,
        paramsCodOperacion,
        paramsAccionesMO,
        paramsFlujoTotal,
        paramsTipoCuenta,
        paramsEntidadFinanciera,
        paramsMoneda,
        paramsCodMercado,
        paramsCalfRiesgo,
        paramsCodCustodia,
        paramsCodValoracion,
        paramsInstrumento135,
        paramsInstrumento136,
        paramsCortoPlazo,
        paramsLargoPlazo,
        paramsFechaOperacionMenor,
        paramsTipoDeCambio,
        paramsBolsa,
        paramsTipoValoracion,
        paramsMayorACeroEntero,
        paramsMayorACeroDecimal,
        paramsCantidadPorPrecio,
        paramsTotalBsMenosPrevisionesInversiones,
        paramsTipoActivo,
      });
    }
  );
  return obtenerInformacionDeArchivoPromise;
}

async function obtenerCabeceras(table) {
  const obtenerColumnas = new Promise(async (resolve, reject) => {
    let query = ObtenerColumnasDeTablaUtil(table);
    await pool
      .query(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });

  return obtenerColumnas;
}

async function formatoArchivo(type) {
  // console.log("TYPE", type);
  const HEADERS = {
    K: {
      table: "APS_oper_archivo_k",
    },
    L: {
      table: "APS_oper_archivo_l",
    },
    N: {
      table: "APS_oper_archivo_n",
    },
    P: {
      table: "APS_oper_archivo_p",
    },
    413: {
      table: "APS_seguro_archivo_413",
    },
    411: {
      table: "APS_seguro_archivo_411",
    },
    441: {
      table: "APS_seguro_archivo_441",
    },
    443: {
      table: "APS_seguro_archivo_443",
    },
    "44C": {
      table: "APS_seguro_archivo_44C",
    },
    451: {
      table: "APS_seguro_archivo_451",
    },
    481: {
      table: "APS_seguro_archivo_481",
    },
    482: {
      table: "APS_seguro_archivo_482",
    },
  };
  // console.log(HEADERS[type].table);
  let resultFinal = null;
  await obtenerCabeceras(HEADERS[type].table)
    .then((response) => {
      let resultAux = [];
      map(response.rows, (item, index) => {
        resultAux.push(item.column_name);
      });
      resultFinal = resultAux;
    })
    .catch((err) => {
      resultFinal = { err };
    });
  return resultFinal;
}

async function obtenerValidaciones(typeFile) {
  const TYPE_FILES = {
    K: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: false,
        required: true,
        function: "bolsa",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{1,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9]{1,30}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa_promedio",
        pattern: /^(\d{1,8})(\.\d{4,4}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto_negociado",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto_minimo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tipo_marcacion",
        pattern: /^[A-Za-z]{2,2}$/,
        positveNegative: true,
        required: true,
        function: "marcacion",
      },
    ],
    L: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: false,
        required: true,
        function: "bolsa",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto_negociado",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "precio",
        pattern: /^(\d{1,16})(\.\d{4,4}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto_minimo",
        pattern: /^(\d{1,16})(\.\d{4,4}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z]{2,2}$/,
        positveNegative: true,
        required: true,
        function: "tipoValoracion",
      },
    ],
    N: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: false,
        required: true,
        function: "bolsa",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_marcacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(\d{1,8})(\.\d{4,4}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ],
    P: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: false,
        required: true,
        function: "bolsa",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9]{5,30}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "ult_fecha_disponible",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa",
        pattern: /^(\d{1,8})(\.\d{4,4}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_bid",
        pattern: /^(\d{1,16})(\.\d{5,5}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ],
    413: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_operacion",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: false,
        required: true,
        function: "codigoOperacion",
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,5}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "numero_acciones",
        pattern: /^[1-9][0-9]*$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "accionesMonedaOriginal",
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_mercado",
        pattern: /^[A-Za-z0-9,-]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "codigoMercado",
      },
      {
        columnName: "precio_unitario",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z0-9]{1,3}$/,
        positveNegative: true,
        required: true,
        function: "calificacionRiesgo",
      },
      {
        columnName: "codigo_custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "codigoCustodia",
      },
    ],
    411: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_operacion",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "codigoOperacion",
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad_valores",
        pattern: /^[1-9][0-9]*$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(\d{1,3})(\.\d{4,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa_relevante_valoracion",
        pattern: /^(\d{1,12})(\.\d{8,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_negociacion_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_mercado",
        pattern: /^[A-Za-z0-9,-]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "codigoMercado",
      },
      {
        columnName: "precio_unitario",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z0-9]{1,3}$/,
        positveNegative: true,
        required: true,
        function: "calificacionRiesgo",
      },
      {
        columnName: "codigo_custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "codigoCustodia",
      },
    ],
    441: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "precio_nominal_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa_emision",
        pattern: /^(\d{1,12})(\.\d{8,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_emision",
        pattern: /^(\d{5,5}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_cupon",
        pattern: /^([D,M,A])(\d{1,4}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "nro_pago",
        pattern: /^[0-9]{1,3}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tasa_interes_variable",
        pattern: /^(\d{1,2})(\.\d{8,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ],
    443: [
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad_acciones",
        pattern: /^(\d{1,7}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_unitario_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ],
    "44C": [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "nro_cupon",
        pattern: /^(\d{3,3}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "interes",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "amortizacion",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "flujo_total",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "flujoTotal",
      },
      {
        columnName: "saldo_capital",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ],
    451: [
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoCuenta",
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "entidadFinanciera",
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9,-]{5,20}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_cuenta_contable",
        pattern: /^[A-Za-z0-9,-]{1,12}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "moneda",
      },
      {
        columnName: "saldo_mo",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "saldo_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "montoFinalConTipoDeCambio",
      },
    ],
    452: [
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoCuenta",
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "entidadFinanciera",
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9,-]{5,20}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_cuenta_contable",
        pattern: /^[A-Za-z0-9,-]{1,12}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "moneda",
      },
      {
        columnName: "saldo_mo",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "saldo_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "montoFinalConTipoDeCambio",
      },
    ],
    481: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: "codigoValoracionConInstrumento",
      },
      {
        columnName: "tasa_relevante_valoracion",
        pattern: /^([0-9]{0,2})(\.[0-9]{0,8})?$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_valor",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_economico",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "precioTotal",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "codigoMoneda",
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z0-9,-]{1,3}$/,
        positveNegative: true,
        required: true,
        mayBeEmpty: true, //TRUE = PUEDE ESTAR VACIO, FALSE = NO PUEDE ESTAR VACIO
        function: "calificacionRiesgoMultiple",
      },
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: "fechaOperacionMenorAlArchivo",
      },
    ],
    482: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z0-9,-]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        positveNegative: true,
        required: true,
        function: "codigoValoracionConInstrumento",
      },
      {
        columnName: "tasa_relevante_valoracion",
        pattern: /^([0-9]{0,2})(\.[0-9]{0,8})?$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_valor",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plazo_economico",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "precioTotal",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "codigoMoneda",
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,16})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z0-9,-]{1,3}$/,
        positveNegative: true,
        required: true,
        mayBeEmpty: true, //TRUE = PUEDE ESTAR VACIO, FALSE = NO PUEDE ESTAR VACIO
        function: "calificacionRiesgoMultiple",
      },
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: "fechaOperacionMenorAlArchivo",
      },
    ],
    483: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "entidad_emisora",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoInstrumento",
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad",
        pattern: /^\d{1,7}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "precio",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "cantidadPorPrecio",
      },
      {
        columnName: "total_da",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_neto_inversiones_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "totalBsMenosPrevisionesInversiones",
      },
    ],
    484: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoActivo",
      },
      {
        columnName: "detalle_2",
        pattern: /^[A-Za-z0-9,-]{5,25}$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "detalle_2",
        pattern: /^[A-Za-z0-9,-]{5,25}$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[A-Za-z0-9,-]{1,7}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
    ],
    491: [
      //       codigo_contable
      // direccion
      // ciudad
      // fecha_compra
      // superficie
      // nro_registro_ddrr
      // nro_testimonio
      // saldo_anterior
      // incremento
      // decremento
      // fecha
      // altas_bajas
      // actualizacion
      // saldo_final
      // saldo_anterior_depreciacion_acumulada
      // Bajas
      // actualizacion_depreciacion
      // depreciacion_periodo
      // saldo_final_dep
      // valor_neto_bs
      // valor_neto_da
      // valor_neto_ufv
      // total_vida_util
      // vida_util_restante
      // observaciones
      // prevision

      {
        columnName: "codigo_contable",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoActivo",
      },
      {
        columnName: "direccion",
        pattern: /^[A-Za-z0-9,-]{15,300}$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "ciudad",
        pattern: /^[A-Za-z0-9,-]{5,30}$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "superficie",
        pattern: /^[A-Za-z0-9,-]{5,13}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "nro_registro_ddrr",
        pattern: /^[A-Za-z0-9,-]{5,25}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "nro_testimonio",
        pattern: /^[A-Za-z0-9,-]{5,15}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "incremento",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "decremento",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "altas_bajas",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "actualizacion",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "saldoFinalSuma",
      },
      {
        columnName: "saldo_anterior_depreciacion_acumulada",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "bajas",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "actualizacion_depreciacion",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final_dep",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "valor_neto_da",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "valor_neto_ufv",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_vida_util",
        pattern: /^[1-9][0-9]*$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "observaciones",
        pattern: /^[A-Za-z0-9,-]{0,300}$/,
        positveNegative: true,
        required: true,
        mayBeEmpty: true,
        function: null,
      },
      {
        columnName: "prevision",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
    ],
  };

  return TYPE_FILES[typeFile];
}

async function formatearDatosEInsertarCabeceras(headers, dataSplit) {
  const formatearPromise = new Promise((resolve, reject) => {
    let arrayDataObject = [];
    let errors = [];
    headers.splice(0, 1); // ELIMINAR ID DE TABLA

    map(["id_carga_archivos"], (item, index) => {
      let myIndex = headers.indexOf(item);
      if (myIndex !== -1) {
        headers.splice(myIndex, 1);
      }
    }); // ELIMINAR ID CARGA ARCHIVOS

    map(dataSplit, (item, index) => {
      let rowSplit = item.split(",");
      if (item.length === 0) {
        return;
      } else if (
        rowSplit.length > headers.length ||
        rowSplit.length < headers.length
      ) {
        errors.push({
          msg: `El archivo contiene ${rowSplit.length} columnas y la cantidad esperada es de ${headers.length} columnas`,
          row: index,
        });
      } else {
        let resultObject = {};
        let counterAux = 0;
        map(headers, (item2, index2) => {
          resultObject = {
            ...resultObject,
            [item2]: rowSplit[counterAux]?.trim().replace(/['"]+/g, ""), //QUITAR ESPACIOS Y QUITAR COMILLAS DOBLES
          };
          counterAux++;
        });
        arrayDataObject.push(resultObject);
      }
    });

    if (errors.length >= 1) {
      reject({
        err: true,
        errors,
      });
    }
    resolve(arrayDataObject);
  });
  return formatearPromise;
}

async function clasificadorComun(table, params) {
  let query = ListarUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function codigoValoracionConInstrumento(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function tipoInstrumento(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function tipoActivo(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function tipoMarcacion(params) {
  const { monto_negociado, monto_minimo } = params;
  let resultFinal = null;
  if (monto_negociado !== 0 && monto_negociado >= monto_minimo) {
    resultFinal = "AC, NA";
  }
  if (monto_negociado !== 0 && monto_negociado < monto_minimo) {
    resultFinal = "NM";
  }

  return resultFinal;
}

async function accionesMonedaOriginal(params) {
  const { numero_acciones, precio_unitario } = params;

  return parseFloat(numero_acciones) * parseFloat(precio_unitario);
}

async function codigoOperacion(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function codigoMercado(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function calificacionRiesgo(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function mayorACeroEntero(params) {
  const { value } = params;
  try {
    const valueNumber = parseInt(value);
    if (isNaN(valueNumber)) {
      return {
        ok: false,
        message: `El dato no es un numero entero.`,
      };
    } else {
      if (valueNumber > 0) {
        return {
          ok: true,
          message: `El valor si es mayor a 0.`,
        };
      } else {
        return {
          ok: false,
          message: `El valor no es mayor a 0.`,
        };
      }
    }
  } catch (err) {
    return {
      ok: false,
      message: `El tipo de dato no es correcto. ERROR: ${err.message}`,
    };
  }
}

async function mayorACeroDecimal(params) {
  const { value } = params;
  try {
    const valueNumber = parseFloat(value);
    if (isNaN(valueNumber)) {
      return {
        ok: false,
        message: `El dato no es un numero entero.`,
      };
    } else {
      if (valueNumber > 0) {
        return {
          ok: true,
          message: `El valor si es mayor a 0.`,
        };
      } else {
        return {
          ok: false,
          message: `El valor no es mayor a 0.`,
        };
      }
    }
  } catch (err) {
    return {
      ok: false,
      message: `El tipo de dato no es correcto. ERROR: ${err.message}`,
    };
  }
}

async function codigoCustodia(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function flujoTotal(params) {
  const { interes, amortizacion } = params;

  return parseFloat(interes) + parseFloat(amortizacion);
}

async function tipoCuenta(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function entidadFinanciera(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function moneda(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function CortoLargoPlazo(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function calificacionRiesgoConsultaMultiple(params) {
  const {
    tipo_instrumento,
    plazo_valor,
    calificacion_riesgo,
    instrumento135,
    instrumento136,
    cortoPlazo,
    largoPlazo,
    calfRiesgoNormal,
  } = params;
  let resultInstrumento135 = await instrumento135.resultFinal;
  let resultInstrumento136 = await instrumento136.resultFinal;
  let resultCortoPlazo = await cortoPlazo.resultFinal;
  let resultLargoPlazo = await largoPlazo.resultFinal;
  let resultCalfRiesgoNormal = await calfRiesgoNormal.resultFinal;

  let isOkTipoInstrumento = false;
  let isOkCalfRiesgo = false;

  map(resultInstrumento135, (item, index) => {
    if (tipo_instrumento === item.sigla) {
      isOkTipoInstrumento = true;
    }
  });
  if (isOkTipoInstrumento === false) {
    map(resultInstrumento136, (item, index) => {
      if (tipo_instrumento === item.sigla) {
        isOkTipoInstrumento = true;
      }
    });

    if (calificacion_riesgo === "" || calificacion_riesgo.length === 0) {
      return {
        ok: true,
        message: `El contenido esta vacio.`,
      };
    }
    if (isOkTipoInstrumento === true) {
      map(resultCalfRiesgoNormal, (item, index) => {
        if (calificacion_riesgo === item.descripcion) {
          isOkCalfRiesgo = true;
        }
      });
      return {
        ok: isOkCalfRiesgo,
        message: `El contenido del archivo no coincide con alguna clasificación de riesgo en la Renta Variable.`,
      };
    } else {
      return {
        ok: false,
        message: `El contenido del archivo no coincide con alguna sigla de tipo de instrumento de Renta Fija o Renta Variable.`,
      };
    }
  } else {
    if (plazo_valor < 360) {
      map(resultCortoPlazo, (item, index) => {
        if (calificacion_riesgo === item.descripcion) {
          isOkCalfRiesgo = true;
        }
      });
      return {
        ok: isOkCalfRiesgo,
        message: `El contenido del archivo no coincide con alguna descripción de Renta fija a Corto plazo.`,
      };
    } else if (plazo_valor >= 360) {
      map(resultLargoPlazo, (item, index) => {
        if (calificacion_riesgo === item.descripcion) {
          isOkCalfRiesgo = true;
        }
      });
      return {
        ok: isOkCalfRiesgo,
        message: `El contenido del archivo no coincide con alguna descripción de Renta fija a Largo plazo.`,
      };
    } else {
      return {
        ok: isOkCalfRiesgo,
        message: `El contenido del archivo no coincide con alguna descripción de Renta fija a Corto y Largo plazo.`,
      };
    }
  }
}

async function fechaOperacionMenor(params) {
  const { fecha_nombre_archivo, fecha_contenido_operacion } = params;
  let year = fecha_contenido_operacion.substring(0, 4);
  let month = fecha_contenido_operacion.substring(4, 6);
  let day = fecha_contenido_operacion.substring(6, 8);
  let nuevaFechaContenidoOperacion = year + "-" + month + "-" + day;
  let nuevaFechaNombreArchivo = fecha_nombre_archivo;
  // Confirmar que se pudieron interpretar las fechas
  if (
    isNaN(Date.parse(nuevaFechaContenidoOperacion)) &&
    isNaN(Date.parse(nuevaFechaNombreArchivo))
  ) {
    return {
      ok: false,
      message:
        "La fecha de operación del contenido del archivo o la fecha de operación no tiene el formato correcto.",
    };
  } else {
    return {
      ok:
        Date.parse(nuevaFechaContenidoOperacion) <=
        Date.parse(nuevaFechaNombreArchivo),
      message:
        "La fecha de operación del contenido del archivo es mayor a la fecha de operación, lo cual debe ser menor.",
    };
  }
}

async function tipoDeCambio(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function montoFinalConTipoDeCambio(params) {
  const { saldo_mo, saldo_bs, tipo_cambio, errFunction } = params;
  console.log(params);

  if (
    pàrseFloat(saldo_mo) * parseFloat(tipo_cambio.compra) ===
    parseFloat(saldo_bs)
  ) {
    errFunction.ok = true;
  } else {
    errFunction.ok = false;
    errFunction.message =
      "El saldo en moneda original multiplicado por el tipo de cambio no es igual al saldo en bolivianos";
  }
}

async function bolsa(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function tipoValoracion(table, params) {
  let query = EscogerInternoUtil(table, params);
  let resultFinal = null;
  await pool
    .query(query)
    .then((result) => {
      resultFinal = { resultFinal: result.rows };
    })
    .catch((err) => {
      resultFinal = { err };
    })
    .finally(() => {
      return resultFinal;
    });
  return resultFinal;
}

async function cantidadPorPrecio(params) {
  const { cantidad, precio, total_bs } = params;
  try {
    const cantidadValue = parseFloat(cantidad).toFixed(2);
    const precioValue = parseFloat(precio).toFixed(2);
    if (isNaN(cantidadValue) || isNaN(precioValue)) {
      return {
        ok: false,
        message: `La cantidad o el precio no son numeros.`,
      };
    } else {
      const result = cantidadValue * precioValue;
      if (result.toFixed(2) === parseFloat(total_bs).toFixed(2)) {
        return {
          ok: true,
          message: `El valor si es correcto`,
        };
      } else {
        return {
          ok: false,
          message: `La cantidad multiplicado por el precio no es igual al total en bolivianos.`,
        };
      }
    }
  } catch (err) {
    return {
      ok: false,
      message: `El tipo de dato no es correcto. ERROR: ${err.message}`,
    };
  }
}

async function totalBsMenosPrevisionesInversiones(params) {
  const { total_bs, prevision_inversion_bs, total_neto_inversiones_bs } =
    params;
  try {
    const totalBsValue = parseFloat(total_bs).toFixed(2);
    const previsionInversionBsValue = parseFloat(
      prevision_inversion_bs
    ).toFixed(2);
    if (isNaN(totalBsValue) || isNaN(previsionInversionBsValue)) {
      return {
        ok: false,
        message: `La cantidad o el precio no son numeros.`,
      };
    } else {
      const result = totalBsValue - previsionInversionBsValue;
      if (
        result.toFixed(2) === parseFloat(total_neto_inversiones_bs).toFixed(2)
      ) {
        return {
          ok: true,
          message: `El valor si es correcto`,
        };
      } else {
        return {
          ok: false,
          message: `El total en bolivianos restado por la prevision de inversiones en bolivianos no es igual total neto de inversiones en bolivianos.`,
        };
      }
    }
  } catch (err) {
    return {
      ok: false,
      message: `El tipo de dato no es correcto. ERROR: ${err.message}`,
    };
  }
}

async function SaldoAntMasRevaluoMasAltasBajasMasActualizacion(params) {
  const { saldo_anterior, altas_bajas, actualizacion } = params;
}

module.exports = {
  formatoArchivo,
  obtenerValidaciones,
  clasificadorComun,
  tipoMarcacion,
  tipoInstrumento,
  codigoOperacion,
  codigoMercado,
  calificacionRiesgo,
  codigoCustodia,
  accionesMonedaOriginal,
  formatearDatosEInsertarCabeceras,
  obtenerInformacionDeArchivo,
  flujoTotal,
  tipoCuenta,
  entidadFinanciera,
  moneda,
  calificacionRiesgoConsultaMultiple,
  CortoLargoPlazo,
  codigoValoracionConInstrumento,
  fechaOperacionMenor,
  tipoDeCambio,
  montoFinalConTipoDeCambio,
  bolsa,
  tipoValoracion,
  mayorACeroEntero,
  mayorACeroDecimal,
  cantidadPorPrecio,
  totalBsMenosPrevisionesInversiones,
  tipoActivo,
};
