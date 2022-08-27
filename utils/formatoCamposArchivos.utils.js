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
      const PARAMS = {
        codeCurrentFile: null,
        nameTable: null,
        paramsInstrumento: null,
        paramsInstrumento135: null,
        paramsInstrumento136: null,
        paramsCartera: null,
        paramsCortoPlazo: null,
        paramsLargoPlazo: null,
        paramsCodOperacion: null,
        paramsCodValoracion: null,
        paramsAccionesMO: null,
        paramsCodMercado: null,
        paramsCalfRiesgo: null,
        paramsCodCustodia: null,
        paramsTipoCuenta: null,
        paramsFlujoTotal: null,
        paramsCantidadPorPrecio: null,
        paramsTotalBsMenosPrevisionesInversiones: null,
        paramsSaldoAntMasAltasBajasMasActualizacion: null,
        paramsSaldoAntMenosBajasMasDepreciacionMesMasActualizacion: null,
        paramsSaldoFinalMesAnteriorBsMasMovimientoMesBs: null,
        paramsDepreciacionPeriodoMasAltasBajasDepreciacion: null,
        paramsCantidadCuotasMultiplicadoCuotaBs: null,
        paramsCantidadValoresMultiplicadoPrecioNegociacion: null,
        paramsEntidadFinanciera: null,
        paramsMoneda: null,
        paramsEmisor: null,
        paramsTipoAmortizacion: null,
        paramsTipoInteres: null,
        paramsTipoTasa: null,
        paramsNroPago: null,
        paramsPlazoCupon: null,
        paramsPrepago: null,
        paramsSubordinado: null,
        paramsCalificacion: null,
        paramsCalificadora: null,
        paramsCustodio: null,
        paramsFechaOperacionMenor: null,
        paramsTipoDeCambio: null,
        paramsBolsa: null,
        paramsTipoValoracion: null,
        paramsTipoActivo: null,
        paramslugarNegociacion: null,
        paramslugarNegociacionVacio: null,
        paramstipoOperacion: null,
        headers: null,
        paramsCadenaCombinadalugarNegTipoOperTipoInstrum: null,
        tipoOperacionCOP: null,
      };

      if (nameFile.includes("K.")) {
        console.log("ARCHIVO CORRECTO : K", nameFile);
        PARAMS.codeCurrentFile = "K";
        PARAMS.nameTable = "APS_aud_carga_archivos_bolsa";
        PARAMS.headers = await formatoArchivo("K");
        PARAMS.paramsBolsa = {
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
        PARAMS.paramsInstrumento = {
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
        PARAMS.codeCurrentFile = "L";
        PARAMS.nameTable = "APS_aud_carga_archivos_bolsa";
        PARAMS.headers = await formatoArchivo("L");
        PARAMS.paramsBolsa = {
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
        PARAMS.paramsTipoValoracion = {
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
        PARAMS.codeCurrentFile = "N";
        PARAMS.nameTable = "APS_aud_carga_archivos_bolsa";
        PARAMS.headers = await formatoArchivo("N");
        PARAMS.paramsBolsa = {
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
        PARAMS.codeCurrentFile = "P";
        PARAMS.nameTable = "APS_aud_carga_archivos_bolsa";
        PARAMS.headers = await formatoArchivo("P");
        PARAMS.paramsBolsa = {
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
        PARAMS.paramsTipoActivo = {
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
      } else if (nameFile.includes(".411")) {
        console.log("ARCHIVO CORRECTO : 411", nameFile);
        PARAMS.codeCurrentFile = "411";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramslugarNegociacion = {
          table: "APS_param_lugar_negociacion",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "id_tipo_lugar_negociacion",
                value: 145,
                operator: "<>",
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramslugarNegociacionVacio = {
          table: "APS_param_tipo_operacion",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "tipo",
                value: "VAR",
                operator: "<>",
              },
              {
                key: "activo",
                value: true,
              },
              {
                key: "es_operacion",
                value: false,
              },
            ],
          },
        };
        PARAMS.paramstipoOperacion = {
          table: "APS_param_tipo_operacion",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "tipo",
                value: "VAR",
                operator: "<>",
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135, 138],
                whereIn: true,
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsCadenaCombinadalugarNegTipoOperTipoInstrum = {
          table: "APS_param_operacion_valida",
          params: {
            select: [
              "lugar_negociacion || tipo_operacion || tipo_instrumento as siglaCombinada",
            ],
            where: [
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.tipoOperacionCOP = true;
        PARAMS.paramsCantidadValoresMultiplicadoPrecioNegociacion = true;
      } else if (nameFile.includes(".412")) {
        console.log("ARCHIVO CORRECTO : 412", nameFile);
        PARAMS.codeCurrentFile = "412";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramslugarNegociacion = {
          table: "APS_param_lugar_negociacion",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "id_tipo_lugar_negociacion",
                valuesWhereIn: [145, 147, 148],
                whereIn: true,
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramslugarNegociacionVacio = {
          table: "APS_param_tipo_operacion",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "tipo",
                value: "VAR",
              },
              {
                key: "activo",
                value: true,
              },
              {
                key: "es_operacion",
                value: false,
              },
            ],
          },
        };
        PARAMS.paramstipoOperacion = {
          table: "APS_param_tipo_operacion",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "tipo",
                value: "VAR",
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [136],
                whereIn: true,
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsCadenaCombinadalugarNegTipoOperTipoInstrum = {
          table: "APS_param_operacion_valida",
          params: {
            select: [
              "lugar_negociacion || tipo_operacion || tipo_instrumento as siglaCombinada",
            ],
            where: [
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.tipoOperacionCOP = true;
        PARAMS.paramsCantidadValoresMultiplicadoPrecioNegociacion = true;
      } else if (nameFile.includes(".413")) {
        console.log("ARCHIVO CORRECTO : 413", nameFile);
        PARAMS.codeCurrentFile = "413";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsCartera = true;
      } else if (nameFile.includes(".441")) {
        console.log("ARCHIVO CORRECTO : 441", nameFile);
        PARAMS.codeCurrentFile = "441";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_grupo",
                valuesWhereIn: [135],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsEmisor = {
          table: "codigo_rmv",
          params: {
            select: ["APS_param_emisor"],
            where: [
              {
                key: "id_pais",
                value: 8,
              },
            ],
          },
        };
        PARAMS.paramsMoneda = {
          table: "APS_param_moneda",
          params: {
            select: ["sigla"],
          },
        };
        PARAMS.paramsTipoAmortizacion = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun",
                value: 25,
              },
            ],
          },
        };
        PARAMS.paramsTipoInteres = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun",
                value: 23,
              },
            ],
          },
        };
        PARAMS.paramsTipoTasa = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun",
                value: 16,
              },
            ],
          },
        };
        PARAMS.paramsNroPago = true;
        PARAMS.paramsPlazoCupon = true;
        PARAMS.paramsPrepago = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun",
                valuesWhereIn: [162, 164],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsSubordinado = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun",
                value: 21,
              },
            ],
          },
        };
        PARAMS.paramsCalificacion = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["descripcion"],
            where: [
              {
                key: "id_clasificador_comun",
                value: 6,
              },
            ],
          },
        };
        PARAMS.paramsCalificadora = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun",
                valuesWhereIn: [7],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsCustodio = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun",
                valuesWhereIn: [9],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".443")) {
        console.log("ARCHIVO CORRECTO : 443", nameFile);
        PARAMS.codeCurrentFile = "443";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [136],
                whereIn: true,
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsEmisor = {
          table: "codigo_rmv",
          params: {
            select: ["APS_param_emisor"],
          },
        };
        PARAMS.paramsMoneda = {
          table: "APS_param_moneda",
          params: {
            select: ["sigla"],
          },
        };
      } else if (nameFile.includes(".444")) {
        console.log("ARCHIVO CORRECTO : 444", nameFile);
        PARAMS.codeCurrentFile = "444";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
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
        PARAMS.paramsFlujoTotal = true;
      } else if (nameFile.includes(".451")) {
        console.log("ARCHIVO CORRECTO : 451", nameFile);
        PARAMS.codeCurrentFile = "451";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsTipoCuenta = {
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
        PARAMS.paramsEntidadFinanciera = {
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
        PARAMS.paramsMoneda = {
          table: "APS_param_moneda",
          params: {
            select: ["sigla"],
          },
        };
        PARAMS.paramsTipoDeCambio = {
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
        PARAMS.codeCurrentFile = "481";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          sparams: {
            select: ["sigla"],
          },
        };
        PARAMS.paramsInstrumento135 = {
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
        PARAMS.paramsInstrumento136 = {
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
        PARAMS.paramsLargoPlazo = {
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
        PARAMS.paramsCortoPlazo = {
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
        PARAMS.paramsCodValoracion = {
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
        PARAMS.paramsCalfRiesgo = {
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
        PARAMS.paramsMoneda = {
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
        PARAMS.paramsFechaOperacionMenor = true;
      } else if (nameFile.includes(".482")) {
        console.log("ARCHIVO CORRECTO : 482", nameFile);
        PARAMS.codeCurrentFile = "482";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
        };
        PARAMS.paramsInstrumento135 = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              value: 135,
            },
          ],
        };
        PARAMS.paramsInstrumento136 = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              value: 136,
            },
          ],
        };
        PARAMS.paramsLargoPlazo = {
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
        PARAMS.paramsCortoPlazo = {
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
        PARAMS.paramsCodValoracion = {
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
        PARAMS.paramsCalfRiesgo = {
          table: "APS_param_clasificador_comun",
          select: ["descripcion"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 5,
            },
          ],
        };
        PARAMS.paramsMoneda = {
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
        PARAMS.paramsFechaOperacionMenor = true;
      } else if (nameFile.includes(".483")) {
        console.log("ARCHIVO CORRECTO : 483", nameFile);
        PARAMS.codeCurrentFile = "483";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsCantidadPorPrecio = true;
        PARAMS.paramsTotalBsMenosPrevisionesInversiones = true;
      } else if (nameFile.includes(".484")) {
        console.log("ARCHIVO CORRECTO : 484", nameFile);
        PARAMS.codeCurrentFile = "484";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsTipoActivo = {
          table: "APS_param_clasificador_comun",
          select: ["sigla"],
          where: [
            {
              key: "id_clasificador_comun_grupo",
              value: 30,
            },
          ],
        };
      } else if (nameFile.includes(".491")) {
        console.log("ARCHIVO CORRECTO : 491", nameFile);
        PARAMS.codeCurrentFile = "491";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsSaldoAntMasAltasBajasMasActualizacion = true;
        PARAMS.paramsSaldoAntMenosBajasMasDepreciacionMesMasActualizacion = true;
      } else if (nameFile.includes(".492")) {
        console.log("ARCHIVO CORRECTO : 492", nameFile);
        PARAMS.codeCurrentFile = "492";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsSaldoAntMasAltasBajasMasActualizacion = true;
        PARAMS.paramsSaldoAntMenosBajasMasDepreciacionMesMasActualizacion = true;
      } else if (nameFile.includes(".494")) {
        console.log("ARCHIVO CORRECTO : 494", nameFile);
        PARAMS.codeCurrentFile = "494";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsSaldoFinalMesAnteriorBsMasMovimientoMesBs = true;
      } else if (nameFile.includes(".496")) {
        console.log("ARCHIVO CORRECTO : 496", nameFile);
        PARAMS.codeCurrentFile = "496";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsDepreciacionPeriodoMasAltasBajasDepreciacion = true;
      } else if (nameFile.includes(".497")) {
        console.log("ARCHIVO CORRECTO : 497", nameFile);
        PARAMS.codeCurrentFile = "497";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsCantidadCuotasMultiplicadoCuotaBs = true;
      } else if (nameFile.includes(".498")) {
        console.log("ARCHIVO CORRECTO : 498", nameFile);
        PARAMS.codeCurrentFile = "498";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
      } else {
        reject();
      }
      // console.log(PARAMS.codeCurrentFile);
      // console.log(PARAMS.headers);
      resolve(PARAMS);
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
    444: {
      table: "APS_seguro_archivo_444",
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
    483: {
      table: "APS_seguro_archivo_483",
    },
    484: {
      table: "APS_seguro_archivo_484",
    },
    491: {
      table: "APS_seguro_archivo_491",
    },
    492: {
      table: "APS_seguro_archivo_492",
    },
    494: {
      table: "APS_seguro_archivo_494",
    },
    496: {
      table: "APS_seguro_archivo_496",
    },
    497: {
      table: "APS_seguro_archivo_497",
    },
    498: {
      table: "APS_seguro_archivo_498",
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
        pattern: /^[A-Za-z0-9,-]{1,30}$/,
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
        function: null,
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
        function: null,
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
        function: "tipoActivo",
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
        pattern: /^(\d{1,11})(\.\d{5,5}){1,1}$/,
        positveNegative: true,
        required: true,
        function: null,
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
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9,-]{0,4}$/,
        positveNegative: true,
        mayBeEmpty: true,
        required: true,
        function: "lugarNegociacion",
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        function: "tipoOperacion",
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
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        positveNegative: true,
        required: true,
        operationNotValid: "tipoOperacionCOP",
        function: null,
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(\d{1,3})(\.\d{4,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_total",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "cantidadValoresMultiplicadoPrecioNegociacion",
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
    ],
    412: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9,-]{0,4}$/,
        positveNegative: true,
        mayBeEmpty: true,
        required: true,
        function: "lugarNegociacion",
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoOperacion",
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
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        positveNegative: true,
        required: true,
        operationNotValid: "tipoOperacionCOP",
        function: null,
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "cantidadValoresMultiplicadoPrecioNegociacion",
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
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
        columnName: "cartera_origen",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "cartera",
      },
      {
        columnName: "cartera_destino",
        pattern: /^[A-Za-z0-9]{3,3}$/,
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
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
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
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "emisor",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "moneda",
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
        columnName: "precio_nominal",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tipo_amortizacion",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "tipoAmortizacion",
      },
      {
        columnName: "tipo_interes",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "tipoInteres",
      },
      {
        columnName: "tipo_tasa",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "tipoTasa",
      },
      {
        columnName: "tasa_emision",
        pattern: /^(\d{1,7})(\.\d{4,4}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        positveNegative: true,
        required: true,
        function: "nroPago",
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        positveNegative: true,
        required: true,
        function: "plazoCupon",
      },
      {
        columnName: "prepago",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "prepago",
      },
      {
        columnName: "subordinado",
        pattern: /^[A-Za-z]{1,1}$/,
        positveNegative: true,
        required: true,
        function: "subordinado",
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9,-]{1,3}$/,
        positveNegative: true,
        required: true,
        function: "calificacion",
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "calificadora",
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "custodio",
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
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "emisor",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: "moneda",
      },
      {
        columnName: "cantidad_acciones",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "precio_unitario",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_total_mo",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_total_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
    ],
    444: [
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
      {
        columnName: "codigo_contable",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
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
        pattern: /^(^-?\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        // function: "operacionEntreColumnas",
        function: "saldoAntMasAltasBajasMasActualizacion",
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
        function: "saldoAntMenosBajasMasDepreciacionMesMasActualizacion",
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
        pattern: /^[\s\S]{0,300}$/,
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
    492: [
      {
        columnName: "codigo_contable",
        pattern: /^[A-Za-z]{3,3}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
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
        pattern: /^(^-?\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "saldoAntMasAltasBajasMasActualizacion",
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
        function: "saldoAntMenosBajasMasDepreciacionMesMasActualizacion",
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
        pattern: /^[\s\S]{0,300}$/,
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
    494: [
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{10,100}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "saldo_final_mes_anterior_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: false,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "movimiento_mes_bs",
        pattern: /^(^-?\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: false,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final_mes_actual_bs",
        pattern: /^(^-?\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "saldoFinalMesAnteriorBsMasMovimientoMesBs",
      },
      {
        columnName: "total",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
    ],
    496: [
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{20,150}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "ubicacion",
        pattern: /^[\s\S]{20,150}$/,
        positveNegative: false,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "cantidad",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        positveNegative: false,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "incremento_revaluo_tecnico",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "decremento_revaluo_tecnico",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "altas_bajas_bienes",
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
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_anterior_depreciacion_acumulada",
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
        columnName: "altas_bajas_depreciacion",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final_depreciacion_acumulada",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "depreciacionPeriodoMasAltasBajasDepreciacion",
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "valor_neto_usd",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_vida_util",
        pattern: /(0|[1-9][0-9]{0,2})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
    ],
    497: [
      {
        columnName: "nombre_rentista",
        pattern: /^[\s\S]{10,50}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "nro_documento_prestamo",
        pattern: /^(^-?\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: false,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_inicio",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "fecha_finalizacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "plazo_prestamo",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tasa_interes_mensual",
        pattern: /^(\d{1,3})(\.\d{8,8}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "frecuencia_pago",
        pattern: /^[A-Za-z0-9,-]{3,7}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "cantidad_cuotas",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "cuota_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_total_prestamo_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "cantidadCuotasMultiplicadoCuotaBs",
      },
      {
        columnName: "amortizacion_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_actual_prestamo_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "intereses_percibidos_bs",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
    ],
    498: [
      {
        columnName: "nro_poliza",
        pattern: /^[A-Za-z0-9,-]{5,10}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "fecha_inicio_prestamo",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "fecha_finalizacion_prestamo",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "asegurado",
        pattern: /^[\s\S]{10,50}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "plan_seguro",
        pattern: /^[\s\S]{10,18}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "monto_total_asegurado",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "valor_rescate_da",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        positveNegative: true,
        required: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "tasa_interes",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_cuota_da",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "plazo",
        pattern: /^[\s\S]{2,8}$/,
        positveNegative: true,
        required: true,
        function: null,
      },
      {
        columnName: "importe_cuota_da",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "altas_bajas_da",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "amortizacion_da",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_actual",
        pattern: /^(\d{1,14})(\.\d{2,2}){1,1}$/,
        positveNegative: true,
        required: true,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "sucursal",
        pattern: /^[\s\S]{5,10}$/,
        positveNegative: true,
        required: true,
        function: null,
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

async function emisor(table, params) {
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

async function tipoAmortizacion(table, params) {
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

async function tipoInteres(table, params) {
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

async function tipoTasa(table, params) {
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

async function plazoCupon(params) {
  const { plazo_cupon, nro_pago } = params;

  if (isNaN(plazo_cupon) || isNaN(nro_pago)) {
    return {
      ok: false,
      message: `El campo plazo_cupon o nro_pago no son numeros.`,
    };
  }

  if (nro_pago > 1) {
    if (plazo_cupon <= 0) {
      return {
        ok: false,
        message: `El campo nro_pago es mayor a 1 por lo tanto plazo_cupon debe ser mayor a 0.`,
      };
    }
  } else if (nro_pago === 1) {
    if (plazo_cupon !== 0) {
      return {
        ok: false,
        message: `El campo nro_pago es igual a 1 por lo tanto plazo_cupon debe ser igual a 0.`,
      };
    }
  }

  return {
    ok: true,
    message: `Valores correctos`,
  };
}

async function prepago(params) {
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

async function subordinado(params) {
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

async function calificacion(params) {
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

async function calificadora(params) {
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

async function custodio(params) {
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
    const cantidadValue = parseFloat(cantidad);
    const precioValue = parseFloat(precio);
    if (isNaN(cantidadValue) || isNaN(precioValue)) {
      return {
        ok: false,
        message: `El campo de cantidad o el precio no son numeros.`,
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
      message: `Ocurrio un error inesperado. ERROR: ${err.message}`,
    };
  }
}

async function totalBsMenosPrevisionesInversiones(params) {
  const { total_neto_inversiones_bs, total_bs, prevision_inversion_bs } =
    params;
  try {
    const totalBsValue = parseFloat(total_bs);
    const previsionInversionBsValue = parseFloat(prevision_inversion_bs);
    if (isNaN(totalBsValue) || isNaN(previsionInversionBsValue)) {
      return {
        ok: false,
        message: `El campo total en bolivianos o la prevision de inversiones no son numeros.`,
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
          message: `El total en bolivianos restado por la prevision de inversiones en bolivianos no es igual a total neto de inversiones en bolivianos.`,
        };
      }
    }
  } catch (err) {
    return {
      ok: false,
      message: `Ocurrio un error inesperado. ERROR: ${err.message}`,
    };
  }
}

async function lugarNegociacion(table, params) {
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

async function tipoOperacion(table, params) {
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

async function saldoAntMasAltasBajasMasActualizacion(params) {
  const { saldo_final, saldo_anterior, altas_bajas, actualizacion } = params;
  try {
    const saldoAnteriorValue = parseFloat(saldo_anterior);
    const altasBajasValue = parseFloat(altas_bajas);
    const actualizacionValue = parseFloat(actualizacion);
    if (
      isNaN(saldoAnteriorValue) ||
      isNaN(altasBajasValue) ||
      isNaN(actualizacionValue)
    ) {
      return {
        ok: false,
        message: `El campo saldo anterior o altas y bajas o actualizacion no son numeros.`,
      };
    } else {
      const result = saldoAnteriorValue + altasBajasValue + actualizacionValue;
      if (result.toFixed(2) === parseFloat(saldo_final).toFixed(2)) {
        return {
          ok: true,
          message: `El valor si es correcto`,
        };
      } else {
        return {
          ok: false,
          message: `El saldo anterior sumado con altas y bajas y sumado con actualizacion no es igual a saldo final.`,
        };
      }
    }
  } catch (err) {
    return {
      ok: false,
      message: `Ocurrio un error inesperado. ERROR: ${err.message}`,
    };
  }
}

async function saldoAntMenosBajasMasDepreciacionMesMasActualizacion(params) {
  const {
    saldo_final_dep,
    saldo_anterior,
    bajas,
    depreciacion_periodo,
    actualizacion,
  } = params;
  try {
    const saldoAnteriorValue = parseFloat(saldo_anterior);
    const bajasValue = parseFloat(bajas);
    const actualizacionValue = parseFloat(actualizacion);
    const depreciacionPreiodoValue = parseFloat(depreciacion_periodo);
    if (
      isNaN(saldoAnteriorValue) ||
      isNaN(bajasValue) ||
      isNaN(actualizacionValue) ||
      isNaN(depreciacionPreiodoValue)
    ) {
      return {
        ok: false,
        message: `El campo saldo anterior o bajas o actualizacion o periodo de depreciacion no son numeros.`,
      };
    } else {
      const result =
        saldoAnteriorValue -
        bajasValue +
        depreciacionPreiodoValue +
        actualizacionValue;
      if (result.toFixed(2) === parseFloat(saldo_final_dep).toFixed(2)) {
        return {
          ok: true,
          message: `El valor si es correcto`,
        };
      } else {
        return {
          ok: false,
          message: `El saldo anterior restado con bajas sumado con periodo de depreciacion y sumado con actualizacion no es igual a saldo final dep.`,
        };
      }
    }
  } catch (err) {
    return {
      ok: false,
      message: `Ocurrio un error inesperado. ERROR: ${err.message}`,
    };
  }
}

async function saldoFinalMesAnteriorBsMasMovimientoMesBs(params) {
  const {
    saldo_final_mes_actual_bs,
    saldo_final_mes_anterior_bs,
    movimiento_mes_bs,
  } = params;
  try {
    const saldoFinalMesAnteriorBsValue = parseFloat(
      saldo_final_mes_anterior_bs
    );
    const movimientoMesBsValue = parseFloat(movimiento_mes_bs);
    if (isNaN(saldoFinalMesAnteriorBsValue) || isNaN(movimientoMesBsValue)) {
      return {
        ok: false,
        message: `El campo saldo final del mes anterior en bolivianos o el movimiento de mes en bolivianos no son numeros.`,
      };
    } else {
      const result = saldoFinalMesAnteriorBsValue + movimientoMesBsValue;
      if (
        result.toFixed(2) === parseFloat(saldo_final_mes_actual_bs).toFixed(2)
      ) {
        return {
          ok: true,
          message: `El valor si es correcto`,
        };
      } else {
        return {
          ok: false,
          message: `El  saldo final del mes anterior en bolivianos sumado con el movimiento de mes en bolivianos no es igual a saldo final del mes actual en bolivianos.`,
        };
      }
    }
  } catch (err) {
    return {
      ok: false,
      message: `Ocurrio un error inesperado. ERROR: ${err.message}`,
    };
  }
}

async function depreciacionPeriodoMasAltasBajasDepreciacion(params) {
  const {
    saldo_final_depreciacion_acumulada,
    depreciacion_periodo,
    altas_bajas_depreciacion,
  } = params;
  try {
    const depreciacionPeriodoValue = parseFloat(depreciacion_periodo);
    const altasBajasDepreciacionValue = parseFloat(altas_bajas_depreciacion);
    if (isNaN(depreciacionPeriodoValue) || isNaN(altasBajasDepreciacionValue)) {
      return {
        ok: false,
        message: `El campo depreciacion de periodo o altas y bajas de depreciacion no son numeros.`,
      };
    } else {
      const result = depreciacionPeriodoValue + altasBajasDepreciacionValue;
      if (
        result.toFixed(2) ===
        parseFloat(saldo_final_depreciacion_acumulada).toFixed(2)
      ) {
        return {
          ok: true,
          message: `El valor si es correcto`,
        };
      } else {
        return {
          ok: false,
          message: `La depreciacion de periodo sumado con las altas y bajas de depreciacion no es igual a saldo final de depreciacion acumulada .`,
        };
      }
    }
  } catch (err) {
    c;
  }
}

async function operacionEntreColumnas(params) {
  const { total, operators, fields } = params;
  try {
    // console.log("total", total);
    // console.log("operators", operators);
    // console.log("fields", fields);
    let fieldsErrorText = "";
    let result = fields[0].value;
    let fieldsResultText = `${fields[0].key}`;

    map(fields, (item, index) => {
      if (isNaN(parseFloat(item.value)) && index % 2 === 0) {
        fieldsErrorText += `${item.key} o`;
      }
    });
    console.log("fieldsErrorText", fieldsErrorText);
    if (fieldsErrorText.length >= 1) {
      return {
        ok: false,
        message: `El campo ${fieldsErrorText} no son numeros validos.`,
      };
    }

    map(fields, (item, index) => {
      if (index % 2 !== 0) {
        const operator = fields[index];
        if (operator === "+") {
          result = result + fields[index + 1].value;
          index !== fields.length - 1 && (fieldsResultText += ` sumado con `);
          fieldsResultText += `${fields[index + 1].key}`;
        } else if (operator === "-") {
          result = result - fields[index + 1].value;
          index !== fields.length - 1 && (fieldsResultText += ` restado con `);
          fieldsResultText += `${fields[index + 1].key}`;
        } else if (operator === "*") {
          result = result * fields[index + 1].value;
          index !== fields.length - 1 &&
            (fieldsResultText += `multiplicado con `);
          fieldsResultText += `${fields[index + 1].key}`;
        } else if (operator === "/") {
          result = result / fields[index + 1].value;
          index !== fields.length - 1 && (fieldsResultText += ` dividido con `);
          fieldsResultText += `${fields[index + 1].key}`;
        } else {
          result = result + fields[index + 1].value;
          index !== fields.length - 1 && (fieldsResultText += ` sumado con `);
          fieldsResultText += `${fields[index + 1].key}`;
        }
      }
    });

    // console.log("fieldsResultText", fieldsResultText);
    // console.log("result", result.toFixed(2));
    // console.log(parseFloat(total.value).toFixed(2));

    if (result.toFixed(2) === parseFloat(total.value).toFixed(2)) {
      return {
        ok: true,
        message: `El valor si es correcto`,
      };
    } else {
      return {
        ok: false,
        message: `El resultado de ${fieldsResultText} no es igual a ${total.key}.`,
      };
    }
  } catch (err) {
    return {
      ok: false,
      message: `Ocurrio un error inesperado. ERROR: ${err.message}`,
    };
  }
}

async function cadenaCombinadalugarNegTipoOperTipoInstrum(table, params) {
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

async function cartera(params) {
  const { cartera_origen, cartera_destino } = params;

  const ALLOWED_VALUES_1 = {
    cartera_origen: ["481", "482", "483"],
    cartera_destino: ["481", "482", "483"],
  };
  const ALLOWED_VALUES_2 = {
    cartera_origen: ["484", "485", "486"],
    cartera_destino: ["484", "485", "486"],
  };

  if (cartera_origen === cartera_destino) {
    return {
      ok: false,
      message: `El campo cartera_origen no puede ser igual al campo cartera_destino`,
    };
  }
  const carteraOrigenAllowedValues1 =
    ALLOWED_VALUES_1.cartera_origen.indexOf(cartera_origen);
  const carteraOrigenAllowedValues2 =
    ALLOWED_VALUES_2.cartera_origen.indexOf(cartera_origen);
  const carteraDestinoAllowedValues1 =
    ALLOWED_VALUES_1.cartera_origen.indexOf(cartera_destino);
  const carteraDestinoAllowedValues2 =
    ALLOWED_VALUES_2.cartera_origen.indexOf(cartera_destino);
  if (carteraOrigenAllowedValues1 !== -1) {
    if (carteraDestinoAllowedValues1 !== -1) {
      return {
        ok: true,
        message: "Campos correctos",
      };
    } else {
      return {
        ok: false,
        message: `El campo cartera_destino no se encuentra entre los valores permitidos: ${ALLOWED_VALUES_1.cartera_destino.join()}`,
      };
    }
  } else if (carteraOrigenAllowedValues2 !== -1) {
    if (carteraDestinoAllowedValues2 !== -1) {
      return {
        ok: true,
        message: "Campos correctos",
      };
    } else {
      return {
        ok: false,
        message: `El campo cartera_destino no se encuentra entre los valores permitidos: ${ALLOWED_VALUES_2.cartera_destino.join()}`,
      };
    }
  } else {
    return {
      ok: false,
      message: `El campo cartera_origen no se encuentra entre los valores permitidos: ${ALLOWED_VALUES_1.cartera_origen.join()},${ALLOWED_VALUES_2.cartera_origen.join()}`,
    };
  }
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
  emisor,
  tipoAmortizacion,
  tipoInteres,
  tipoTasa,
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
  lugarNegociacion,
  tipoOperacion,
  saldoAntMasAltasBajasMasActualizacion,
  saldoAntMenosBajasMasDepreciacionMesMasActualizacion,
  saldoFinalMesAnteriorBsMasMovimientoMesBs,
  depreciacionPeriodoMasAltasBajasDepreciacion,
  operacionEntreColumnas,
  cadenaCombinadalugarNegTipoOperTipoInstrum,
  cartera,
  plazoCupon,
  prepago,
  subordinado,
  calificacion,
  calificadora,
  custodio,
};
