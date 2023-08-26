const multer = require("multer");
const path = require("path");
const {
  map,
  filter,
  isEmpty,
  forEach,
  find,
  chunk,
  uniqBy,
  every,
  size,
  flatMap,
  intersectionBy,
  intersection,
  reduce,
  pickBy,
  includes,
} = require("lodash");
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
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  CargarArchivoABaseDeDatosUtil,
  EliminarUtil,
  ResetearIDUtil,
  InsertarVariosUtil,
  ObtenerColumnasDeTablaUtil,
} = require("../utils/consulta.utils");

const {
  respErrorMulter500,
  respDatosNoRecibidos400,
  respArchivoErroneo415,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respResultadoCorrectoObjeto200,
} = require("../utils/respuesta.utils");

async function obtenerInformacionDeArchivo(nameFile, fechaInicialOperacion) {
  // console.log("nameFile", nameFile);
  const obtenerInformacionDeArchivoPromise = new Promise(
    async (resolve, reject) => {
      const PARAMS = {
        codeCurrentFile: null,
        nameTable: null,
        paramsInstrumento: null,
        paramsInstrumento135: null,
        paramsInstrumento1: null,
        paramsInstrumento25: null,
        paramsInstrumento136: null,
        paramsTipoAccion: null,
        paramsCodigoOperacion: null,
        paramsCodigoMercado: null,
        paramsCodigoCustodia: null,
        paramsCodigoEmisor: null,
        paramsTraspasoCustodia: null,
        paramsCodigoTraspasoCustodia: null,
        paramsCodigoCuenta: null,
        paramsCodigoFondo: null,
        paramsTipoCuentaLiquidez: null,
        paramsCuentaContable: null,
        paramsCodigoBanco: null,
        paramsCodigoCuentaDescripcion: null,
        paramsDescripcionCuenta: null,
        paramsCodigoAFP: null,
        paramsNombreAFP: null,
        paramsPrecioNominalBs: null,
        paramsValorNominalBs: null,
        paramsCantidadPagos: null,
        paramsCartera: null,
        paramsCortoPlazo: null,
        paramsLargoPlazo: null,
        paramsTasaRelevanteConInstrumento: null,
        paramsPlazoValorConInstrumento: null,
        paramsPlazoEconomicoConInstrumento: null,
        paramsTasaRelevanteConInstrumentoDiferente: null,
        paramsPlazoValorConInstrumentoDiferente: null,
        paramsPlazoEconomicoConInstrumentoDiferente: null,
        paramsTipoCuenta: null,
        paramsInteresMasAmortizacion: null,
        paramsSaldoCapitalMenosAmortizacionCuponAnterior: null,
        paramsSaldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000:
          null,
        paramsCantidadMultiplicadoPrecio: null,
        paramsTotalBsMenosPrevisionesInversionesBs: null,
        "paramsSaldoAnt+incrementoRevTec+decrementoRevTec+altasBajas+Actualizacion":
          null,
        "paramsSaldoAntDepAcum+bajasDepAcum+actualizacionDepAcum+depreciacionPeriodo":
          null,
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
        paramsFechaVencimientoMenosFechaEmision: null,
        paramsPrepago: null,
        paramsSubordinado: null,
        paramsSubordinacion: null,
        paramsCalificacion: null,
        paramsCalificacionVacio: null,
        paramsCalificacionConInstrumento: null,
        paramsCalificadora: null,
        paramsCalificadoraConInstrumento: null,
        paramsCustodio: null,
        paramsFechaOperacionMenor: null,
        paramsCantidadMultiplicadoPrecioEquivalente: null,
        paramsCantidadMultiplicadoPrecioMO: null,
        paramsTipoDeCambio: null,
        paramsBolsa: null,
        paramsTipoMarcacion: null,
        paramsTipoValoracion: null,
        paramsTipoValoracionConsultaMultiple: null,
        paramsTipoValoracion22: null,
        paramsTipoValoracion31: null,
        paramsTipoValoracion210: null,
        paramsTasaUltimoHechoConInstrumento: null,
        paramsTasaUltimoHechoConInstrumentoDiferente: null,
        paramsTipoActivo: null,
        paramsLugarNegociacion: null,
        paramsLugarNegociacionVacio: null,
        paramsTipoOperacion: null,
        paramsEntidadEmisora: null,
        paramsTasaRendimientoConInstrumento139: null,
        paramsTasaRendimientoConInstrumento138: null,
        paramsTasaRendimientoConInstrumento: null,
        paramsTasaRendimientoConInstrumentoDiferente: null,
        paramsPrecioMercadoMOMultiplicadoCantidadValores: null,
        paramsUnico: null,
        paramsSingleGroup: null,
        paramsGrouping: null,
        paramsCiudad: null,
        paramsTipoBienInmueble: null,
        paramsTotalVidaUtil: null,
        paramsTotalVidaUtilDiferente: null,
        paramsVidaUtilRestante: null,
        paramsVidaUtilRestanteDiferente: null,
        paramsMayorAFechaEmision: null,
        headers: null,
        detailsHeaders: null,
        paramsCadenaCombinadalugarNegTipoOperTipoInstrum: null,
        tipoOperacionCOP: null,
      };

      if (nameFile.includes("K.")) {
        console.log("ARCHIVO CORRECTO : K", nameFile);
        PARAMS.codeCurrentFile = "K";
        PARAMS.nameTable = "APS_aud_carga_archivos_bolsa";
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
                valuesWhereIn: [138, 214],
                whereIn: true,
              },
            ],
          },
        };
      } else if (nameFile.includes(".411")) {
        console.log("ARCHIVO CORRECTO : 411", nameFile);
        PARAMS.codeCurrentFile = "411";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
                value: false,
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
            where: [
              {
                key: "id_moneda",
                valuesWhereIn: [1, 2, 3, 4],
                whereIn: true,
              },
            ],
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
        PARAMS.paramsFechaVencimientoMenosFechaEmision = true;

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
        PARAMS.paramsSingleGroup = true;
      } else if (nameFile.includes(".442")) {
        console.log("ARCHIVO CORRECTO : 442", nameFile);
        PARAMS.codeCurrentFile = "442";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
            where: [
              {
                key: "id_moneda",
                valuesWhereIn: [1, 3],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsNroPago = true;
        PARAMS.paramsPlazoCupon = true;
        PARAMS.paramsFechaVencimientoMenosFechaEmision = true;
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
        PARAMS.paramsSingleGroup = true;
      } else if (nameFile.includes(".443")) {
        console.log("ARCHIVO CORRECTO : 443", nameFile);
        PARAMS.codeCurrentFile = "443";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
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
        PARAMS.paramsTipoAccion = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 28,
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
        PARAMS.paramsCalificacionVacio = {
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
        PARAMS.paramsSingleGroup = true;
      } else if (nameFile.includes(".444")) {
        console.log("ARCHIVO CORRECTO : 444", nameFile);
        PARAMS.codeCurrentFile = "444";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
        PARAMS.paramsInteresMasAmortizacion = true;
        PARAMS.paramsUnico = true;
        PARAMS.paramsSaldoCapitalMenosAmortizacionCuponAnterior = true;
        PARAMS.paramsSaldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000 = true;
      } else if (nameFile.includes(".445")) {
        console.log("ARCHIVO CORRECTO : 445", nameFile);
        PARAMS.codeCurrentFile = "445";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
        PARAMS.paramsUnico = true;
        PARAMS.paramsSaldoCapitalMenosAmortizacionCuponAnterior = true;
        PARAMS.paramsSaldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000 = true;
      } else if (nameFile.includes(".451")) {
        console.log("ARCHIVO CORRECTO : 451", nameFile);
        PARAMS.codeCurrentFile = "451";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
            where: [
              {
                key: "id_moneda",
                valuesWhereIn: [1, 2, 3],
                whereIn: true,
              },
            ],
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
                operator: "<>",
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
                operator: "<>",
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
        PARAMS.paramsPlazoEconomicoConInstrumentoDiferente = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
                operator: "<>",
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
        PARAMS.paramsCalificacionVacio = {
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
        PARAMS.paramsCalificacionConInstrumento = {
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
        PARAMS.paramsCalificadoraConInstrumento = {
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
        PARAMS.paramsInstrumento25 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_instrumento",
                value: 25,
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

        PARAMS.paramsTasaUltimoHechoConInstrumento = {
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
        PARAMS.paramsTasaUltimoHechoConInstrumentoDiferente = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
                operator: "<>",
              },
            ],
          },
        };

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
        PARAMS.paramsSingleGroup = true;
      } else if (nameFile.includes(".482")) {
        console.log("ARCHIVO CORRECTO : 482", nameFile);
        PARAMS.codeCurrentFile = "482";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
                operator: "<>",
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
                operator: "<>",
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
        PARAMS.paramsPlazoEconomicoConInstrumentoDiferente = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
                operator: "<>",
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
        PARAMS.paramsCalificacionVacio = {
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
        PARAMS.paramsCalificacionConInstrumento = {
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
        PARAMS.paramsCalificadoraConInstrumento = {
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
        PARAMS.paramsInstrumento25 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_instrumento",
                value: 25,
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

        PARAMS.paramsTasaUltimoHechoConInstrumento = {
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
        PARAMS.paramsTasaUltimoHechoConInstrumentoDiferente = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
                operator: "<>",
              },
            ],
          },
        };

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
        PARAMS.paramsSingleGroup = true;
      } else if (nameFile.includes(".483")) {
        console.log("ARCHIVO CORRECTO : 483", nameFile);
        PARAMS.codeCurrentFile = "483";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
        // PARAMS.paramsTipoActivo = {
        //   table: "APS_param_clasificador_comun",
        //   params: {
        //     select: ["sigla"],
        //     where: [
        //       {
        //         key: "id_clasificador_comun_grupo",
        //         value: 38,
        //       },
        //     ],
        //   },
        // };
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
        PARAMS.paramsCantidadMultiplicadoPrecio = true;
        PARAMS.paramsTotalBsMenosPrevisionesInversionesBs = true;
      } else if (nameFile.includes(".484")) {
        console.log("ARCHIVO CORRECTO : 484", nameFile);
        PARAMS.codeCurrentFile = "484";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsTipoActivo = {
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
        PARAMS.paramsTasaRendimientoConInstrumento139 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 139,
              },
            ],
          },
        };
        PARAMS.paramsTasaRendimientoConInstrumento138 = {
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
        PARAMS.paramsSingleGroup = true;
      } else if (nameFile.includes(".485")) {
        console.log("ARCHIVO CORRECTO : 485", nameFile);
        PARAMS.codeCurrentFile = "485";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsTipoActivo = {
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
        PARAMS.paramsTasaRendimientoConInstrumento139 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 139,
              },
            ],
          },
        };
        PARAMS.paramsTasaRendimientoConInstrumento138 = {
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
        PARAMS.paramsSingleGroup = true;
      } else if (nameFile.includes(".486")) {
        console.log("ARCHIVO CORRECTO : 486", nameFile);
        PARAMS.codeCurrentFile = "486";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
        PARAMS.paramsTotalBsMenosPrevisionesInversionesBs = true;
      } else if (nameFile.includes(".461")) {
        console.log("ARCHIVO CORRECTO : 461", nameFile);
        PARAMS.codeCurrentFile = "461";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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

        PARAMS.paramsSingleGroup = true;
        PARAMS.paramsTipoActivo = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 30,
              },
            ],
          },
        };
      } else if (nameFile.includes(".491")) {
        console.log("ARCHIVO CORRECTO : 491", nameFile);
        PARAMS.codeCurrentFile = "491";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsCiudad = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 34,
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsTipoBienInmueble = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 33,
              },
            ],
          },
        };
        PARAMS.paramsTotalVidaUtil = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 255,
              },
            ],
          },
        };
        PARAMS.paramsTotalVidaUtilDiferente = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 255,
                operator: "<>",
              },
            ],
          },
        };
        PARAMS.paramsVidaUtilRestante = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 255,
              },
            ],
          },
        };
        PARAMS.paramsVidaUtilRestanteDiferente = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 255,
                operator: "<>",
              },
            ],
          },
        };

        PARAMS[
          "paramsSaldoAnt+incrementoRevTec+decrementoRevTec+altasBajas+Actualizacion"
        ] = true;
        PARAMS[
          "paramsSaldoAntDepAcum+bajasDepAcum+actualizacionDepAcum+depreciacionPeriodo"
        ] = true;
        PARAMS.paramsSaldoFinalMenosSaldoFinalDep = true;
      } else if (nameFile.includes(".492")) {
        console.log("ARCHIVO CORRECTO : 492", nameFile);
        PARAMS.codeCurrentFile = "492";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsCiudad = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 34,
              },
              {
                key: "activo",
                value: true,
              },
            ],
          },
        };
        PARAMS.paramsTipoBienInmueble = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 33,
              },
            ],
          },
        };
        PARAMS.paramsTotalVidaUtil = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 255,
              },
            ],
          },
        };
        PARAMS.paramsTotalVidaUtilDiferente = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 255,
                operator: "<>",
              },
            ],
          },
        };
        PARAMS.paramsVidaUtilRestante = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 255,
              },
            ],
          },
        };
        PARAMS.paramsVidaUtilRestanteDiferente = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 255,
                operator: "<>",
              },
            ],
          },
        };
        PARAMS[
          "paramsSaldoAnt+incrementoRevTec+decrementoRevTec+altasBajas+Actualizacion"
        ] = true;
        PARAMS[
          "paramsSaldoAntDepAcum+bajasDepAcum+actualizacionDepAcum+depreciacionPeriodo"
        ] = true;
        PARAMS.paramsSaldoFinalMenosSaldoFinalDep = true;
      } else if (nameFile.includes(".494")) {
        console.log("ARCHIVO CORRECTO : 494", nameFile);
        PARAMS.codeCurrentFile = "494";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsSaldoFinalMesAnteriorBsMasMovimientoMesBs = true;
      } else if (nameFile.includes(".496")) {
        console.log("ARCHIVO CORRECTO : 496", nameFile);
        PARAMS.codeCurrentFile = "496";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsDepreciacionPeriodoMasAltasBajasDepreciacion = true;
      } else if (nameFile.includes(".497")) {
        console.log("ARCHIVO CORRECTO : 497", nameFile);
        PARAMS.codeCurrentFile = "497";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsCantidadCuotasMultiplicadoCuotaBs = true;
      } else if (nameFile.includes(".498")) {
        console.log("ARCHIVO CORRECTO : 498", nameFile);
        PARAMS.codeCurrentFile = "498";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
      } else if (nameFile.includes("DM")) {
        console.log(
          `ARCHIVO CORRECTO : DM.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "DM";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
                key: "id_tipo_mercado",
                value: 200,
              },
              {
                key: "id_tipo_renta",
                value: 135,
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
      } else if (nameFile.includes("DR")) {
        console.log(
          `ARCHIVO CORRECTO : DR.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "DR";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
                key: "id_tipo_mercado",
                value: 200,
              },
              {
                key: "id_tipo_renta",
                value: 136,
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
                value: false,
              },
            ],
          },
        };
        PARAMS.paramsUnico = true;
        PARAMS.tipoOperacionCOP = true;
        PARAMS.paramsCantidadValoresMultiplicadoPrecioNegociacion = true;
      } else if (nameFile.includes("UA")) {
        console.log(
          `ARCHIVO CORRECTO : UA.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "UA";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_mercado",
                value: 200,
              },
              {
                key: "id_tipo_renta",
                value: 135,
              },
            ],
          },
        };
      } else if (nameFile.includes("UE")) {
        console.log(
          `ARCHIVO CORRECTO : UE.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "UE";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_mercado",
                value: 200,
              },
              {
                key: "id_tipo_renta",
                value: 138,
              },
            ],
          },
        };
      } else if (nameFile.includes("TD")) {
        console.log(
          `ARCHIVO CORRECTO : TD.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "TD";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_mercado",
                value: 200,
              },
              {
                key: "id_tipo_renta",
                value: 135,
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
            select: ["codigo_valoracion"],
            where: [
              {
                key: "id_moneda",
                valuesWhereIn: [1, 2, 3, 4],
                whereIn: true,
              },
            ],
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
        PARAMS.paramsFechaVencimientoMenosFechaEmision = true;

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
      } else if (nameFile.includes("DU")) {
        console.log(
          `ARCHIVO CORRECTO : DU.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "DU";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_mercado",
                value: 200,
              },
            ],
          },
        };
        PARAMS.paramsCodigoCustodia = {
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
      } else if (nameFile.includes("UD")) {
        console.log(
          `ARCHIVO CORRECTO : UD.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "UD";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsInstrumento = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_mercado",
                value: 200,
              },
              {
                key: "id_tipo_renta",
                value: 135,
              },
            ],
          },
        };
        PARAMS.paramsInteresMasAmortizacion = true;
        PARAMS.paramsUnico = true;
        PARAMS.paramsSaldoCapitalMenosAmortizacionCuponAnterior = true;
        PARAMS.paramsSaldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000 = true;
      } else if (nameFile.includes("TO")) {
        console.log(
          `ARCHIVO CORRECTO : TO.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "TO";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
            where: [
              {
                key: "id_moneda",
                valuesWhereIn: [1, 3],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsNroPago = true;
        PARAMS.paramsPlazoCupon = true;
        PARAMS.paramsFechaVencimientoMenosFechaEmision = true;
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
      } else if (nameFile.includes("CO")) {
        console.log(
          `ARCHIVO CORRECTO : CO.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "CO";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
        PARAMS.paramsUnico = true;
        PARAMS.paramsSaldoCapitalMenosAmortizacionCuponAnterior = true;
        PARAMS.paramsSaldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000 = true;
      } else if (nameFile.includes("TV")) {
        console.log(
          `ARCHIVO CORRECTO : TV.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "TV";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
        PARAMS.paramsTipoAccion = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 28,
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
      } else if (nameFile.includes("DC")) {
        console.log(
          `ARCHIVO CORRECTO : DC.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "DC";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

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
                operator: "<>",
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
                operator: "<>",
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
        PARAMS.paramsPlazoEconomicoConInstrumentoDiferente = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
                operator: "<>",
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
        PARAMS.paramsCalificacionVacio = {
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
        PARAMS.paramsCalificacionConInstrumento = {
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
        PARAMS.paramsCalificadoraConInstrumento = {
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
        PARAMS.paramsInstrumento25 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_instrumento",
                value: 25,
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

        PARAMS.paramsTasaUltimoHechoConInstrumento = {
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
        PARAMS.paramsTasaUltimoHechoConInstrumentoDiferente = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 136,
                operator: "<>",
              },
            ],
          },
        };

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
        PARAMS.paramsSingleGroup = true;
      } else if (nameFile.includes("DO")) {
        console.log(
          `ARCHIVO CORRECTO : DO.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "DO";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsTipoActivo = {
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
        PARAMS.paramsTasaRendimientoConInstrumento138 = {
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
        PARAMS.paramsTasaRendimientoConInstrumento139 = {
          table: "APS_param_tipo_instrumento",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_tipo_renta",
                value: 139,
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
                valuesWhereIn: [1, 3],
                whereIn: true,
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
        PARAMS.paramsCantidadMultiplicadoPrecioMO = true;
        PARAMS.paramsSingleGroup = true;
      } else if (nameFile.includes("BG")) {
        console.log(
          `ARCHIVO CORRECTO : BG.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "BG";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        const whereExtentionFile = [
          {
            key: "id_fondo",
            value: nameFile.includes("FCI")
              ? 201
              : nameFile.includes("CBP")
              ? 259
              : nameFile.includes("CRC")
              ? 206
              : nameFile.includes("CRL")
              ? 205
              : nameFile.includes("CRP")
              ? 204
              : nameFile.includes("MVV")
              ? 203
              : nameFile.includes("FCC")
              ? 202
              : null,
          },
        ];

        PARAMS.paramsCodigoCuentaDescripcion =
          nameFile.includes("FCI") ||
          nameFile.includes("CBP") ||
          nameFile.includes("CRC") ||
          nameFile.includes("CRL") ||
          nameFile.includes("CRP") ||
          nameFile.includes("MVV") ||
          nameFile.includes("FCC")
            ? {
                table: "APS_param_plan_cuentas",
                params: {
                  select: ["cuenta|| ' ' ||descripcion as valor", "valida"],
                  where: whereExtentionFile,
                },
              }
            : {
                table: "APS_param_plan_cuentas",
                params: {
                  select: ["cuenta|| ' ' ||descripcion as valor", "valida"],
                },
              };
      } else if (nameFile.includes("FE")) {
        console.log(
          `ARCHIVO CORRECTO : FE.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "FE";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsCodigoCuenta = {
          table: "APS_param_cuentas_flujo_efectivo",
          params: {
            select: ["cuenta"],
            where: [
              {
                key: "id_fondo",
                value: 201,
              },
            ],
          },
        };
      } else if (nameFile.includes("VC")) {
        console.log(
          `ARCHIVO CORRECTO : VC.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "VC";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsCodigoCuenta = {
          table: "APS_param_plan_cuentas",
          params: {
            select: ["cuenta"],
          },
        };
      } else if (nameFile.includes("CD")) {
        console.log(
          `ARCHIVO CORRECTO : CD.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "CD";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
      } else if (nameFile.includes("DE")) {
        console.log(
          `ARCHIVO CORRECTO : DE.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "DE";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";
      } else if (nameFile.includes("LQ")) {
        console.log(
          `ARCHIVO CORRECTO : LQ.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "LQ";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsCodigoFondo = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun",
                valuesWhereIn: [201, 202],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsTipoCuentaLiquidez = {
          table: "APS_param_clasificador_comun",
          params: {
            select: ["sigla"],
            where: [
              {
                key: "id_clasificador_comun_grupo",
                value: 36,
              },
            ],
          },
        };
        PARAMS.paramsCuentaContable = {
          table: "APS_param_plan_cuentas",
          params: {
            select: ["cuenta"],
            where: [
              {
                key: "valida",
                value: true,
              },
              {
                key: "id_fondo",
                valuesWhereIn: [201, 202],
                whereIn: true,
              },
            ],
          },
        };
        PARAMS.paramsCodigoBanco = {
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
            where: [
              {
                key: "id_moneda",
                valuesWhereIn: [2, 5, 6],
                whereIn: true,
                searchCriteriaWhereIn: "NOT IN",
              },
            ],
          },
        };
      } else if (nameFile.includes("TR")) {
        console.log(
          `ARCHIVO CORRECTO : TR.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "TR";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsCodigoAFP = {
          table: "APS_seg_institucion",
          params: {
            select: ["codigo"],
            where: [
              {
                key: "id_tipo_mercado",
                value: 109,
              },
            ],
          },
        };
        PARAMS.paramsNombreAFP = {
          table: "APS_seg_institucion",
          params: {
            select: ["institucion"],
            where: [
              {
                key: "id_tipo_mercado",
                value: 109,
              },
            ],
          },
        };
      } else if (
        nameFile.includes(".CC") ||
        nameFile[2] + nameFile[3] === "CC"
      ) {
        console.log("ARCHIVO CORRECTO : CC", nameFile);
        PARAMS.codeCurrentFile = "CC";
        PARAMS.nameTable = "APS_aud_carga_archivos_custodio";

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
      } else if (nameFile.includes("FC")) {
        console.log(
          `ARCHIVO CORRECTO : FC.${nameFile?.slice(nameFile.indexOf(".") + 1)}`,
          nameFile
        );
        PARAMS.codeCurrentFile = "FC";
        PARAMS.nameTable = "APS_aud_carga_archivos_pensiones_seguros";

        PARAMS.paramsCodigoCuenta = {
          table: "APS_param_cuentas_flujo_efectivo",
          params: {
            select: ["cuenta"],
            where: [
              {
                key: "id_fondo",
                value: 202,
              },
            ],
          },
        };
      } else {
        reject();
      }
      const columnsHeaders = await formatoArchivo(PARAMS.codeCurrentFile);
      PARAMS.detailsHeaders = await columnsHeaders.detailsHeaders;
      PARAMS.headers = await columnsHeaders.headers;
      // console.log(columnsHeaders);
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
    DM: {
      table: "APS_pensiones_archivo_DM",
    },
    DR: {
      table: "APS_pensiones_archivo_DR",
    },
    UA: {
      table: "APS_pensiones_archivo_UA",
    },
    UE: {
      table: "APS_pensiones_archivo_UE",
    },
    TD: {
      table: "APS_pensiones_archivo_TD",
    },
    DU: {
      table: "APS_pensiones_archivo_DU",
    },
    UD: {
      table: "APS_pensiones_archivo_UD",
    },
    TO: {
      table: "APS_pensiones_archivo_TO",
    },
    CO: {
      table: "APS_pensiones_archivo_CO",
    },
    TV: {
      table: "APS_pensiones_archivo_TV",
    },
    DC: {
      table: "APS_pensiones_archivo_DC",
    },
    DO: {
      table: "APS_pensiones_archivo_DO",
    },
    BG: {
      table: "APS_pensiones_archivo_BG",
    },
    FE: {
      table: "APS_pensiones_archivo_FE",
    },
    VC: {
      table: "APS_pensiones_archivo_VC",
    },
    CD: {
      table: "APS_pensiones_archivo_CD",
    },
    DE: {
      table: "APS_pensiones_archivo_DE",
    },
    FC: {
      table: "APS_pensiones_archivo_FC",
    },
    LQ: {
      table: "APS_pensiones_archivo_LQ",
    },
    TR: {
      table: "APS_pensiones_archivo_TR",
    },
    CC: {
      table: "APS_oper_archivo_Custodio",
    },
  };
  // console.log(HEADERS[type].table);
  const resultFinal = await obtenerCabeceras(HEADERS[type].table)
    .then((response) => {
      const detailsHeaders = [];
      const headers = [];
      map(response.rows, (item, index) => {
        detailsHeaders.push(item);
        headers.push(item.column_name);
      });
      // console.log("HEADERS", type, headers);
      return { detailsHeaders, headers };
    })
    .catch((err) => {
      return { err };
    });
  return resultFinal;
}

async function obtenerValidaciones(typeFile) {
  const TYPE_FILES = {
    K: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["bolsa"],
      },
      {
        columnName: "fecha",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        typeError: "format",
        function: [],
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        function: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{1,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9\-]{5,30}$/,
        function: [],
      },
      {
        columnName: "tasa_promedio",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_negociado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_minimo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "tipo_marcacion",
        pattern: /^[A-Za-z]{2,2}$/,
        function: ["marcacion"],
      },
    ],
    L: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["bolsa"],
      },
      {
        columnName: "fecha",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        function: [],
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,7}$/,
        function: [],
      },
      {
        columnName: "monto_negociado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_minimo",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z]{2,2}$/,
        function: ["tipoValoracion"],
      },
    ],
    N: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["bolsa"],
      },
      {
        columnName: "fecha",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        function: [],
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9]{1,10}$/,
        function: [],
      },
      {
        columnName: "fecha_marcacion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        notValidate: true,
        function: [],
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    P: [
      {
        columnName: "bolsa",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["bolsa"],
      },
      {
        columnName: "fecha",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        function: [],
      },
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoActivo"],
      },
      {
        columnName: "clave_instrumento",
        pattern: /^[A-Za-z0-9]{9,30}$/,
        function: [],
      },
      {
        columnName: "ult_fecha_disponible",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        notValidate: true,
        function: [],
      },
      {
        columnName: "tasa",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "precio_bid",
        pattern: /^(0|[1-9][0-9]{0,11})(\.\d{4,4}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
    ],
    411: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: [],
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        mayBeEmpty: true,
        function: ["lugarNegociacion"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        function: ["tipoOperacion"],
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        operationNotValid: "tipoOperacionCOP",
        function: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,8}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadValoresMultiplicadoPrecioNegociacion"],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    412: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: [],
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        mayBeEmpty: true,
        function: ["lugarNegociacion"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        function: ["tipoOperacion"],
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        operationNotValid: "tipoOperacionCOP",
        function: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadValoresMultiplicadoPrecioNegociacion"],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    413: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: [],
      },
      {
        columnName: "cartera_origen",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        function: ["cartera"],
      },
      {
        columnName: "cartera_destino",
        pattern: /^[A-Za-z0-9]{3,3}$/,
        function: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    441: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        singleGroup: true,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        singleGroup: true,
        endSingleGroup: true,
        function: [],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["moneda"],
        messageError:
          "El campo no corresponde a ninguno de los autorizados por el Manual de Envío",
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tipo_amortizacion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoAmortizacion"],
      },
      {
        columnName: "tipo_interes",
        pattern: /^[A-Za-z]{1,1}$/,
        function: ["tipoInteres"],
      },
      {
        columnName: "tipo_tasa",
        pattern: /^[A-Za-z]{1,1}$/,
        function: ["tipoTasa"],
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["tasaEmision"],
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        function: ["fechaVencimientoMenosFechaEmision"],
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: ["nroPago"],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        function: ["plazoCupon"],
      },
      {
        columnName: "prepago",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        function: ["prepago"],
      },
      {
        columnName: "subordinado",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        function: ["subordinado"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,4}$/,
        function: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["custodio"],
      },
    ],
    442: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        singleGroup: true,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        singleGroup: true,
        endSingleGroup: true,
        function: [],
      },
      {
        columnName: "pais",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["pais"],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{2,2}$/,
        function: ["moneda"],
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        function: ["fechaVencimientoMenosFechaEmision"],
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: ["nroPago"],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        function: ["plazoCupon"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-\+]{1,3}$/,
        function: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z\&]{3,3}$/,
        function: ["calificadora"],
      },
    ],
    443: [
      {
        columnName: "fecha_emision",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        singleGroup: true,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "tipo_accion",
        pattern: /^[A-Za-z0-2]{1,1}$/,
        function: ["tipoAccion"],
      },
      {
        columnName: "serie_emision",
        pattern: /^[A-Za-z0-9]{1,1}$/,
        function: ["serieEmision"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{0,23}$/,
        mayBeEmpty: true,
        singleGroup: true,
        endSingleGroup: true,
        function: [],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["moneda"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "precio_unitario",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        mayBeEmpty: true,
        function: ["calificacionConInstrumentoEstatico"],
        tiposInstrumentos: ["CFC", "ACC"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["custodio"],
      },
    ],
    444: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        uniqueBy: "serie",
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{0,3})$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [
          "saldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000",
        ],
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["interesMasAmortizacion"],
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["saldoCapitalMenosAmortizacionCuponAnterior"],
      },
    ],
    445: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: [],
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        uniqueBy: "serie",
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "plazo_fecha_vencimiento",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        notValidate: true,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [
          "saldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000",
        ],
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["interesMasAmortizacion"],
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["saldoCapitalMenosAmortizacionCuponAnterior"],
      },
    ],
    451: [
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoCuenta"],
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["entidadFinanciera"],
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9\-]{8,20}$/,
        function: [],
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[0-9]{12,12}$/,
        function: [],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["moneda"],
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        // function: ["montoFinalConTipoDeCambio"], // VALIDACION PARA TIPO DE CAMBIO
        function: ["mayorACeroDecimal"],
      },
    ],
    481: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
        singleGroup: true,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9\-]{7,10}$/,
        function: [],
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        function: ["tasaRelevanteConInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: ["plazoValorConInstrumento"],
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: ["plazoEconomicoConInstrumento"],
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadMultiplicadoPrecioEquivalente"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "calificacion",
        mayBeEmpty: true,
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        function: ["calificacionConInstrumento"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["calificadoraConInstrumento"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z0-9\-]{2,3}$/,
        function: ["tipoValoracionConsultaMultiple"],
        singleGroup: true,
        endSingleGroup: true,
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["tasaUltimoHechoConInstrumento"],
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoOperacion"],
      },
    ],
    482: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
        singleGroup: true,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9\-]{7,10}$/,
        function: [],
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        function: ["tasaRelevanteConInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: ["plazoValorConInstrumento"],
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: ["plazoEconomicoConInstrumento"],
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadMultiplicadoPrecioEquivalente"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "calificacion",
        mayBeEmpty: true,
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        function: ["calificacionConInstrumento"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["calificadoraConInstrumento"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z0-9\-]{2,3}$/,
        function: ["tipoValoracionConsultaMultiple"],
        singleGroup: true,
        endSingleGroup: true,
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["tasaUltimoHechoConInstrumento"],
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoOperacion"],
      },
    ],
    483: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z0-9\-\ ]{3,20}$/,
        function: [],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{0,23}$/,
        mayBeEmpty: true,
        function: [],
      },
      {
        columnName: "entidad_emisora",
        pattern: /^[A-Za-z0-9\.\- ]{5,50}$/,
        function: [],
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: ["fechaOperacionMenorAlArchivo"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadMultiplicadoPrecio"],
      },
      {
        columnName: "total_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "total_neto_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["totalBsMenosPrevisionesInversionesBs"],
      },
    ],
    484: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoActivo"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: [],
        singleGroup: true,
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["tasaRendimientoConInstrumento"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "plazo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "precio_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
        singleGroup: true,
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        function: ["moneda"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        function: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
        endSingleGroup: true,
      },
    ],
    485: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoActivo"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: [],
        singleGroup: true,
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["tasaRendimientoConInstrumento"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "plazo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "precio_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
        singleGroup: true,
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        function: ["moneda"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        function: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z\&]{3,3}$/,
        function: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
        endSingleGroup: true,
      },
    ],
    486: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "entidad_emisora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["entidadEmisora"],
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: [],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "precio",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadMultiplicadoPrecio"],
      },
      {
        columnName: "total_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_neto_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["totalBsMenosPrevisionesInversionesBs"],
      },
    ],
    461: [
      {
        columnName: "tipo_cuenta",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoCuenta"],
      },
      {
        columnName: "entidad_financiera",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["entidadFinanciera"],
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9\-]{5,20}$/,
        function: [],
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[0-9]{12,12}$/,
        function: [],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["moneda"],
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        // function: ["montoFinalConTipoDeCambio"], // VALIDACION PARA TIPO DE CAMBIO
        function: ["mayorACeroEntero"],
      },
    ],
    471: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        singleGroup: true,
        function: ["tipoActivo"],
      },
      {
        columnName: "detalle_1",
        pattern: /^[A-Za-z0-9]{3,25}$/,
        singleGroup: true,
        function: [],
      },
      {
        columnName: "detalle_2",
        pattern: /^[A-Za-z0-9À-ÿ\u00f1\u00d1\.\- ]{5,25}$/,
        singleGroup: true,
        function: [],
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[0-9]{12,12}$/,
        singleGroup: true,
        endSingleGroup: true,
        function: [],
      },
      {
        columnName: "prevision_inversiones_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [],
      },
    ],
    491: [
      {
        columnName: "codigo_contable",
        pattern: /^[0-9]{12,12}$/,
        function: [],
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
        function: [],
      },
      {
        columnName: "ciudad",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["ciudad"],
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "superficie",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "nro_registro_ddrr",
        pattern: /^[A-Za-z0-9\.\-]{5,25}$/,
        function: [],
      },
      {
        columnName: "nro_testimonio",
        pattern: /^[A-Za-z0-9\/\-]{5,15}$/,
        function: [],
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "incremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "decremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["menorIgualACeroDecimal"],
      },
      {
        columnName: "fecha_rev_tec",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        mayBeEmpty: true,
        function: [],
      },
      {
        columnName: "altas_bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: [],
      },
      {
        columnName: "actualizacion",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: [],
      },
      {
        columnName: "saldo_final",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: [
          "saldoAnt+incrementoRevTec+decrementoRevTec+altasBajas+Actualizacion",
        ],
      },
      {
        columnName: "saldo_anterior_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "bajas_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["menorIgualACeroDecimal"],
      },
      {
        columnName: "actualizacion_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["menorIgualACeroDecimal"],
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["menorIgualACeroDecimal"],
      },
      {
        columnName: "saldo_final_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: [
          "saldoAntDepAcum+bajasDepAcum+actualizacionDepAcum+depreciacionPeriodo",
        ],
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["saldoFinalMenosSaldoFinalDep"],
      },
      {
        columnName: "valor_neto_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "valor_neto_ufv",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        function: ["totalVidaUtil"],
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        function: ["vidaUtilRestante"],
      },
      {
        columnName: "observaciones",
        pattern: /^[\s\S]{0,300}$/,
        mayBeEmpty: true,
        function: [],
      },
      {
        columnName: "prevision",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "tipo_bien_inmueble",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoBienInmueble"],
      },
    ],
    492: [
      {
        columnName: "codigo_contable",
        pattern: /^[0-9]{12,12}$/,
        function: [],
      },
      {
        columnName: "direccion",
        pattern: /^[\s\S]{15,300}$/,
        function: [],
      },
      {
        columnName: "ciudad",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["ciudad"],
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "superficie",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "nro_registro_ddrr",
        pattern: /^[A-Za-z0-9\.\-]{5,25}$/,
        function: [],
      },
      {
        columnName: "nro_testimonio",
        pattern: /^[A-Za-z0-9\/\-]{5,15}$/,
        function: [],
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "incremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "decremento_rev_tec",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["menorIgualACeroDecimal"],
      },
      {
        columnName: "fecha_rev_tec",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        mayBeEmpty: true,
        function: [],
      },
      {
        columnName: "altas_bajas",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: [],
      },
      {
        columnName: "actualizacion",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: [],
      },
      {
        columnName: "saldo_final",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: [
          "saldoAnt+incrementoRevTec+decrementoRevTec+altasBajas+Actualizacion",
        ],
      },
      {
        columnName: "saldo_anterior_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "bajas_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["menorIgualACeroDecimal"],
      },
      {
        columnName: "actualizacion_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["menorIgualACeroDecimal"],
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["menorIgualACeroDecimal"],
      },
      {
        columnName: "saldo_final_dep_acum",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: [
          "saldoAntDepAcum+bajasDepAcum+actualizacionDepAcum+depreciacionPeriodo",
        ],
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["saldoFinalMenosSaldoFinalDep"],
      },
      {
        columnName: "valor_neto_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "valor_neto_ufv",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        function: ["totalVidaUtil"],
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{1,3})$/,
        range: [0, 480],
        function: ["vidaUtilRestante"],
      },
      {
        columnName: "observaciones",
        pattern: /^[\s\S]{0,300}$/,
        mayBeEmpty: true,
        function: [],
      },
      {
        columnName: "prevision",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "tipo_bien_inmueble",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoBienInmueble"],
      },
    ],
    494: [
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{10,100}$/,
        function: [],
      },
      {
        columnName: "saldo_final_mes_anterior_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "movimiento_mes_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "saldo_final_mes_actual_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["saldoFinalMesAnteriorBsMasMovimientoMesBs"],
      },
      {
        columnName: "total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    496: [
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{20,150}$/,
        function: [],
      },
      {
        columnName: "ubicacion",
        pattern: /^[\s\S]{20,150}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "fecha_compra",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: ["fechaOperacionMenor"],
      },
      {
        columnName: "saldo_anterior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "incremento_revaluo_tecnico",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "decremento_revaluo_tecnico",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "altas_bajas_bienes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "saldo_final",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "saldo_anterior_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "depreciacion_periodo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "altas_bajas_depreciacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "saldo_final_depreciacion_acumulada",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["depreciacionPeriodoMasAltasBajasDepreciacion"],
      },
      {
        columnName: "valor_neto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "valor_neto_usd",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_vida_util",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "vida_util_restante",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: ["mayorACeroEntero"],
      },
    ],
    497: [
      {
        columnName: "nombre_rentista",
        pattern: /^[\s\S]{10,50}$/,
        function: [],
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: ["fechaOperacionMenor"],
      },
      {
        columnName: "nro_documento_prestamo",
        pattern: /^(^-?\d{1,14})(\.\d{2,2}){1,1}$/,
        function: [],
      },
      {
        columnName: "fecha_inicio",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: ["fechaOperacionMenor"],
      },
      {
        columnName: "fecha_finalizacion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: ["fechaOperacionMenor"],
      },
      {
        columnName: "plazo_prestamo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tasa_interes_mensual",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "frecuencia_pago",
        pattern: /^[A-Za-z0-9\-]{3,7}$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "cantidad_cuotas",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "cuota_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_total_prestamo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadCuotasMultiplicadoCuotaBs"],
      },
      {
        columnName: "amortizacion_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "saldo_actual_prestamo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "intereses_percibidos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    498: [
      {
        columnName: "nro_poliza",
        pattern: /^[A-Za-z0-9\-]{5,10}$/,
        function: [],
      },
      {
        columnName: "fecha_inicio_prestamo",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: ["fechaOperacionMenor"],
      },
      {
        columnName: "fecha_finalizacion_prestamo",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: ["fechaOperacionMenor"],
      },
      {
        columnName: "asegurado",
        pattern: /^[\s\S]{10,50}$/,
        function: [],
      },
      {
        columnName: "plan_seguro",
        pattern: /^[\s\S]{10,18}$/,
        function: [],
      },
      {
        columnName: "monto_total_asegurado",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "valor_rescate_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "fecha_prestamo",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: ["fechaOperacionMenor"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_cuota_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "plazo",
        pattern: /^[\s\S]{2,8}$/,
        function: [],
      },
      {
        columnName: "importe_cuota_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "altas_bajas_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "amortizacion_da",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "saldo_actual",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "sucursal",
        pattern: /^[\s\S]{5,10}$/,
        function: [],
      },
    ],
    DM: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: [],
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        mayBeEmpty: true,
        function: ["lugarNegociacion"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        function: ["tipo_operacion"],
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tasa_negociacion",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [
          "mayorACeroDecimal",
          "cantidadValoresMultiplicadoPrecioNegociacion",
        ],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    DR: [
      {
        columnName: "fecha_operacion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: [],
      },
      {
        columnName: "lugar_negociacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        mayBeEmpty: true,
        function: ["lugarNegociacion"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        operationNotValid: "cadenaCombinadalugarNegTipoOperTipoInstrum",
        function: ["tipoOperacion"],
      },
      {
        columnName: "correlativo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        unique: true,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        operationNotValid: "tipoOperacionCOP",
        function: [],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "precio_negociacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "monto_total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadValoresMultiplicadoPrecioNegociacion"],
      },
      {
        columnName: "monto_total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    UA: [
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
      },
      {
        columnName: "precio_cupon_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [],
      },
      {
        columnName: "precio_cupon_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [],
      },
    ],
    UE: [
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        function: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
      },
      {
        columnName: "precio_cupon_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [],
      },
      {
        columnName: "precio_cupon_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [],
      },
    ],
    TD: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        function: ["moneda"],
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tipo_amortizacion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoAmortizacion"],
      },
      {
        columnName: "tipo_interes",
        pattern: /^[A-Za-z]{1,1}$/,
        function: ["tipoInteres"],
      },
      {
        columnName: "tipo_tasa",
        pattern: /^[A-Za-z]{1,1}$/,
        function: ["tipoTasa"],
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        function: ["fechaVencimientoMenosFechaEmision"],
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: ["nroPago"],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        function: ["plazoCupon"],
      },
      {
        columnName: "prepago",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        function: ["prepago"],
      },
      {
        columnName: "subordinado",
        pattern: /^[A-Za-z0-9\-]{1,1}$/,
        function: ["subordinado"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        function: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["custodio"],
      },
    ],
    DU: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
      },
      {
        columnName: "codigo_custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["codigoCustodia"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
    ],
    UD: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        singleGroup: true,
        function: [],
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        // unique: true,
        singleGroup: true,
        endSingleGroup: true,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{0,4})$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [
          "saldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000",
        ],
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["interesMasAmortizacion"],
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["saldoCapitalMenosAmortizacionCuponAnterior"],
      },
    ],
    TO: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: [],
      },
      {
        columnName: "pais",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["pais"],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{2,2}$/,
        function: ["moneda"],
      },
      {
        columnName: "fecha_vencimiento",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "fecha_emision",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "precio_nominal",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tasa_emision",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "plazo_emision",
        pattern: /^(0|[1-9][0-9]{1,4})$/,
        function: ["fechaVencimientoMenosFechaEmision"],
      },
      {
        columnName: "nro_pago",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        function: ["nroPago"],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]*)$/,
        function: ["plazoCupon"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        function: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z\&]{3,3}$/,
        function: ["calificadora"],
      },
    ],
    CO: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9]{5,23}$/,
        function: [],
      },
      {
        columnName: "nro_cupon",
        pattern: /^(0|[1-9][0-9]{0,2})$/,
        unique: true,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "fecha_pago",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "plazo_cupon",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "plazo_fecha_vencimiento",
        pattern: /^(0|[1-9][0-9]{1,2})$/,
        notValidate: true,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "amortizacion",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "interes",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: [
          "saldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000",
        ],
      },
      {
        columnName: "flujo_total",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["interesMasAmortizacion"],
      },
      {
        columnName: "saldo_capital",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["saldoCapitalMenosAmortizacionCuponAnterior"],
      },
    ],
    TV: [
      {
        columnName: "fecha_emision",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "tipo_accion",
        pattern: /^[A-Za-z0-2]{1,1}$/,
        function: ["tipoAccion"],
      },
      {
        columnName: "serie_emision",
        pattern: /^[A-Za-z]{1,1}$/,
        function: [],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{0,23}$/,
        mayBeEmpty: true,
        function: [],
      },
      {
        columnName: "emisor",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["emisor"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["moneda"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "precio_unitario",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_unitario_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{0,3}$/,
        mayBeEmpty: true,
        function: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["custodio"],
      },
    ],
    DC: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
        singleGroup: true,
      },
      {
        columnName: "codigo_valoracion",
        pattern: /^[A-Za-z0-9\-]{7,10}$/,
        function: [],
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{8,8})$/,
        function: ["tasaRelevanteConInstrumento"],
        singleGroup: true,
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "plazo_valor",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: ["plazoValorConInstrumento"],
      },
      {
        columnName: "plazo_economico",
        pattern: /^(0|[1-9][0-9]{0,6})$/,
        function: ["plazoEconomicoConInstrumento"],
      },
      {
        columnName: "precio_equivalente",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadMultiplicadoPrecioEquivalente"],
      },
      {
        columnName: "total_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "calificacion",
        mayBeEmpty: true,
        pattern: /^[A-Za-z0-9\-]{0,4}$/,
        function: ["calificacionConInstrumento"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["calificadoraConInstrumento"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
      },
      {
        columnName: "tipo_valoracion",
        pattern: /^[A-Za-z0-9\-]{2,3}$/,
        function: ["tipoValoracionConsultaMultiple"],
        singleGroup: true,
        endSingleGroup: true,
      },
      {
        columnName: "fecha_ultimo_hecho",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: [],
      },
      {
        columnName: "tasa_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,2})(\.\d{4,4}){1,1}$/,
        function: ["tasaUltimoHechoConInstrumento"],
      },
      {
        columnName: "precio_ultimo_hecho",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "tipo_operacion",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoOperacion"],
      },
    ],
    DO: [
      {
        columnName: "tipo_activo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoActivo"],
        singleGroup: true,
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
        singleGroup: true,
      },
      {
        columnName: "tasa_rendimiento",
        pattern: /^(^-?(0|[1-9][0-9]{0,2}))(\.\d{8,8}){1,1}$/,
        function: ["tasaRendimientoConInstrumento"],
      },
      {
        columnName: "cantidad",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "plazo",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "precio_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
        singleGroup: true,
      },
      {
        columnName: "total_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["cantidadMultiplicadoPrecioMO"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{1,1}$/,
        function: ["moneda"],
      },
      {
        columnName: "total_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "calificacion",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        function: ["calificacion"],
      },
      {
        columnName: "calificadora",
        pattern: /^[A-Za-z0-9\-]{1,3}$/,
        function: ["calificadora"],
      },
      {
        columnName: "custodio",
        pattern: /^[A-Za-z]{0,3}$/,
        mayBeEmpty: true,
        function: ["custodio"],
        singleGroup: true,
      },
      {
        columnName: "fecha_adquisicion",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        date: true,
        notValidate: true,
        function: ["fechaOperacionMenorAlArchivo"],
        singleGroup: true,
        endSingleGroup: true,
      },
    ],
    BG: [
      {
        columnName: "codigo_cuenta",
        pattern: /^[A-Za-z0-9\-\.]{1,13}$/,
        function: [],
      },
      {
        columnName: "descripcion",
        pattern: /^[\s\S]{4,80}$/,
        function: ["codigoCuentaDescripcion"],
      },
      {
        columnName: "saldo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "saldo_cuotas",
        pattern: /^(^-?(0|[1-9][0-9]{0,11}))(\.\d{4,4}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
    ],
    FE: [
      {
        columnName: "codigo_cuenta",
        pattern: /^[A-Za-z0-9\-\.]{1,9}$/,
        function: ["codigoCuenta"],
      },
      {
        columnName: "saldo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
    ],
    VC: [
      {
        columnName: "codigo_item",
        pattern: /^[A-Za-z0-9\-\.]{1,11}$/,
        function: [],
      },
      {
        columnName: "saldo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "cuotas",
        pattern: /^(^-?(0|[1-9][0-9]{0,11}))(\.\d{4,4}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
    ],
    CD: [
      {
        columnName: "fecha",
        pattern:
          /^(20|21|22)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/,
        notValidate: true,
        date: true,
        function: [],
      },
      {
        columnName: "saldo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "valor_cuota",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,4})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    DE: [
      {
        columnName: "codigo",
        pattern: /^[A-Za-z0-9\.]{4,5}$/,
        function: [],
      },
      {
        columnName: "concepto",
        pattern: /^[\s\S]{5,80}$/,
        function: [],
      },
      {
        columnName: "cuenta_a_p",
        pattern: /^[A-Za-z0-9]{5,5}$/,
        function: [],
      },
      {
        columnName: "cuenta_p_a",
        pattern: /^[A-Za-z0-9]{5,5}$/,
        function: [],
      },
      {
        columnName: "nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "monto",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
    ],
    FC: [
      {
        columnName: "codigo_cuenta",
        pattern: /^[A-Za-z0-9\-\.]{1,9}$/,
        function: ["codigoCuenta"],
      },
      {
        columnName: "saldo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
    ],
    LQ: [
      {
        columnName: "codigo_fondo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["codigoFondo"],
      },
      {
        columnName: "tipo_cuenta_liquidez",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoCuentaLiquidez"],
      },
      {
        columnName: "codigo_banco",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["codigoBanco"],
      },
      {
        columnName: "nro_cuenta",
        pattern: /^[A-Za-z0-9\-]{10,20}$/,
        function: [],
      },
      {
        columnName: "cuenta_contable",
        pattern: /^[A-Za-z]{8,8}$/,
        function: ["cuentaContable"],
      },
      {
        columnName: "moneda",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["moneda"],
      },
      {
        columnName: "saldo_mo",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "saldo_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "rango_inferior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "rango_superior",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "tasa_interes",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
    ],
    TR: [
      {
        columnName: "codigo",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["codigoAFP"],
      },
      {
        columnName: "nombre",
        pattern: /^[\s\S]{3,3}$/,
        function: ["nombreAFP"],
      },
      {
        columnName: "r_nro_cuentas",
        pattern: /^(^-?(0|[1-9][0-9]{0,3}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "r_monto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "r_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "r_rezagos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "r_rezagos_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "e_nro_cuentas",
        pattern: /^(^-?(0|[1-9][0-9]{0,3}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "e_monto_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "e_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "e_rezagos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "e_rezagos_nro_cuotas",
        pattern: /^(0|[1-9][0-9]{0,3})(\.\d{4,4}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "total_recibidos_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "total_enviados_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "diferencia_neta_bs",
        pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
        function: ["totalRecibidosBs-totalEnviadosBs"],
      },
    ],
    CC: [
      {
        columnName: "tipo_instrumento",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["tipoInstrumento"],
      },
      {
        columnName: "serie",
        pattern: /^[A-Za-z0-9\-]{5,23}$/,
        function: [],
      },
      {
        columnName: "tasa_relevante",
        pattern: /^(^-?(0|[1-9][0-9]{0,1}))(\.\d{8,8}){1,1}$/,
        function: ["mayorIgualACeroDecimal"],
      },
      {
        columnName: "precio_nominal_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_nominal_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_mercado_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "precio_mercado_bs",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["mayorACeroDecimal"],
      },
      {
        columnName: "cantidad_valores",
        pattern: /^(^-?(0|[1-9][0-9]{0,6}))$/,
        function: ["mayorACeroEntero"],
      },
      {
        columnName: "total_mercado_mo",
        pattern: /^(^-?(0|[1-9][0-9]{0,13}))(\.\d{2,2}){1,1}$/,
        function: ["precioMercadoMOMultiplicadoCantidadValores"],
      },
      {
        columnName: "custodia",
        pattern: /^[A-Za-z]{3,3}$/,
        function: ["custodio"],
      },
    ],
  };

  return TYPE_FILES[typeFile];
}

async function formatearDatosEInsertarCabeceras(
  headers,
  detailsHeaders,
  dataSplit,
  codeCurrentFile
) {
  const formatearPromise = new Promise((resolve, reject) => {
    const arrayDataObject = [];
    let errors = [];
    let errorsValues = [];
    headers?.splice(0, 1); // ELIMINAR ID DE TABLA
    // console.log(codeCurrentFile, dataSplit);

    map(
      ["id_carga_archivos", "cod_institucion", "fecha_informacion"],
      (item, index) => {
        let myIndex = headers.indexOf(item);
        if (myIndex !== -1) {
          headers?.splice(myIndex, 1);
        }
      }
    ); // ELIMINAR ID CARGA ARCHIVOS, CODIGO INSTITUCION, FECHA INFORMACION
    console.log("CABECERAS", codeCurrentFile, headers);

    const formatFile = () => {
      const numberCommas = headers?.length - 1;
      // map(dataSplit, (item, index) => {
      //   console.log(item);
      //   // let myIndex = headers.indexOf(item);
      //   // if (myIndex !== -1) {
      //   //   headers.splice(myIndex, 1);
      //   // }
      // });

      map(dataSplit, (itemDS, index) => {
        let item = itemDS;
        // if (codeCurrentFile === "451") {
        //   console.log("item", item, "length", item.length);
        // }
        //QUITANDO VALOERS UNICODES, EN ESTE CASO 65279 ES UN ESPACIO INVISIBLE QUE LO LEE COMO VACIO PERO EN EL ARCHIVO NO SE VE
        for (let i = 0; i < item.length; i++) {
          if (item.charCodeAt(i) === 65279) {
            console.log("VALUE", item, "INDEX", i, 65279);
            item = item.replace(item.slice(i, 1), "");
            console.log("VALUE", item, "INDEX", i, 65279);
            console.log("ROW", index);
          }
        }
        //#region CODIGO AUX
        // let position1 = 0;
        // let position2 = 1;
        // let position3 = 2;
        // let errorsFormatAuxArray = [];
        // try {
        //   for (let i = 0; i < item.length; i++) {
        //     let stringValue = "";
        //     for (let j = position1 - 7; j < position3 + 7; j++) {
        //       if (item?.[j]) {
        //         stringValue += item[j];
        //       }
        //     }
        //     // stringValue = `${item[position1 - 7] && item[position1 - 7]}${
        //     //   item[position1 - 6] && item[position1 - 6]
        //     // }${item[position1 - 5] && item[position1 - 5]}${
        //     //   item[position1 - 4] && item[position1 - 4]
        //     // }${item[position1 - 3] && item[position1 - 3]}${
        //     //   item[position1 - 2] && item[position1 - 2]
        //     // }${item[position1 - 1] && item[position1 - 1]}${item[position1]}${
        //     //   item[position2]
        //     // }${item[position3]}${item[position3 - 1] && item[position3 - 1]}${
        //     //   item[position3 - 2] && item[position3 - 2]
        //     // }`;
        //     if (
        //       (item[position1] !== '"' &&
        //         item[position2] === "," &&
        //         item[position3] === '"') ||
        //       (item[position1 - 1] === "," &&
        //         item[position1] === '"' &&
        //         item[position2] !== "," &&
        //         item[position3] === '"') ||
        //       (item[position1] === '"' &&
        //         item[position2] === "," &&
        //         item[position3] !== '"')
        //     ) {
        //       console.log(
        //         "POS1",
        //         item[position1],
        //         "POS2",
        //         item[position2],
        //         "POS3",
        //         item[position3]
        //       );
        //       errorsFormatAuxArray.push({
        //         msg: `Error de formato de archivo (posicion ${i}) cerca del valor: ${stringValue}`,
        //         row: index,
        //       });
        //     }
        //     position1++;
        //     position2++;
        //     position3++;
        //     if (position2 > item.length) {
        //       break;
        //     }
        //   }
        // } catch (err) {
        //   console.log(err);
        // }
        //#endregion
        if (
          (item.length === 0 || !item.replace(/\s/g, "").length) &&
          index !== dataSplit.length - 1
        ) {
          errors.push({
            msg: `No debe existir lineas vacias en el archivo`,
            row: index,
          });
        } else {
          if (item.length >= 1) {
            if (item[0] !== '"' || item[item.length - 1] !== '"') {
              errors.push({
                msg: `El formato del archivo no contiene los campos entre comillas correctamente`,
                row: index,
              }); //TODO: validar tambien el '."' y '".'
            } else if (!item.includes('","')) {
              errors.push({
                msg: `El formato del archivo debe estar separado correctamente por comas (,) y comillas dobles ("")`,
                row: index,
              });
            } else {
              let rowNumberCommas = 0;
              const rowWithoutQuotationMarks = item.slice(1, item.length - 1);
              const rowSplit = rowWithoutQuotationMarks.split('","');
              let position1 = 0;
              let position2 = 1;
              let position3 = 2;
              for (
                let index2 = 0;
                index2 < rowWithoutQuotationMarks.length;
                index2++
              ) {
                const item2 = rowWithoutQuotationMarks;
                const stringValue =
                  item2[position1] + item2[position2] + item2[position3];
                if (stringValue.toLowerCase() === '","') {
                  rowNumberCommas++;
                }
                position1++;
                position2++;
                position3++;
                if (position2 > rowWithoutQuotationMarks.length) {
                  break;
                }
              }

              // console.log("rowNumberCommas", rowNumberCommas);
              // console.log("numberCommas", numberCommas);
              // console.log("rowWithoutQuotationMarks", rowWithoutQuotationMarks);
              // console.log("rowSplit.length", rowSplit.length);
              // if (codeCurrentFile === "451") {
              // console.log("rowSplit", rowSplit, "length", rowSplit.length);
              // }

              if (
                rowSplit.length > headers.length ||
                rowSplit.length < headers.length
              ) {
                errors.push({
                  msg: `La fila tiene ${rowSplit.length} campos y la cantidad esperada es de ${headers.length} campos`,
                  row: index,
                });
              } else if (
                rowNumberCommas > numberCommas ||
                rowNumberCommas < numberCommas
              ) {
                errors.push({
                  msg: `El formato del archivo debe estar separado correctamente por comas (,) y comillas dobles ("")`,
                  row: index,
                });
              } else {
                let resultObject = {};
                let counterAux = 0;
                map(headers, (item2, index2) => {
                  let value = rowSplit[counterAux];

                  // if (value[0] !== '"' || value[value.length - 1] !== '"') {
                  //   errorsValues.push({
                  //     msg: `El campo debe estar entre comillas`,
                  //     value: value?.trim().replace(/['"]+/g, ""),
                  //     column: item2,
                  //     row: index,
                  //   });
                  // }
                  resultObject = {
                    ...resultObject,
                    // [item2.toLowerCase()]: value?.trim().replace(/['"]+/g, ""), //QUITAR ESPACIOS Y QUITAR COMILLAS DOBLES
                    [item2.toLowerCase()]: value,
                  };
                  counterAux++;
                });
                // console.log(resultObject);
                arrayDataObject.push(resultObject);
                // console.log("arrayDataObject", arrayDataObject);
              }
            }
          }
        }
      });
      // console.log("arrayDataObject", arrayDataObject);
    };
    // console.log("INFORMACION", codeCurrentFile, dataSplit);

    if (
      (codeCurrentFile === "444" ||
        codeCurrentFile === "445" ||
        codeCurrentFile === "TD" ||
        codeCurrentFile === "TO") &&
      dataSplit[0] !== ""
    ) {
      formatFile();
    } else if (
      codeCurrentFile !== "444" &&
      codeCurrentFile !== "445" &&
      codeCurrentFile !== "TD" &&
      codeCurrentFile !== "TO"
    ) {
      formatFile();
    }

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

async function selectComun(table, params) {
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

async function monedaTipoCambio(params) {
  const { moneda, value1, value2, tipoCambio } = params;
  let tipoCambioFinal = 0;
  for (let i = 0; i < tipoCambio.length; i++) {
    const item = tipoCambio[i];
    if (moneda === item.codigo_valoracion) {
      tipoCambioFinal = item;
    }
  }
  if (isNaN(value1.value) || isNaN(value2.value)) {
    return {
      ok: false,
      message: `El campo no cumple las especificaciones de Tipo de Dato`,
    };
  } else {
    if (moneda === "N") {
      if (value1.value !== value2.value) {
        return {
          ok: false,
          message: `El campo ${value1.key} no es igual a ${value2.key}`,
        };
      }
    } else if (moneda !== "N") {
      if (value1.value !== value2.value * tipoCambioFinal.compra) {
        return {
          ok: false,
          message: `El campo ${value1.key} no es igual a ${value2.key} * el tipo de cambio (${tipoCambioFinal.compra}) que corresponde a la moneda ${moneda}`,
        };
      }
    }
  }

  return {
    ok: true,
    message: "Correcto",
  };
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

async function tasaUltimoHecho(table, params) {
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

async function menorACeroEntero(params) {
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
          message: `El valor si es menor a 0`,
        };
      } else {
        return {
          ok: false,
          message: `El valor debe ser menor a 0`,
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

async function menorACeroDecimal(params) {
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
          message: `El valor si es menor a 0`,
        };
      } else {
        return {
          ok: false,
          message: `El valor debe ser menor a 0`,
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

async function menorIgualACeroEntero(params) {
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
          message: `El valor si es menor o igual a 0`,
        };
      } else {
        return {
          ok: false,
          message: `El valor no es menor o igual a 0`,
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

async function menorIgualACeroDecimal(params) {
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
          message: `El valor si es menor o igual a 0`,
        };
      } else {
        return {
          ok: false,
          message: `El valor no es menor o igual a 0`,
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

async function igualA(params) {
  const { value, equalTo } = params;

  try {
    if (value === equalTo) {
      return {
        ok: true,
        message: `El valor ${value} si es igual a ${equalTo}`,
      };
    } else {
      return {
        ok: false,
        message: `El valor ${value} no es igual a ${equalTo}`,
      };
    }
  } catch (err) {
    return {
      ok: false,
      message: `Ocurrio un error inesperado. ERROR: ${err.message}`,
    };
  }
}

async function rango(params) {
  const { value, valueTo, valueFrom } = params;

  try {
    if (value >= valueTo && value <= valueFrom) {
      return {
        ok: true,
        message: `El valor ${value} esta entre ${valueTo} y ${valueFrom}`,
      };
    } else {
      return {
        ok: false,
        message: `El valor ${value} no esta entre ${valueTo} y ${valueFrom}`,
      };
    }
  } catch (err) {
    return {
      ok: false,
      message: `Ocurrio un error inesperado. ERROR: ${err.message}`,
    };
  }
}

async function compararFechas(params) {
  const { date1, operator, date2 } = params;
  let textOperator = "";
  if (operator === ">") {
    textOperator = "mayor";
  } else if (operator === "<") {
    textOperator = "menor";
  } else if (operator === "=") {
    textOperator = "igual";
  }
  try {
    if (isNaN(Date.parse(date1)) || isNaN(Date.parse(date2))) {
      return {
        ok: false,
        message: `El campo no cumple las especificaciones de Tipo de Dato`,
      };
    } else {
      if (operator === ">") {
        if (date1 > date2) {
          return {
            ok: true,
            message: `La fecha ${date1} es ${textOperator} a ${date2}`,
          };
        } else {
          return {
            ok: false,
            message: `La no fecha ${date1} es ${textOperator} a ${date2}`,
          };
        }
      } else if (operator === "<") {
        if (date1 > date2) {
          return {
            ok: true,
            message: `La fecha ${date1} es ${textOperator} a ${date2}`,
          };
        } else {
          return {
            ok: false,
            message: `La no fecha ${date1} es ${textOperator} a ${date2}`,
          };
        }
      } else if (operator === "=") {
        if (date1 > date2) {
          return {
            ok: true,
            message: `La fecha ${date1} es ${textOperator} a ${date2}`,
          };
        } else {
          return {
            ok: false,
            message: `La no fecha ${date1} es ${textOperator} a ${date2}`,
          };
        }
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

async function pais(table, params) {
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

function tasaEmision(tipoInteresValue, tasaEmisionValue) {
  try {
    if (tipoInteresValue !== "R" && tipoInteresValue !== "D")
      return "El Tipo de Interes debe ser 'R' o 'D'";
    if (tipoInteresValue === "R" && Number(tasaEmisionValue) <= 0)
      return "La Tasa Emisión debe ser mayor a '0', debido a que Tipo Interes es 'R'";
    if (tipoInteresValue === "D" && Number(tasaEmisionValue) > 0)
      return "La Tasa Emision debe ser '0', debido a que Tipo Interes es 'D'";
    return true;
  } catch (err) {
    throw err;
  }
}
function serieEmision(tipoInstrumentoValue, serieEmisionValue) {
  try {
    const serieEmisionValues1 = ["U", "A"];
    const serieEmisionValues2 = ["1", "A", "B"];
    if (
      tipoInstrumentoValue === "ACC" &&
      !includes(serieEmisionValues1, serieEmisionValue)
    )
      return "La Serie de Emision debe ser 'U' o 'A', debido a que Tipo Instrumento es 'ACC'";
    if (
      tipoInstrumentoValue === "CFC" &&
      !includes(serieEmisionValues2, serieEmisionValue)
    )
      return "La Serie de Emision debe ser '1', 'A' o 'B', debido a que Tipo Instrumento es 'CFC'";
    return true;
  } catch (err) {
    throw err;
  }
}

function calificacionConInstrumentoEstatico(
  tipoInstrumento,
  tiposInstrumentos,
  calificacion,
  calificaciones,
  calificacionesVacio
) {
  const calificacionesMap = map(calificaciones, "descripcion");
  const calificacionesVacioMap = map(calificacionesVacio, "descripcion");
  if (!includes(tiposInstrumentos, tipoInstrumento))
    return `El Tipo de Instrumento esperado es ${tiposInstrumentos?.join(
      " o "
    )}`;
  if (tipoInstrumento === "CFC" && !includes(calificacionesMap, calificacion))
    return "La calificación no se encuentra en ninguna calificación válida (tipo instrumento CFC)";
  if (tipoInstrumento === "ACC" && isEmpty(calificacion))
    if (!includes(calificacionesVacioMap, calificacion))
      return "La calificación no se encuentra en ninguna calificación válida (tipo instrumento ACC)";

  return true;
}

async function plazoCupon(params) {
  const { plazo_cupon, nro_pago } = params;

  if (isNaN(plazo_cupon) || isNaN(nro_pago)) {
    return {
      ok: false,
      message: `El campo plazo_cupon o nro_pago no son numeros`,
    };
  }

  if (nro_pago > 0) {
    if (plazo_cupon <= 0) {
      return {
        ok: false,
        message: `El campo nro_pago es mayor a 0 por lo tanto plazo_cupon debe ser mayor a 0`,
      };
    }
  } else if (nro_pago === 0) {
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
    _instrumento25,
    _tipoValoracion22,
    _tipoValoracion31,
    _tipoValoracion210,
  } = params;

  const resultInstrumento135 = await _instrumento135.resultFinal;
  const resultInstrumento1 = await _instrumento1.resultFinal;
  const resultInstrumento25 = await _instrumento25.resultFinal;
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

  map(resultInstrumento25, (item, index) => {
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
  const { total, fields, dates } = params;
  try {
    let fieldsErrorText = "";
    let result = fields[0].value;
    let fieldsResultText = `${fields[0].key}`;
    // if (!dates) {
    //   console.log("TOTAL", total);
    //   console.log("FIELDS", fields);
    // }

    map(fields, (item, index) => {
      if (isNaN(item.value) && index % 2 === 0) {
        fieldsErrorText += `${item.key} o`;
      }
    });
    if (fieldsErrorText.length >= 1) {
      return {
        ok: false,
        message: `El campo ${fieldsErrorText.substring(
          0,
          fieldsErrorText.lastIndexOf("o")
        )}no cumple las especificaciones de Tipo de Dato para realizar la operación de ${
          total.key
        }`,
      };
    }

    map(fields, (item, index) => {
      if (index % 2 !== 0) {
        const operator = fields[index];
        if (operator === "+") {
          result = result + fields[index + 1].value;
          index !== fields.length - 1 && (fieldsResultText += ` + `);
          fieldsResultText += `${fields[index + 1].key}`;
        } else if (operator === "-") {
          result = result - fields[index + 1].value;
          index !== fields.length - 1 && (fieldsResultText += ` - `);
          fieldsResultText += `${fields[index + 1].key}`;
        } else if (operator === "*") {
          result = result * fields[index + 1].value;
          index !== fields.length - 1 && (fieldsResultText += ` * `);
          fieldsResultText += `${fields[index + 1].key}`;
        } else if (operator === "/") {
          result = result / fields[index + 1].value;
          index !== fields.length - 1 && (fieldsResultText += ` / `);
          fieldsResultText += `${fields[index + 1].key}`;
        } else {
          result = result + fields[index + 1].value;
          index !== fields.length - 1 && (fieldsResultText += ` + `);
          fieldsResultText += `${fields[index + 1].key}`;
        }
      }
    });

    if (dates) {
      result = Math.abs(result) / (1000 * 3600 * 24);
      if (result === total.value) {
        return {
          ok: true,
          message: `El valor si es correcto`,
        };
      } else {
        return {
          ok: false,
          message: `El resultado (${result}) de ${fieldsResultText} no es igual a ${total.key}`,
        };
      }
    } else {
      let indexPattern = new RegExp(total.pattern).toString().indexOf(".");
      let textPattern = new RegExp(total.pattern).toString();
      if (textPattern.slice(indexPattern, indexPattern + 4) === ".\\d{") {
        // console.log(textPattern.slice(indexPattern + 6, indexPattern + 7));
        let fixed = parseInt(
          textPattern.slice(indexPattern + 6, indexPattern + 7)
        );
        if (!isNaN(fixed) && fixed) {
          result = result.toFixed(fixed);
          total.value = total.value.toFixed(fixed);
        }
      }
      let isEqual =
        typeof result === "string"
          ? result === total.value.toString()
          : result === total.value;
      // console.log("RESULT", typeof result, result);
      // console.log("total.value", typeof total.value, total.value);
      if (isEqual) {
        return {
          ok: true,
          message: `El valor si es correcto`,
        };
      } else {
        return {
          ok: false,
          message: `El resultado calculado (${result}) de ${fieldsResultText} no es igual a ${total.key}`,
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

async function unicoPor(params) {
  try {
    const { fileArrayObject, field, validatedBy } = params;
    const data = map(fileArrayObject, (item, index) => ({ ...item, index }));
    const uniquesValidatedBy = uniqBy(data, validatedBy);
    const duplicates = [];
    forEach(uniquesValidatedBy, (unique) => {
      const ocurrences = filter(
        data,
        (item) => item[validatedBy] === unique[validatedBy]
      );
      if (size(ocurrences) !== uniqBy(ocurrences, field)) {
        const positionsByField = reduce(
          ocurrences,
          (acc, item, index) => {
            const value = item[field];
            if (!acc[value]) acc[value] = [index];
            else acc[value].push(index);
            return acc;
          },
          {}
        );
        const nonUniques = pickBy(
          positionsByField,
          (positions) => size(positions) > 1
        );

        forEach(flatMap(Object.values(nonUniques)), (position) =>
          duplicates.push(ocurrences[position])
        );
      }
    });

    return map(duplicates, (duplicate) => ({
      ok: false,
      message: `El campo debe ser único por ${validatedBy} (${duplicate[validatedBy]})`,
      value: duplicate?.[field],
      row: duplicate?.index,
    }));
  } catch (err) {
    throw err;
  }
}

async function combinacionUnicaPorArchivo(params) {}

async function grupoUnico(params) {
  const { fileArrayValidateObject, fileArrayObject, codeCurrentFile } = params;
  const fields = [];
  const result = [];
  for (let i = 0; i < fileArrayObject.length; i++) {
    const item = fileArrayObject[i];
    let keyFinal = "";
    let valueFinal = "";
    for (let j = 0; j < fileArrayValidateObject.length; j++) {
      const item2 = fileArrayValidateObject[j];
      const value = item[item2.columnName];
      const columnName = item2.columnName;
      if (item2?.singleGroup === true) {
        keyFinal +=
          item2.endSingleGroup === true ? `${columnName}` : `${columnName}, `;
        valueFinal += `${value}`;
      }
    }
    fields.push({
      keys: keyFinal,
      values: valueFinal,
      row: i,
    });
  }
  console.log(fields);
  const search = fields.reduce((acc, item, index) => {
    // console.log(index);
    acc[item.values] = ++acc[item.values] || 0;
    return acc;
  }, {});
  const duplicates = fields.filter((item, index) => {
    return search[item.values];
  });

  if (duplicates.length >= 0) {
    map(duplicates, (item, index) => {
      result.push({
        ok: false,
        message:
          codeCurrentFile === "481" ||
          codeCurrentFile === "482" ||
          codeCurrentFile === "DC"
            ? "Un valor seriado con idénticas características, no puede estar desagrupado en varios registros"
            : `La combinación de los campos debe ser único`,
        value: item.values,
        column: item.keys,
        row: item.row,
      });
    });
  }

  return result;
}

//FUNCION SIN USAR E INCOMPLETA
async function agrupacion(params) {
  const { fileArrayValidateObject, fileArrayObject } = params;
  const fields = [];
  const result = [];
  const CONDITIONALS = {
    groupingCode: null,
    indexCounter: 0,
  };
  // console.log("fileArrayObject", fileArrayObject);
  // console.log("fileArrayValidateObject", fileArrayValidateObject);
  forEach(fileArrayObject, (itemA, indexA) => {
    let keyFinal = [];
    let valueFinal = [];
    forEach(fileArrayValidateObject, (itemB, indexB) => {
      const value = itemA[itemB.columnName];
      const columnName = itemB.columnName;
      if (itemB?.grouping === true) {
        keyFinal.push(columnName);
        valueFinal.push(value);
      }
    });
    fields.push({
      keys: keyFinal,
      values: valueFinal,
      row: indexA,
    });
  });
  // CONDITIONALS.groupingCode = fields?.[0]?.values?.join("+");

  forEach(fields, (itemA, indexA) => {
    const valuesFields = itemA.values.join("+");
    console.log("VALUEFIELDS", valuesFields);
    if (CONDITIONALS.groupingCode !== valuesFields) {
      CONDITIONALS.groupingCode = valuesFields;
      CONDITIONALS.indexCounter = indexA;
      // console.log("CONDITIONALS.groupingCode", CONDITIONALS.groupingCode);
      // console.log("CONDITIONALS.indexCounter", CONDITIONALS.indexCounter);
    } else {
      // console.log(
      //   "FILTER",
      //   filter(fields, (itemF, indexF) => indexF > CONDITIONALS.indexCounter)
      // );
      // const findRepeatValue = find(
      //   filter(fields, (itemF, indexF) => indexF > CONDITIONALS.indexCounter)
      // );
      // console.log(findRepeatValue);
      // if (findRepeatValue) {
      //   console.log("ERROR");
      // }
    }
  });
  // forEach()
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
  formatearDatosEInsertarCabeceras,
  obtenerInformacionDeArchivo,
  tipoCuenta,
  entidadFinanciera,
  moneda,
  emisor,
  pais,
  tipoAmortizacion,
  tipoInteres,
  tipoTasa,
  tasaEmision,
  serieEmision,
  calificacionRiesgoConsultaMultiple,
  calificacionConInstrumentoEstatico,
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
  menorACeroEntero,
  menorACeroDecimal,
  menorIgualACeroDecimal,
  menorIgualACeroEntero,
  igualA,
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
  tasaUltimoHecho,
  unico,
  unicoPor,
  combinacionUnicaPorArchivo,
  grupoUnico,
  selectComun,
  compararFechas,
  monedaTipoCambio,
  rango,
  agrupacion,
};
