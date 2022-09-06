const multer = require("multer");
const path = require("path");
const { map, filter, isEmpty } = require("lodash");
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
        paramsInstrumento1: null,
        paramsInstrumento18: null,
        paramsInstrumento136: null,
        paramsCartera: null,
        paramsCortoPlazo: null,
        paramsLargoPlazo: null,
        paramsCodOperacion: null,
        paramsTasaRelevanteConInstrumento: null,
        paramsPlazoValorConInstrumento: null,
        paramsPlazoEconomicoConInstrumento: null,
        paramsTasaRelevanteConInstrumentoDiferente: null,
        paramsPlazoValorConInstrumentoDiferente: null,
        paramsPlazoEconomicoConInstrumentoDiferente: null,
        paramsAccionesMO: null,
        paramsCodMercado: null,
        paramsCalfRiesgo: null,
        paramsCodCustodia: null,
        paramsTipoCuenta: null,
        paramsInteresMasAmortizacion: null,
        paramsSaldoCapitalMenosAmortizacionCuponAnterior: null,
        paramsCantidadMultiplicadoPrecio: null,
        paramsTotalBsMenosPrevisionesInversiones: null,
        paramsSaldoAntMasAltasBajasMasActualizacion: null,
        paramsSaldoAntMenosBajasMasDepreciacionMesMasActualizacion: null,
        paramsSaldoFinalMenosSaldoFinalDep: null,
        paramsSaldoFinalMesAnteriorBsMasMovimientoMesBs: null,
        paramsDepreciacionPeriodoMasAltasBajasDepreciacion: null,
        paramsCantidadCuotasMultiplicadoCuotaBs: null,
        paramsCantidadValoresMultiplicadoPrecioNegociacion: null,
        paramsEntidadFinanciera: null,
        paramsMoneda: null,
        paramsEmisor: null,
        paramsPais: null,
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
        paramsCantidadMultiplicadoPrecioEquivalente: null,
        paramsTipoDeCambio: null,
        paramsBolsa: null,
        paramsTipoMarcacion: null,
        paramsTipoValoracion: null,
        paramsTipoValoracionConsultaMultiple: null,
        paramsTipoValoracion22: null,
        paramsTipoValoracion31: null,
        paramsTipoValoracion210: null,
        paramsTipoActivo: null,
        paramsLugarNegociacion: null,
        paramsLugarNegociacionVacio: null,
        paramsTipoOperacion: null,
        paramsEntidadEmisora: null,
        paramsTasaRendimiento: null,
        paramsPrecioMercadoMOMultiplicadoCantidadValores: null,
        paramsUnico: null,
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
        PARAMS.TipoMarcacion;
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
        PARAMS.paramsTipoMarcacion = true;
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
        PARAMS.paramsLugarNegociacion = {
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
        PARAMS.paramsLugarNegociacionVacio = {
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
        PARAMS.paramsTipoOperacion = {
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
              {
                key: "es_rf",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsUnico = true;
        PARAMS.tipoOperacionCOP = true;
        PARAMS.paramsCantidadValoresMultiplicadoPrecioNegociacion = true;
      } else if (nameFile.includes(".412")) {
        console.log("ARCHIVO CORRECTO : 412", nameFile);
        PARAMS.codeCurrentFile = "412";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsLugarNegociacion = {
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
        PARAMS.paramsLugarNegociacionVacio = {
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
        PARAMS.paramsTipoOperacion = {
          table: "APS_param_tipo_operacion",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "tipo",
                value: "VAR",
              },
              {
                block: [
                  {
                    key: "es_operacion",
                    value: true,
                    operatorSQL: "OR",
                  },
                  {
                    key: "tipo",
                    value: "DIS",
                  },
                ],
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
              "lugar_negociacion || tipo_operacion || tipo_instrumento as siglacombinada",
            ],
            where: [
              {
                key: "activo",
                value: true,
              },
              {
                key: "es_rf",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsUnico = true;
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
                key: "id_tipo_renta",
                valuesWhereIn: [135],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsEmisor = {
          table: "APS_param_emisor",
          params: {
            select: ["codigo_rmv"],
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
                key: "id_clasificador_comun_grupo",
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
                key: "id_clasificador_comun_grupo",
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
                key: "id_clasificador_comun_grupo",
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
                key: "id_clasificador_comun_grupo",
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
                key: "id_clasificador_comun_grupo",
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
                key: "id_clasificador_comun_grupo",
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
                key: "id_clasificador_comun_grupo",
                valuesWhereIn: [9],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".442")) {
        console.log("ARCHIVO CORRECTO : 442", nameFile);
        PARAMS.codeCurrentFile = "442";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [138],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsPais = {
          table: "APS_param_pais",
          params: {
            select: ["codigo"],
          },
        };
        PARAMS.paramsEmisor = {
          table: "APS_param_emisor",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "id_pais",
                value: 8,
                operator: "<>",
              },
              {
                key: "codigo_rmv",
                value: "TGN",
                operatorSQL: "OR",
              },
            ],
          },
        };
        PARAMS.paramsMoneda = {
          table: "APS_param_moneda",
          params: {
            select: ["codigo_otros_activos"],
          },
        };
        PARAMS.paramsNroPago = true;
        PARAMS.paramsPlazoCupon = true;
        PARAMS.paramsCalificacion = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["descripcion"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 35,
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
                key: "id_clasificador_comun_grupo",
                valuesWhereIn: [8],
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
        PARAMS.paramsEmisor = {
          table: "APS_param_emisor",
          params: {
            select: ["codigo_rmv"],
          },
        };
        PARAMS.paramsMoneda = {
          table: "APS_param_moneda",
          params: {
            select: ["sigla"],
          },
        };
        PARAMS.paramsCalificacion = {
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
        PARAMS.paramsCalificadora = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
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
                key: "id_clasificador_comun_grupo",
                valuesWhereIn: [9],
                whereIn: true,
              },
            ],
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
                key: "id_tipo_renta",
                valuesWhereIn: [135],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsPlazoCuponMasAmortizacion = true;
        PARAMS.paramsSaldoCapitalMenosAmortizacionCuponAnterior = true;
      } else if (nameFile.includes(".445")) {
        console.log("ARCHIVO CORRECTO : 445", nameFile);
        PARAMS.codeCurrentFile = "445";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [138],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsInteresMasAmortizacion = true;
        PARAMS.paramsSaldoCapitalMenosAmortizacionCuponAnterior = true;
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
              {
                key: "activo",
                value: true,
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
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135, 136],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsTasaRelevanteConInstrumento = {
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
        PARAMS.paramsTasaRelevanteConInstrumentoDiferente = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
                operatorSQL: "<>",
              },
            ],
          },
        };
        PARAMS.paramsPlazoValorConInstrumento = {
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
        PARAMS.paramsPlazoValorConInstrumentoDiferente = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
                operatorSQL: "<>",
              },
            ],
          },
        };
        PARAMS.paramsPlazoEconomicoConInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
                operatorSQL: "<>",
              },
            ],
          },
        };
        PARAMS.paramsPlazoEconomicoConInstrumentoDiferente = {
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
        PARAMS.paramsCalificacion = {
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
        PARAMS.paramsCalificadora = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
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
                key: "id_clasificador_comun_grupo",
                valuesWhereIn: [9],
                whereIn: true,
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };

        PARAMS.paramsInstrumento135 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsInstrumento1 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_instrumento",
                value: 1,
              },
            ],
          },
        };
        PARAMS.paramsInstrumento18 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_instrumento",
                value: 18,
              },
            ],
          },
        };

        PARAMS.paramsTipoValoracion22 = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 22,
              },
            ],
          },
        };
        PARAMS.paramsTipoValoracion31 = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 31,
              },
              {
                key: "id_clasificador_comun",
                valuesWhereIn: [210],
                whereIn: true,
                searchCriteriaWhereIn: "NOT IN",
              },
            ],
          },
        };
        PARAMS.paramsTipoValoracion210 = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun",
                value: 210,
              },
            ],
          },
        };

        PARAMS.paramsTipoValoracionConsultaMultiple = true;

        PARAMS.paramsFechaOperacionMenor = true;
        PARAMS.paramsCantidadMultiplicadoPrecioEquivalente = true;
        PARAMS.paramsTipoOperacion = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 32,
              },
            ],
          },
        };
      } else if (nameFile.includes(".482")) {
        console.log("ARCHIVO CORRECTO : 482", nameFile);
        PARAMS.codeCurrentFile = "482";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135, 136],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsTasaRelevanteConInstrumento = {
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
        PARAMS.paramsPlazoValorConInstrumento = {
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
        PARAMS.paramsPlazoEconomicoConInstrumento = {
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
        PARAMS.paramsCalificacion = {
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
        PARAMS.paramsCalificadora = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
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
                key: "id_clasificador_comun_grupo",
                valuesWhereIn: [9],
                whereIn: true,
              },
            ],
          },
        };

        PARAMS.paramsInstrumento135 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsInstrumento1 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_instrumento",
                value: 1,
              },
            ],
          },
        };
        PARAMS.paramsInstrumento18 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_instrumento",
                value: 18,
              },
            ],
          },
        };

        PARAMS.paramsTipoValoracion22 = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 22,
              },
            ],
          },
        };
        PARAMS.paramsTipoValoracion31 = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 31,
              },
              {
                key: "id_clasificador_comun_grupo",
                valuesWhereIn: [210],
                whereIn: true,
                searchCriteriaWhereIn: "NOT IN",
              },
            ],
          },
        };
        PARAMS.paramsTipoValoracion210 = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 31,
              },
              {
                key: "id_clasificador_comun_grupo",
                valuesWhereIn: [210],
                whereIn: true,
                searchCriteriaWhereIn: "NOT IN",
              },
            ],
          },
        };

        PARAMS.paramsTipoValoracionConsultaMultiple = true;

        PARAMS.paramsFechaOperacionMenor = true;
        PARAMS.paramsCantidadMultiplicadoPrecioEquivalente = true;
        PARAMS.paramstipoOperacion = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 32,
              },
            ],
          },
        };
      } else if (nameFile.includes(".483")) {
        console.log("ARCHIVO CORRECTO : 483", nameFile);
        PARAMS.codeCurrentFile = "483";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135, 136],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsEntidadEmisora = {
          table: "APS_param_emisor",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "id_pais",
                value: 8,
              },
            ],
          },
        };
        PARAMS.paramsCantidadMultiplicadoPrecio = true;
        PARAMS.paramsTotalBsMenosPrevisionesInversiones = true;
      } else if (nameFile.includes(".484")) {
        console.log("ARCHIVO CORRECTO : 484", nameFile);
        PARAMS.codeCurrentFile = "484";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsTipoActivo = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              valuesWhereIn: [138, 139],
              whereIn: true,
            },
          ],
        };
        PARAMS.paramsTasaRendimiento = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              value: 139,
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
                valuesWhereIn: [1, 3],
                whereIn: true,
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
                key: "id_clasificador_comun_grupo",
                valuesWhereIn: [7, 8],
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
                key: "id_clasificador_comun_grupo",
                value: 9,
              },
            ],
          },
        };
        PARAMS.paramsFechaOperacionMenor = true;
      } else if (nameFile.includes(".485")) {
        console.log("ARCHIVO CORRECTO : 485", nameFile);
        PARAMS.codeCurrentFile = "485";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsTipoActivo = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              valuesWhereIn: [138, 139],
              whereIn: true,
            },
          ],
        };
        PARAMS.paramsTasaRendimiento = {
          table: "APS_param_tipo_instrumento",
          select: ["sigla"],
          where: [
            {
              key: "id_tipo_renta",
              value: 139,
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
                valuesWhereIn: [1, 3],
                whereIn: true,
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
                key: "id_clasificador_comun_grupo",
                valuesWhereIn: [7, 8],
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
                key: "id_clasificador_comun_grupo",
                value: 9,
              },
            ],
          },
        };
        PARAMS.paramsFechaOperacionMenor = true;
      } else if (nameFile.includes(".486")) {
        console.log("ARCHIVO CORRECTO : 486", nameFile);
        PARAMS.codeCurrentFile = "486";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [138, 139],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsEntidadEmisora = {
          table: "APS_param_emisor",
          params: {
            select: ["codigo_rmv"],
            where: [
              {
                key: "id_pais",
                value: 8,
                operator: "<>",
              },
              {
                key: "id_emisor",
                value: 13,
                operatorSQL: "OR",
              },
            ],
          },
        };
        PARAMS.paramsCantidadMultiplicadoPrecio = true;
        PARAMS.paramsTotalBsMenosPrevisionesInversiones = true;
      } else if (nameFile.includes(".461")) {
        console.log("ARCHIVO CORRECTO : 461", nameFile);
        PARAMS.codeCurrentFile = "461";
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
      } else if (nameFile.includes(".471")) {
        console.log("ARCHIVO CORRECTO : 471", nameFile);
        PARAMS.codeCurrentFile = "471";
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
        PARAMS.paramsSaldoFinalMenosSaldoFinalDep = true;
      } else if (nameFile.includes(".492")) {
        console.log("ARCHIVO CORRECTO : 492", nameFile);
        PARAMS.codeCurrentFile = "492";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsSaldoAntMasAltasBajasMasActualizacion = true;
        PARAMS.paramsSaldoAntMenosBajasMasDepreciacionMesMasActualizacion = true;
        PARAMS.paramsSaldoFinalMenosSaldoFinalDep = true;
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
      } else if (nameFile.includes(".CC")) {
        console.log("ARCHIVO CORRECTO : CC", nameFile);
        PARAMS.codeCurrentFile = "CC";
        PARAMS.nameTable = "APS_aud_carga_archivos_custodio";
        PARAMS.headers = await formatoArchivo(PARAMS.codeCurrentFile);
        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                valuesWhereIn: [135],
                whereIn: true,
              },
              {
                key: "activo",
                value: true,
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
                key: "id_clasificador_comun_grupo",
                value: 19,
              },
            ],
          },
        };
        PARAMS.paramsPrecioMercadoMOMultiplicadoCantidadValores = true;
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
    411: {
      table: "APS_seguro_archivo_411",
    },
    412: {
      table: "APS_seguro_archivo_412",
    },
    413: {
      table: "APS_seguro_archivo_413",
    },
    441: {
      table: "APS_seguro_archivo_441",
    },
    442: {
      table: "APS_seguro_archivo_442",
    },
    443: {
      table: "APS_seguro_archivo_443",
    },
    444: {
      table: "APS_seguro_archivo_444",
    },
    445: {
      table: "APS_seguro_archivo_445",
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
    485: {
      table: "APS_seguro_archivo_485",
    },
    486: {
      table: "APS_seguro_archivo_486",
    },
    461: {
      table: "APS_seguro_archivo_461",
    },
    471: {
      table: "APS_seguro_archivo_471",
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
    CC: {
      table: "APS_oper_archivo_Custodio",
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
        function: "bolsa",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        typeError: "format",
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        function: null,
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{1,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9,-]{5,30}$/,
        function: null,
      },
      {
        columnName: "tasa_promedio",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_negociado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_minimo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "tipo_marcacion",
        pattern: /^[A-Za-z]{2,2}$/,
        function: "marcacion",
      },
    ],
    L: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "bolsa",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,7}$/,
        function: null,
      },
      {
        columnName: "monto_negociado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorIgualACeroDecimal",
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_minimo",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        function: "mayorIgualACeroDecimal",
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z]{2,2}$/,
        function: "tipoValoracion",
      },
    ],
    N: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "bolsa",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        function: null,
      },
      {
        columnName: "fecha_marcacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        notValidate: true,
        function: null,
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
    ],
    P: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "bolsa",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        function: null,
      },
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoActivo",
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9]{10,30}$/,
        function: null,
      },
      {
        columnName: "ult_fecha_disponible",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        notValidate: true,
        function: null,
      },
      {
        columnName: "tasa",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: "mayorIgualACeroDecimal",
      },
      {
        columnName: "precio_bid",
        pattern: /^(0|[1-9][0-9]{0,10})(\.\d{5,5}){1,1}$/,
        function: "mayorIgualACeroDecimal",
      },
    ],
    411: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9,-]{0,4}$/,
        mayBeEmpty: true,
        function: "lugarNegociacion",
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        function: "tipoOperacion",
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        operationNotValid: "tipoOperacionCOP",
        function: null,
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,8}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "cantidadValoresMultiplicadoPrecioNegociacion",
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
    ],
    412: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9,-]{0,3}$/,
        mayBeEmpty: true,
        function: "lugarNegociacion",
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoOperacion",
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        operationNotValid: "tipoOperacionCOP",
        function: null,
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "cantidadValoresMultiplicadoPrecioNegociacion",
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
    ],
    413: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "cartera_origen",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        function: "cartera",
      },
      {
        columnName: "cartera_destino",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        function: null,
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        function: null,
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
    ],
    441: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: null,
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "emisor",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "moneda",
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: null,
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: null,
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tipo_amortizacion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoAmortizacion",
      },
      {
        columnName: "tipo_interes",
        pattern: /^[A-Za-z]{1,1}$/,
        function: "tipoInteres",
      },
      {
        columnName: "tipo_tasa",
        pattern: /^[A-Za-z]{1,1}$/,
        function: "tipoTasa",
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: "nroPago",
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        function: "plazoCupon",
      },
      {
        columnName: "prepago",
        pattern: /^[A-Za-z0-9,-]{1,1}$/,
        function: "prepago",
      },
      {
        columnName: "subordinado",
        pattern: /^[A-Za-z0-9,-]{1,1}$/,
        function: "subordinado",
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9,-]{1,3}$/,
        function: "calificacion",
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "calificadora",
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "custodio",
      },
    ],
    442: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: null,
      },
      {
        columnName: "pais",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "pais",
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "emisor",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{2,2}$/,
        function: "moneda",
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: null,
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: null,
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: "nroPago",
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        function: "plazoCupon",
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9,-]{1,3}$/,
        function: "calificacion",
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "calificadora",
      },
    ],
    443: [
      {
        columnName: "fecha_emision",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: null,
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        function: null,
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "emisor",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "moneda",
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "precio_unitario",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9,-]{0,3}$/,
        mayBeEmpty: true,
        function: "calificacion",
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: "calificadora",
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "custodio",
      },
    ],
    444: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        function: null,
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        unique: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: null,
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function:
          "saldoCapitalMultiplicadoPlazoCuponMultiplicadoInteresDividido36000",
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "interesMasAmortizacion",
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "saldoCapitalMenosAmortizacionCuponAnterior",
      },
    ],
    445: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: null,
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        unqiue: true,
        function: "mayorACeroEntero",
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "plazo_fecha_vencimiento",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function:
          "saldoCapitalMultiplicadoPlazoCuponMultiplicadoInteresDividido36000",
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "plazoCuponMasAmortizacion",
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "saldoCapitalMenosAmortizacionCuponAnterior",
      },
    ],
    451: [
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoCuenta",
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "entidadFinanciera",
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9,-]{10,20}$/,
        function: null,
      },
      {
        columnName: "codigo_cuenta_contable",
        pattern: /^[A-Za-z0-9,-]{12,12}$/,
        function: null,
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "moneda",
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        // function: "montoFinalConTipoDeCambio", // VALIDACION PARA TIPO DE CAMBIO
        function: "mayorACeroDecimal",
      },
    ],
    481: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9,-]{7,10}$/,
        function: null,
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        function: "tasaRelevanteConInstrumento",
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: "plazoValorConInstrumento",
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: "plazoEconomicoConInstrumento",
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "cantidadMultiplicadoPrecioEquivalente",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        function: "moneda",
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9,-]{1,3}$/,
        function: "calificacion",
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "calificadora",
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: "custodio",
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenorAlArchivo",
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoValoracionConsultaMultiple",
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoOperacion",
      },
    ],
    482: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        function: null,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9,-]{7,10}$/,
        function: null,
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        function: "tasaRelevanteConInstrumento",
      },
      {
        columnName: "cantidad",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: null,
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: "plazoValorConInstrumento",
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: "plazoEconomicoConInstrumento",
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "cantidadMultiplicadoPrecioEquivalente",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        function: "moneda",
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9,-]{1,3}$/,
        function: "calificacion",
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "calificadora",
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "custodio",
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenorAlArchivo",
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoValoracionConsultaMultiple",
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoOperacion",
      },
    ],
    483: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "entidad_emisora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "entidadEmisora",
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "cantidadMultiplicadoPrecio",
      },
      {
        columnName: "total_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorIgualACeroDecimal",
      },
      {
        columnName: "total_neto_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "totalBsMenosPrevisionesInversiones",
      },
    ],
    484: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoActivo",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: null,
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8}){1,1}$/,
        function: "tasaRendimiento",
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "plazo_valor",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "precio_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        function: "moneda",
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z0-9,-]{1,3}$/,
        function: null,
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "calificadora",
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "custodio",
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenorAlArchivo",
      },
    ],
    485: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoActivo",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: null,
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8}){1,1}$/,
        function: "tasaRendimiento",
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "plazo_valor",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "precio_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        function: "moneda",
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "calificacion_riesgo",
        pattern: /^[A-Za-z0-9,-]{1,3}$/,
        function: null,
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "calificadora",
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "custodio",
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenorAlArchivo",
      },
    ],
    486: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "entidad_emisora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "entidadEmisora",
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "cantidadMultiplicadoPrecio",
      },
      {
        columnName: "total_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_neto_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "totalBsMenosPrevisionesInversiones",
      },
    ],
    461: [
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoCuenta",
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "entidadFinanciera",
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9,-]{5,20}$/,
        function: null,
      },
      {
        columnName: "codigo_cuenta_contable",
        pattern: /^[A-Za-z0-9,-]{1,12}$/,
        function: null,
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "moneda",
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: null,
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        // function: "montoFinalConTipoDeCambio", // VALIDACION PARA TIPO DE CAMBIO
        function: null,
      },
    ],
    471: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoActivo",
      },
      {
        columnName: "detalle_2",
        pattern: /^[A-Za-z0-9,-]{5,25}$/,
        function: null,
      },
      {
        columnName: "detalle_2",
        pattern: /^[A-Za-z0-9,-]{5,25}$/,
        function: null,
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[A-Za-z0-9,-]{1,7}$/,
        function: null,
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: null,
      },
    ],
    491: [
      {
        columnName: "codigo_contable",
        pattern: /^[A-Za-z]{3,3}$/,
        function: null,
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
        function: null,
      },
      {
        columnName: "ciudad",
        pattern: /^[A-Za-z0-9,-]{5,30}$/,
        function: null,
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "superficie",
        pattern: /^[A-Za-z0-9,-]{5,13}$/,
        function: null,
      },
      {
        columnName: "nro_registro_ddrr",
        pattern: /^[A-Za-z0-9,-]{5,25}$/,
        function: null,
      },
      {
        columnName: "nro_testimonio",
        pattern: /^[A-Za-z0-9,-]{5,15}$/,
        function: null,
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "incremento",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "decremento",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "altas_bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "actualizacion",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "saldoAntMasAltasBajasMasActualizacion",
      },
      {
        columnName: "saldo_anterior_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "actualizacion_depreciacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final_dep",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "saldoAntMenosBajasMasDepreciacionMesMasActualizacion",
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "saldoFinalMenosSaldoFinalDep",
      },
      {
        columnName: "valor_neto_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "valor_neto_ufv",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_vida_util",
        pattern: /^[1-9]*$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "observaciones",
        pattern: /^[\s\S]{0,300}$/,
        mayBeEmpty: true,
        function: null,
      },
      {
        columnName: "prevision",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
    ],
    492: [
      {
        columnName: "codigo_contable",
        pattern: /^[A-Za-z]{3,3}$/,
        function: null,
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
        function: null,
      },
      {
        columnName: "ciudad",
        pattern: /^[A-Za-z0-9,-]{5,30}$/,
        function: null,
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "superficie",
        pattern: /^[A-Za-z0-9,-]{5,13}$/,
        function: null,
      },
      {
        columnName: "nro_registro_ddrr",
        pattern: /^[A-Za-z0-9,-]{5,25}$/,
        function: null,
      },
      {
        columnName: "nro_testimonio",
        pattern: /^[A-Za-z0-9,-]{5,15}$/,
        function: null,
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "incremento",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "decremento",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "fecha",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: null,
      },
      {
        columnName: "altas_bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "actualizacion",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "saldoAntMasAltasBajasMasActualizacion",
      },
      {
        columnName: "saldo_anterior_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "actualizacion_depreciacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final_dep",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "saldoAntMenosBajasMasDepreciacionMesMasActualizacion",
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "saldoFinalMenosSaldoFinalDep",
      },
      {
        columnName: "valor_neto_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "valor_neto_ufv",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_vida_util",
        pattern: /^[1-9]*$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "observaciones",
        pattern: /^[\s\S]{0,300}$/,
        mayBeEmpty: true,
        function: null,
      },
      {
        columnName: "prevision",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
    ],
    494: [
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{10,100}$/,
        function: null,
      },
      {
        columnName: "saldo_final_mes_anterior_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "movimiento_mes_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final_mes_actual_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: "saldoFinalMesAnteriorBsMasMovimientoMesBs",
      },
      {
        columnName: "total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
    ],
    496: [
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{20,150}$/,
        function: null,
      },
      {
        columnName: "ubicacion",
        pattern: /^[\s\S]{20,150}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "incremento_revaluo_tecnico",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "decremento_revaluo_tecnico",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "altas_bajas_bienes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_anterior_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "altas_bajas_depreciacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_final_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "depreciacionPeriodoMasAltasBajasDepreciacion",
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "valor_neto_usd",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: "mayorACeroEntero",
      },
    ],
    497: [
      {
        columnName: "nombre_rentista",
        pattern: /^[\s\S]{10,50}$/,
        function: null,
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "nro_documento_prestamo",
        pattern: /^(^-?\d{1,14})(\.\d{2,2}){1,1}$/,
        function: null,
      },
      {
        columnName: "fecha_inicio",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "fecha_finalizacion",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "plazo_prestamo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "tasa_interes_mensual",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "frecuencia_pago",
        pattern: /^[A-Za-z0-9,-]{3,7}$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "cantidad_cuotas",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "cuota_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_total_prestamo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "cantidadCuotasMultiplicadoCuotaBs",
      },
      {
        columnName: "amortizacion_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_actual_prestamo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "intereses_percibidos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
    ],
    498: [
      {
        columnName: "nro_poliza",
        pattern: /^[A-Za-z0-9,-]{5,10}$/,
        function: null,
      },
      {
        columnName: "fecha_inicio_prestamo",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "fecha_finalizacion_prestamo",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "asegurado",
        pattern: /^[\s\S]{10,50}$/,
        function: null,
      },
      {
        columnName: "plan_seguro",
        pattern: /^[\s\S]{10,18}$/,
        function: null,
      },
      {
        columnName: "monto_total_asegurado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "valor_rescate_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: "fechaOperacionMenor",
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "monto_cuota_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "plazo",
        pattern: /^[\s\S]{2,8}$/,
        function: null,
      },
      {
        columnName: "importe_cuota_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "altas_bajas_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "amortizacion_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "saldo_actual",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "mayorACeroDecimal",
      },
      {
        columnName: "sucursal",
        pattern: /^[\s\S]{5,10}$/,
        function: null,
      },
    ],
    DM: [],
    DU: [],
    UA: [],
    TD: [],
    UD: [],
    DC: [],
    DR: [],
    TV: [],
    BG: [],
    FE: [],
    VC: [],
    CC: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "tipoInstrumento",
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9,-]{5,23}$/,
        function: null,
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,1})(\.\d{8,8}){1,1}$/,
        function: null,
      },
      {
        columnName: "precio_nominal_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: null,
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: null,
      },
      {
        columnName: "precio_mercado_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: null,
      },
      {
        columnName: "precio_mercado_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: null,
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: "mayorACeroEntero",
      },
      {
        columnName: "total_mercado_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: "precioMercadoMOMultiplicadoCantidadValores",
      },
      {
        columnName: "custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        function: "custodio",
      },
    ],
  };

  return TYPE_FILES[typeFile];
}

async function formatearDatosEInsertarCabeceras(headers, dataSplit) {
  const formatearPromise = new Promise((resolve, reject) => {
    let arrayDataObject = [];
    let errors = [];
    let errorsValues = [];
    headers.splice(0, 1); // ELIMINAR ID DE TABLA

    map(
      ["id_carga_archivos", "cod_institucion", "fecha_informacion"],
      (item, index) => {
        let myIndex = headers.indexOf(item);
        if (myIndex !== -1) {
          headers.splice(myIndex, 1);
        }
      }
    ); // ELIMINAR ID CARGA ARCHIVOS, CODIGO INSTITUCION, FECHA INFORMACION
    // console.log(headers);
    // console.log(dataSplit);
    const numberCommas = headers?.length - 1;
    // console.log(dataSplit);
    // map(dataSplit, (item, index) => {
    //   console.log(item);
    //   // let myIndex = headers.indexOf(item);
    //   // if (myIndex !== -1) {
    //   //   headers.splice(myIndex, 1);
    //   // }
    // });

    map(dataSplit, (item, index) => {
      if (item.indexOf(" ") !== -1) {
        errors.push({
          msg: `El formato del archivo no debe contener espacios entre los campos, comillas o comas, existe un espacio en la posicion ${item.indexOf(
            " "
          )}`,
          row: index,
        });
      } else {
        let rowNumberCommas = 0;
        map(item, (item2, index2) => {
          if (item2.toLowerCase() === ",") {
            rowNumberCommas++;
          }
        });
        // console.log(rowNumberCommas);
        // console.log(numberCommas);
        const rowSplit = item.split(",");

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
        } else if (
          rowNumberCommas > numberCommas ||
          rowNumberCommas < numberCommas
        ) {
          errors.push({
            msg: `El formato del archivo debe estar separado por correctamente por comas`,
            row: index,
          });
        } else {
          let resultObject = {};
          let counterAux = 0;
          map(headers, (item2, index2) => {
            const value = rowSplit[counterAux];

            //QUITANDO VALOERS UNICODES, EN ESTE CASO 65279 ES UN ESPACIO INVISIBLE QUE LO LEE COMO VACIO PERO EN EL ARCHIVO NO SE VE
            for (let i = 0; i < value.length; i++) {
              if (value.charCodeAt(i) === 65279) {
                value.splice(i, 1);
              }
            }

            if (value[0] !== '"' || value[value.length - 1] !== '"') {
              errorsValues.push({
                msg: `El campo debe estar entre comillas`,
                value: value?.trim().replace(/['"]+/g, ""),
                column: item2,
                row: index,
              });
            }
            resultObject = {
              ...resultObject,
              [item2.toLowerCase()]: value?.trim().replace(/['"]+/g, ""), //QUITAR ESPACIOS Y QUITAR COMILLAS DOBLES
            };
            counterAux++;
          });
          // console.log(resultObject.sort());
          arrayDataObject.push(resultObject);
        }
      }
    });

    if (errors.length >= 1) {
      reject({
        err: true,
        errors: [...errorsValues, ...errors],
      });
    }
    resolve({ arrayDataObject, errorsValues });
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

async function tasaRelevanteConInstrumento(table, params) {
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

async function plazoValorConInstrumento(table, params) {
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

async function plazoEconomicoConInstrumento(table, params) {
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

async function tasaRendimiento(table, params) {
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

async function entidadEmisora(table, params) {
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
  const { tipo_marcacion, monto_negociado, monto_minimo } = params;
  if (isNaN(monto_negociado) || isNaN(monto_minimo)) {
    return {
      ok: false,
      message: `El campo monto_negociado o monto_minimo no son numeros`,
    };
  }
  let values = null;

  if (monto_negociado !== 0 && monto_negociado >= monto_minimo) {
    values = "AC, NA";
    if (!values.includes(tipo_marcacion)) {
      return {
        ok: false,
        message: `El campo monto_negociado es mayor o igual a monto_minimo por lo tanto el valor de tipo_marcacion debe ser ${values}`,
      };
    }
  }
  if (monto_negociado !== 0 && monto_negociado < monto_minimo) {
    values = "NM";
    if (!values.includes(tipo_marcacion)) {
      return {
        ok: false,
        message: `El campo monto_negociado es menor a monto_minimo por lo tanto el valor de tipo_marcacion debe ser ${values}`,
      };
    }
  }

  return {
    ok: true,
    message: "Valores correctos",
  };
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
        message: `El campo no cumple las especificaciones de Tipo de Dato`,
      };
    } else {
      if (valueNumber > 0) {
        return {
          ok: true,
          message: `El valor si es mayor a 0`,
        };
      } else {
        return {
          ok: false,
          message: `El valor debe ser mayor a 0`,
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

async function mayorACeroDecimal(params) {
  const { value } = params;
  try {
    const valueNumber = parseFloat(value);
    if (isNaN(valueNumber)) {
      return {
        ok: false,
        message: `El campo no cumple las especificaciones de Tipo de Dato`,
      };
    } else {
      if (valueNumber > 0) {
        return {
          ok: true,
          message: `El valor si es mayor a 0`,
        };
      } else {
        return {
          ok: false,
          message: `El valor debe ser mayor a 0`,
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

async function mayorIgualACeroEntero(params) {
  const { value } = params;
  try {
    const valueNumber = parseInt(value);
    if (isNaN(valueNumber)) {
      return {
        ok: false,
        message: `El campo no cumple las especificaciones de Tipo de Dato`,
      };
    } else {
      if (valueNumber >= 0) {
        return {
          ok: true,
          message: `El valor si es mayor o igual a 0`,
        };
      } else {
        return {
          ok: false,
          message: `El valor no es mayor o igual a 0`,
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

async function mayorIgualACeroDecimal(params) {
  const { value } = params;
  try {
    const valueNumber = parseFloat(value);
    if (isNaN(valueNumber)) {
      return {
        ok: false,
        message: `El campo no cumple las especificaciones de Tipo de Dato`,
      };
    } else {
      if (valueNumber >= 0) {
        return {
          ok: true,
          message: `El valor si es mayor o igual a 0`,
        };
      } else {
        return {
          ok: false,
          message: `El valor no es mayor o igual a 0`,
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
      message: `El campo plazo_cupon o nro_pago no son numeros`,
    };
  }

  if (nro_pago > 1) {
    if (plazo_cupon <= 0) {
      return {
        ok: false,
        message: `El campo nro_pago es mayor a 1 por lo tanto plazo_cupon debe ser mayor a 0`,
      };
    }
  } else if (nro_pago === 1) {
    if (plazo_cupon !== 0) {
      return {
        ok: false,
        message: `El campo nro_pago es igual a 1 por lo tanto plazo_cupon debe ser igual a 0`,
      };
    }
  }

  return {
    ok: true,
    message: `Valores correctos`,
  };
}

async function prepago(table, params) {
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

async function subordinado(table, params) {
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

async function calificacion(table, params) {
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

async function calificadora(table, params) {
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

async function custodio(table, params) {
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
        message: `El contenido esta vacio`,
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
        message: `El contenido del archivo no coincide con alguna clasificación de riesgo en la Renta Variable`,
      };
    } else {
      return {
        ok: false,
        message: `El contenido del archivo no coincide con alguna sigla de tipo de instrumento de Renta Fija o Renta Variable`,
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
        message: `El contenido del archivo no coincide con alguna descripción de Renta fija a Corto plazo`,
      };
    } else if (plazo_valor >= 360) {
      map(resultLargoPlazo, (item, index) => {
        if (calificacion_riesgo === item.descripcion) {
          isOkCalfRiesgo = true;
        }
      });
      return {
        ok: isOkCalfRiesgo,
        message: `El contenido del archivo no coincide con alguna descripción de Renta fija a Largo plazo`,
      };
    } else {
      return {
        ok: isOkCalfRiesgo,
        message: `El contenido del archivo no coincide con alguna descripción de Renta fija a Corto y Largo plazo`,
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
        "La fecha de operación del contenido del archivo o la fecha de operación no tiene el formato correcto",
    };
  } else {
    return {
      ok:
        Date.parse(nuevaFechaContenidoOperacion) <=
        Date.parse(nuevaFechaNombreArchivo),
      message:
        "La fecha de operación del contenido del archivo es mayor a la fecha de operación, lo cual debe ser menor",
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
    parseFloat(saldo_mo) * parseFloat(tipo_cambio.compra) ===
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

async function tipoValoracionConsultaMultiple(params) {
  const {
    tipo_instrumento,
    tipo_valoracion,
    _instrumento135,
    _instrumento1,
    _instrumento18,
    _tipoValoracion22,
    _tipoValoracion31,
    _tipoValoracion210,
  } = params;

  const resultInstrumento135 = await _instrumento135.resultFinal;
  const resultInstrumento1 = await _instrumento1.resultFinal;
  const resultInstrumento18 = await _instrumento18.resultFinal;
  const resultTipoValoracion22 = await _tipoValoracion22.resultFinal;
  const resultTipoValoracion31 = await _tipoValoracion31.resultFinal;
  const resultTipoValoracion210 = await _tipoValoracion210.resultFinal;

  let isOkTipoInstrumento = false;
  let isOkTipoValoracion = false;

  map(resultInstrumento135, (item, index) => {
    if (tipo_instrumento === item.sigla) {
      isOkTipoInstrumento = true;
    }
  });

  if (isOkTipoInstrumento === true) {
    map(resultTipoValoracion22, (item, index) => {
      if (tipo_valoracion === item.sigla) {
        isOkTipoValoracion = true;
      }
    });

    if (isOkTipoValoracion === true) {
      return {
        ok: true,
        message: `Valor correcto INSTRUMENTO: 122`,
      };
    } else {
      return {
        ok: false,
        message:
          "El campo tipo_valoracion no coincide con ninguna sigla válida",
      };
    }
  }

  map(resultInstrumento1, (item, index) => {
    if (tipo_instrumento === item.sigla) {
      isOkTipoInstrumento = true;
    }
  });

  if (isOkTipoInstrumento === true) {
    map(resultTipoValoracion31, (item, index) => {
      if (tipo_valoracion === item.sigla) {
        isOkTipoValoracion = true;
      }
    });

    if (isOkTipoValoracion === true) {
      return {
        ok: true,
        message: `Valor correcto INSTRUMENTO: 1`,
      };
    } else {
      return {
        ok: false,
        message:
          "El campo tipo_valoracion no coincide con ninguna sigla válida",
      };
    }
  }

  map(resultInstrumento18, (item, index) => {
    if (tipo_instrumento === item.sigla) {
      isOkTipoInstrumento = true;
    }
  });

  if (isOkTipoInstrumento === true) {
    map(resultTipoValoracion210, (item, index) => {
      if (tipo_valoracion === item.sigla) {
        isOkTipoValoracion = true;
      }
    });

    if (isOkTipoValoracion === true) {
      return {
        ok: true,
        message: `Valor correcto INSTRUMENTO: 18`,
      };
    } else {
      return {
        ok: false,
        message:
          "El campo tipo_valoracion no coincide con ninguna sigla válida",
      };
    }
  }

  return {
    ok: false,
    message:
      "El campo tipo_instrumento no superó las validaciones para el tipo_valoracion",
  };
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
        message: `El campo total en bolivianos o la prevision de inversiones no son numeros`,
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
          message: `El total en bolivianos restado por la prevision de inversiones en bolivianos no es igual a total neto de inversiones en bolivianos`,
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
        message: `El campo saldo anterior o altas y bajas o actualizacion no son numeros`,
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
          message: `El saldo anterior sumado con altas y bajas y sumado con actualizacion no es igual a saldo final`,
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
        message: `El campo saldo anterior o bajas o actualizacion o periodo de depreciacion no son numeros`,
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
          message: `El saldo anterior restado con bajas sumado con periodo de depreciacion y sumado con actualizacion no es igual a saldo final dep`,
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
        message: `El campo saldo final del mes anterior en bolivianos o el movimiento de mes en bolivianos no son numeros`,
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
          message: `El  saldo final del mes anterior en bolivianos sumado con el movimiento de mes en bolivianos no es igual a saldo final del mes actual en bolivianos`,
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
        message: `El campo depreciacion de periodo o altas y bajas de depreciacion no son numeros`,
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
          message: `La depreciacion de periodo sumado con las altas y bajas de depreciacion no es igual a saldo final de depreciacion acumulada `,
        };
      }
    }
  } catch (err) {
    c;
  }
}

async function operacionEntreColumnas(params) {
  const { total, fields } = params;
  try {
    // console.log("total", total);
    // console.log("fields", fields);
    let fieldsErrorText = "";
    let result = fields[0].value;
    let fieldsResultText = `${fields[0].key}`;

    map(fields, (item, index) => {
      if (isNaN(parseFloat(item.value)) && index % 2 === 0) {
        fieldsErrorText += `${item.key} o`;
      }
    });
    if (fieldsErrorText.length >= 1) {
      return {
        ok: false,
        message: `El campo ${fieldsErrorText} no cumple las especificaciones de Tipo de Dato`,
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
        message: `El resultado de ${fieldsResultText} no es igual a ${total.key}`,
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

async function unico(params) {
  const { fileArrayObject, field } = params;
  const result = [];
  const indexs = [];
  const search = fileArrayObject.reduce((acc, item, index) => {
    // console.log(index);
    acc[item[field.key]] = ++acc[item[field.key]] || 0;
    return acc;
  }, {});
  const duplicates = fileArrayObject.filter((item, index) => {
    return search[item[field.key]];
  });

  map(fileArrayObject, (item, index) => {
    map(duplicates, (item2, index2) => {
      if (item === item2) {
        indexs.push(index);
      }
    });
  });

  if (duplicates.length >= 0) {
    map(duplicates, (item, index) => {
      const row = indexs[index];
      result.push({
        ok: false,
        message: `El campo debe ser único`,
        value: item[field.key],
        row,
      });
    });
  }

  return result;
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
  tipoCuenta,
  entidadFinanciera,
  moneda,
  emisor,
  tipoAmortizacion,
  tipoInteres,
  tipoTasa,
  calificacionRiesgoConsultaMultiple,
  CortoLargoPlazo,
  fechaOperacionMenor,
  tipoDeCambio,
  montoFinalConTipoDeCambio,
  bolsa,
  tipoValoracion,
  tipoValoracionConsultaMultiple,
  mayorACeroEntero,
  mayorACeroDecimal,
  mayorIgualACeroDecimal,
  mayorIgualACeroEntero,
  totalBsMenosPrevisionesInversiones,
  tipoActivo,
  tasaRendimiento,
  entidadEmisora,
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
  plazoEconomicoConInstrumento,
  tasaRelevanteConInstrumento,
  plazoValorConInstrumento,
  unico,
};
