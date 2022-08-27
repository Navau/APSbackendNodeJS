const multer = require("multer");
const path = require("path");
const { map, reduce, findIndex, filter } = require("lodash");
const fs = require("fs");
const pool = require("../database");
const moment = require("moment");

const {
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
  accionesMonedaOriginal,
  obtenerInformacionDeArchivo,
  flujoTotal,
  tipoCuenta,
  entidadFinanciera,
  moneda,
  calificacionRiesgoConsultaMultiple,
  CortoLargoPlazo,
  codigoValoracionConInstrumento,
  fechaOperacionMenor,
  montoFinalConTipoDeCambio,
  tipoDeCambio,
  bolsa,
  tipoValoracion,
  cantidadPorPrecio,
  totalBsMenosPrevisionesInversiones,
  tipoActivo,
  mayorACeroDecimal,
  mayorACeroEntero,
  saldoAntMasAltasBajasMasActualizacion,
  saldoAntMenosBajasMasDepreciacionMesMasActualizacion,
  saldoFinalMesAnteriorBsMasMovimientoMesBs,
  depreciacionPeriodoMasAltasBajasDepreciacion,
  operacionEntreColumnas,
  emisor,
  tipoOperacion,
  lugarNegociacion,
  cartera,
} = require("../utils/formatoCamposArchivos.utils");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
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
  respErrorServidor500END,
  respArchivoErroneo200,
} = require("../utils/respuesta.utils");
const { SelectInnerJoinSimple } = require("../utils/multiConsulta.utils");

var nameTable = "";
var codeCurrentFile = "";
var codeCurrentFilesArray = [];
var periodicidadFinal = null;
var nameTableErrors = "";
var errors = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO
var errorsCode = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO
var dependenciesArray = []; //DEPENDENCIAS Y RELACIONES ENTRE ARCHIVOS

async function obtenerInstitucion(params) {
  const obtenerListaInstitucion = new Promise(async (resolve, reject) => {
    const params = {
      select: [
        `"APS_seg_institucion".codigo`,
        `"APS_param_clasificador_comun".descripcion`,
      ],
      from: [`"APS_seg_institucion"`],
      innerjoin: [
        {
          join: `"APS_param_clasificador_comun"`,
          on: [
            `"APS_param_clasificador_comun".id_clasificador_comun = "APS_seg_institucion".id_tipo_mercado`,
          ],
        },
      ],
      // where: [{ key: `"APS_seg_usuario".id_usuario`, value: id_usuario }],
    };
    let query = SelectInnerJoinSimple(params);
    await pool
      .query(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });

  return obtenerListaInstitucion;
}

function verificarArchivosRequeridos(archivosRequeridos, archivosSubidos) {
  const verificarArchivos = new Promise((resolve, reject) => {
    const arrayNameFilesToUpperCase = (array, property) => {
      var newArray = [];
      map(array, (item, index) => {
        const myObjLower = { ...item, archivo: item[property].toUpperCase() };
        newArray.push(myObjLower);
      });
      return newArray;
    };

    let arrayA = arrayNameFilesToUpperCase(
      archivosRequeridos.result,
      "archivo"
    );
    let arrayB = arrayNameFilesToUpperCase(archivosSubidos, "originalname");
    let arrayResult = [];
    let arrayResult2 = [];
    let arrayResult3Compare = [];

    map(arrayA, (itemR, indexR) => {
      arrayResult2.push(itemR);
      map(arrayB, (itemU, indexU) => {
        if (itemR.archivo === itemU.originalname) {
          arrayResult.push(itemR);
        }
      });
    });
    map(arrayResult, (item, index) => {
      let myIndex = findIndex(arrayResult2, (itemFI) => {
        return itemFI.archivo == item.archivo; // or el.nombre=='T NORTE';
      });
      if (myIndex !== -1) {
        arrayResult2.splice(myIndex, 1);
      }
    });
    map(arrayResult, (item, index) => {
      arrayResult3Compare.push(item);
    });

    resolve({
      ok: JSON.stringify(arrayA) === JSON.stringify(arrayResult3Compare),
      missingFiles: arrayResult2,
      currentFiles: arrayResult3Compare.sort((a, b) => {
        if (a.archivo.toLowerCase() < b.archivo.toLowerCase()) {
          return -1;
        }
        if (a.archivo.toLowerCase() > b.archivo.toLowerCase()) {
          return 1;
        }
        return 0;
      }),
    });
  });

  return verificarArchivos;
}

async function obtenerListaArchivos(params) {
  const id_rol = params.req.user.id_rol;
  const id_usuario = params.req.user.id_usuario;
  const typeFiles = params.typeFiles;
  const tipo_periodo = params.req?.body?.tipo_periodo;
  const fecha_operacion = params.req?.body?.fecha_operacion
    ? params.req.body.fecha_operacion
    : moment().format("YYYY-MM-DD");
  let periodicidad = [154]; //VALOR POR DEFECTO

  if (
    typeFiles[0].originalname.substring(0, 1) === "M" &&
    tipo_periodo === "D"
  ) {
    if (typeFiles.length >= 2) {
      periodicidad = [154, 219];
    } else {
      periodicidad = [154];
    }
  } else if (
    typeFiles[0].originalname.substring(0, 3) === "108" &&
    tipo_periodo === "D"
  ) {
    periodicidad = [154];
    periodicidadFinal = 154;
  } else if (
    typeFiles[0].originalname.substring(0, 3) === "108" &&
    tipo_periodo === "M"
  ) {
    periodicidad = [155];
    periodicidadFinal = 155;
  }

  const obtenerListaArchivosPromise = new Promise(async (resolve, reject) => {
    let query = `SELECT replace(replace(replace(replace(replace(replace(replace(replace(replace(
      "APS_param_archivos_pensiones_seguros".nombre::text, 
      'nnn'::text, "APS_seg_institucion".codigo::text),
      'aaaa'::text, EXTRACT(year FROM TIMESTAMP '${fecha_operacion}')::text),
      'mm'::text, lpad(EXTRACT(month FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
      'dd'::text, lpad(EXTRACT(day FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
      'AA'::text, substring(EXTRACT(year FROM TIMESTAMP '${fecha_operacion}')::text from 3 for 2)),
      'MM'::text, lpad(EXTRACT(month FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
      'DD'::text, lpad(EXTRACT(day FROM TIMESTAMP '${fecha_operacion}')::text, 2, '0'::text)),
      'nntt'::text, "APS_seg_institucion".codigo::text ||
      "APS_param_archivos_pensiones_seguros".codigo::text),
      'nn'::text, "APS_seg_institucion".codigo::text) AS archivo,
      "APS_seg_usuario".id_usuario,
      "APS_param_archivos_pensiones_seguros".archivo_vacio 
      FROM "APS_param_archivos_pensiones_seguros" 
      JOIN "APS_param_clasificador_comun" 
      ON "APS_param_archivos_pensiones_seguros".id_periodicidad = "APS_param_clasificador_comun".id_clasificador_comun 
      JOIN "APS_seg_usuario_rol" 
      ON "APS_seg_usuario_rol".id_rol = "APS_param_archivos_pensiones_seguros".id_rol 
      JOIN "APS_seg_usuario" 
      ON "APS_seg_usuario".id_usuario = "APS_seg_usuario_rol".id_usuario 
      JOIN "APS_seg_institucion" 
      ON "APS_seg_institucion".id_institucion = "APS_seg_usuario".id_institucion 
      WHERE "APS_param_clasificador_comun".id_clasificador_comun in (${periodicidad.join()}) 
      AND "APS_seg_usuario".id_usuario = '${id_usuario}' 
      AND "APS_seg_usuario_rol".id_rol = '${id_rol}' 
      AND "APS_param_archivos_pensiones_seguros".status = true;`;
    console.log(query);

    await pool
      .query(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });

  return obtenerListaArchivosPromise;
}

async function seleccionarTablas(params) {
  let result = {
    code: null,
    table: null,
  };
  map(params.files, (item, index) => {
    if (item.originalname.substring(0, 3) === "108") {
      result = {
        code: "108",
        table: "APS_aud_carga_archivos_pensiones_seguros",
        tableErrors: "APS_aud_errores_carga_archivos_pensiones_seguros",
      };
    } else if (
      item.originalname.substring(0, 1) === "M" &&
      (item.originalname.includes("K.") ||
        item.originalname.includes("L.") ||
        item.originalname.includes("N.") ||
        item.originalname.includes("P."))
    ) {
      result = {
        code: "M",
        table: "APS_aud_carga_archivos_bolsa",
        tableErrors: "APS_aud_errores_carga_archivos_bolsa",
      };
    }
  });
  return result;
}

async function validarArchivosIteraciones(params) {
  const { req, res, fechaOperacion, fechaInicialOperacion } = params;
  const validarArchivoPromise = new Promise(async (resolve, reject) => {
    let isErrorPast = false;
    let isOkValidate = false;
    const filesReaded = []; //ARCHIVOS LEIDOS Y EXISTENTES
    const filesUploaded = req?.files; //ARCHIVOS SUBIDOS Y TEMPORALES
    const archivosRequeridos = await obtenerListaArchivos({
      req,
      res,
      typeFiles: filesUploaded,
    })
      .then((response) => {
        return {
          result: response.rows,
        };
      })
      .catch((err) => {
        return { err };
      });
    let isAllFiles;
    await verificarArchivosRequeridos(archivosRequeridos, filesUploaded)
      .then((response) => {
        isAllFiles = response;
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(async () => {
        // console.log(isAllFiles);
        // console.log(archivosRequeridos);
        console.log(isAllFiles);
        if (archivosRequeridos.result.length >= 1) {
          let aux = false;
          let fechaOperacionAux = fechaOperacion;
          map(filesUploaded, (item, index) => {
            if (item.originalname.substring(0, 3) === "108") {
              fechaOperacionAux = fechaOperacion;
            }
            if (
              item.originalname.substring(0, 1) === "M" &&
              (item.originalname.includes("K.") ||
                item.originalname.includes("L.") ||
                item.originalname.includes("N.") ||
                item.originalname.includes("P."))
            ) {
              fechaOperacionAux = fechaOperacion.substring(
                2,
                fechaOperacion.length
              );
            }
            if (!item.originalname.includes(fechaOperacionAux)) {
              errors.push({
                archivo: item.originalname,
                tipo_error: "NOMBRE ARCHIVO ERRONEO",
                descripcion:
                  "El nombre del archivo no coincide con la fecha de operación.",
              });
              aux = true;
            }
            if (index === filesUploaded.length - 1 && aux === true) {
              resolve(errors);
            }
          });
        } else {
          if (isAllFiles.currentFiles.length === 0) {
            resolve({
              message: "No existen archivos disponibles para el usuario.",
            });
            return;
          }
        }
        // if (
        //   isAllFiles.currentFiles.length === 0 &&
        //   isAllFiles.missingFiles.length >= 1
        // ) {
        //   map(isAllFiles.missingFiles, (item, index) => {
        //     errors.push({
        //       archivo: item.archivo,
        //       tipo_error: "ARCHIVO FALTANTE",
        //       descripcion:
        //         "El archivo subido no coincide con los archivos requeridos del usuario.",
        //     });
        //   });
        //   resolve(errors);
        //   return;
        // }
        for (let index = 0; index < isAllFiles.currentFiles.length; index++) {
          // console.log("codeCurrentFilesArray: ", codeCurrentFilesArray);
          // console.log("isAllFiles.currentFiles: ", isAllFiles.currentFiles);
          // console.log("LENGTH isAllFiles: ", isAllFiles.currentFiles.length);
          // console.log("INDEX: ", index);
          const item = isAllFiles.currentFiles[index];
          // console.log("TEST PARA VER ASYNC", item.archivo);
          const filePath = `./uploads/tmp/${item.archivo}`;
          const data = fs.readFileSync(filePath, "utf8");
          let dataSplit = null;
          if (data.includes("\r\n")) {
            dataSplit = data.split("\r\n");
          } else if (data.includes("\n")) {
            dataSplit = data.split("\n");
          } else {
            dataSplit = null;
          }
          if (
            isAllFiles.missingFiles.length === 0 &&
            isErrorPast === false &&
            isAllFiles.ok === false
          ) {
            errors.push({
              archivo: "",
              tipo_error: "USUARIO SIN ARCHIVOS REQUERIDOS",
              descripcion: "El usuario no cuenta con archivos requeridos.",
            });
            isOkValidate = true;
            isErrorPast = true;
          } else if (isAllFiles.ok === false && isErrorPast === false) {
            map(isAllFiles.missingFiles, (item, index) => {
              errors.push({
                archivo: item.archivo,
                tipo_error: "ARCHIVO FALTANTE",
                descripcion:
                  "El archivo subido no coincide con los archivos requeridos del usuario.",
              });
            });
            isOkValidate = true;
            isErrorPast = true;
          } else if (isOkValidate === false && isErrorPast === false) {
            if (data.length === 0 && item.archivo_vacio === false) {
              //TRUE SI EL ARCHIVO PUEDE ESTAR VACIO, FALSE SI EL ARCHIVO NO PUEDE ESTAR VACIO
              errors.push({
                archivo: item.archivo,
                tipo_error: "CONTENIDO VACIO",
                descripcion: "El contenido del archivo esta vacío.",
              });
            } else if (data.length === 0) {
              let myIndex = findIndex(isAllFiles.currentFiles, (itemFI) => {
                return itemFI.archivo == item.archivo;
              });
              if (myIndex !== -1) {
                isAllFiles.currentFiles.splice(myIndex, 1);
              }
              index--;
            } else {
              if (dataSplit === null) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "FORMATO DE INFORMACION ERRONEO",
                  mensaje:
                    "Ocurrió un error debido al formato del contenido del archivo.",
                });
              } else {
                isOkQuerys = true;
                let headers = null;
                let infoArchivo = null;
                let arrayDataObject = null;

                await obtenerInformacionDeArchivo(item.archivo)
                  .then((response) => {
                    infoArchivo = response;
                  })
                  .finally(async () => {
                    codeCurrentFile = await infoArchivo.codeCurrentFile;
                    nameTable = await infoArchivo.nameTable;
                    headers = await infoArchivo.headers;

                    codeCurrentFilesArray.push(codeCurrentFile);

                    //#region VALIDADORES
                    const instrumento = infoArchivo?.paramsInstrumento
                      ? await tipoInstrumento(
                          infoArchivo.paramsInstrumento.table,
                          infoArchivo.paramsInstrumento.params
                        )
                      : null;
                    const _tipoOperacion = infoArchivo?.paramstipoOperacion
                      ? await tipoOperacion(
                          infoArchivo.paramstipoOperacion.table,
                          infoArchivo.paramstipoOperacion.params
                        )
                      : null;
                    const _lugarNegociacion =
                      infoArchivo?.paramsLugarNegociacion
                        ? await lugarNegociacion(
                            infoArchivo.paramsLugarNegociacion.table,
                            infoArchivo.paramsLugarNegociacion.params
                          )
                        : null;
                    const _lugarNegociacionVacio =
                      infoArchivo?.paramsLugarNegociacionVacio
                        ? await lugarNegociacion(
                            infoArchivo.paramsLugarNegociacionVacio.table,
                            infoArchivo.paramsLugarNegociacionVacio.params
                          )
                        : null;
                    const _tipoActivo = infoArchivo?.paramsTipoActivo
                      ? await tipoActivo(
                          infoArchivo.paramsTipoActivo.table,
                          infoArchivo.paramsTipoActivo.params
                        )
                      : null;
                    const codValoracionInstrumento =
                      infoArchivo?.paramsCodValoracion
                        ? await codigoValoracionConInstrumento(
                            infoArchivo.paramsCodValoracion.table,
                            infoArchivo.paramsCodValoracion.params
                          )
                        : null;
                    const codOperacion = infoArchivo?.paramsCodOperacion
                      ? await codigoOperacion(
                          infoArchivo.paramsCodOperacion.table,
                          infoArchivo.paramsCodOperacion.params
                        )
                      : null;
                    const _tipoCuenta = infoArchivo?.paramsTipoCuenta
                      ? await tipoCuenta(
                          infoArchivo.paramsTipoCuenta.table,
                          infoArchivo.paramsTipoCuenta.params
                        )
                      : null;
                    const _entidadFinanciera =
                      infoArchivo?.paramsEntidadFinanciera
                        ? await entidadFinanciera(
                            infoArchivo.paramsEntidadFinanciera.table,
                            infoArchivo.paramsEntidadFinanciera.params
                          )
                        : null;
                    const _moneda = infoArchivo?.paramsMoneda
                      ? await moneda(
                          infoArchivo.paramsMoneda.table,
                          infoArchivo.paramsMoneda.params
                        )
                      : null;
                    const _emisor = infoArchivo?.paramsEmisor
                      ? await emisor(
                          infoArchivo.paramsEmisor.table,
                          infoArchivo.paramsEmisor.params
                        )
                      : null;
                    const _tipoAmortizacion =
                      infoArchivo?.paramsTipoAmortizacion
                        ? await emisor(
                            infoArchivo.paramsTipoAmortizacion.table,
                            infoArchivo.paramsTipoAmortizacion.params
                          )
                        : null;
                    const _tipoInteres = infoArchivo?.paramsTipoInteres
                      ? await emisor(
                          infoArchivo.paramsTipoInteres.table,
                          infoArchivo.paramsTipoInteres.params
                        )
                      : null;
                    const _tipoTasa = infoArchivo?.paramsTipoTasa
                      ? await emisor(
                          infoArchivo.paramsTipoTasa.table,
                          infoArchivo.paramsTipoTasa.params
                        )
                      : null;
                    const codMercado = infoArchivo?.paramsCodMercado
                      ? await codigoMercado(
                          infoArchivo.paramsCodMercado.table,
                          infoArchivo.paramsCodMercado.params
                        )
                      : null;
                    const calfRiesgo = infoArchivo?.paramsCalfRiesgo
                      ? await calificacionRiesgo(
                          infoArchivo.paramsCalfRiesgo.table,
                          infoArchivo.paramsCalfRiesgo.params
                        )
                      : null;
                    const codCustodia = infoArchivo?.paramsCodCustodia
                      ? await codigoCustodia(
                          infoArchivo.paramsCodCustodia.table,
                          infoArchivo.paramsCodCustodia.params
                        )
                      : null;

                    const instrumento135 = infoArchivo?.paramsInstrumento135
                      ? await tipoInstrumento(
                          infoArchivo.paramsInstrumento135.table,
                          infoArchivo.paramsInstrumento135.params
                        )
                      : null;
                    const instrumento136 = infoArchivo?.paramsInstrumento136
                      ? await tipoInstrumento(
                          infoArchivo.paramsInstrumento136.table,
                          infoArchivo.paramsInstrumento136.params
                        )
                      : null;
                    const cortoPlazo = infoArchivo?.paramsCortoPlazo
                      ? await CortoLargoPlazo(
                          infoArchivo.paramsCortoPlazo.table,
                          infoArchivo.paramsCortoPlazo.params
                        )
                      : null;
                    const largoPlazo = infoArchivo?.paramsLargoPlazo
                      ? await CortoLargoPlazo(
                          infoArchivo.paramsLargoPlazo.table,
                          infoArchivo.paramsLargoPlazo.params
                        )
                      : null;
                    const calfRiesgoNormal = infoArchivo?.paramsCalfRiesgo
                      ? await calificacionRiesgo(
                          infoArchivo.paramsCalfRiesgo.table,
                          infoArchivo.paramsCalfRiesgo.params
                        )
                      : null;
                    const tipoCambio = infoArchivo?.paramsTipoDeCambio
                      ? await tipoDeCambio(
                          infoArchivo.paramsTipoDeCambio.table,
                          infoArchivo.paramsTipoDeCambio.params
                        )
                      : null;
                    const _bolsa = infoArchivo?.paramsBolsa
                      ? await bolsa(
                          infoArchivo.paramsBolsa.table,
                          infoArchivo.paramsBolsa.params
                        )
                      : null;
                    const _tipoValoracion = infoArchivo?.paramsTipoValoracion
                      ? await tipoValoracion(
                          infoArchivo.paramsTipoValoracion.table,
                          infoArchivo.paramsTipoValoracion.params
                        )
                      : null;

                    const _cadenaCombinadalugarNegTipoOperTipoInstrum =
                      infoArchivo?.paramsCadenaCombinadalugarNegTipoOperTipoInstrum
                        ? await tipoValoracion(
                            infoArchivo
                              .paramsCadenaCombinadalugarNegTipoOperTipoInstrum
                              .table,
                            infoArchivo
                              .paramsCadenaCombinadalugarNegTipoOperTipoInstrum
                              .params
                          )
                        : null;

                    // console.log("TEST AAAAA");

                    //#endregion

                    await formatearDatosEInsertarCabeceras(headers, dataSplit)
                      .then(async (response) => {
                        arrayDataObject = response;
                      })
                      .catch((err) => {
                        // console.log(err);
                        arrayDataObject = err;
                        map(err.errors, (itemError, indexError) => {
                          errors.push({
                            archivo: item.archivo,
                            tipo_error: "ERROR DE CONTENIDO",
                            descripcion: itemError.msg,
                            fila: itemError.row,
                          });
                        });
                      })
                      .finally(async () => {
                        if (!arrayDataObject?.err) {
                          let arrayValidateObject = await obtenerValidaciones(
                            codeCurrentFile
                          );

                          await validacionesCamposArchivosFragmentoCodigo({
                            arrayDataObject,
                            arrayValidateObject,
                            fechaOperacion,
                            fechaInicialOperacion,
                            item,
                            infoArchivo,
                            instrumento,
                            _lugarNegociacion,
                            _lugarNegociacionVacio,
                            _tipoOperacion,
                            _tipoActivo,
                            codValoracionInstrumento,
                            codOperacion,
                            _tipoCuenta,
                            _entidadFinanciera,
                            _moneda,
                            _emisor,
                            _tipoAmortizacion,
                            _tipoInteres,
                            _tipoTasa,
                            codMercado,
                            calfRiesgo,
                            codCustodia,
                            instrumento135,
                            instrumento136,
                            cortoPlazo,
                            largoPlazo,
                            calfRiesgoNormal,
                            tipoCambio,
                            _bolsa,
                            _tipoValoracion,
                            _cadenaCombinadalugarNegTipoOperTipoInstrum,
                          });
                        }
                      });
                  });
              }
            }
          } else {
            console.log("ELSE TEST");
          }

          filesReaded.push(dataSplit);

          if (index === isAllFiles.currentFiles.length - 1) {
            resolve({ filesReaded });
          }
        }
      });
  });

  return validarArchivoPromise;
}

async function validacionesCamposArchivosFragmentoCodigo(params) {
  const validacionesCamposArchivosFragmentoCodigoPromise = new Promise(
    (resolve, reject) => {
      let arrayDataObject = params.arrayDataObject;
      let arrayValidateObject = params.arrayValidateObject;
      let fechaOperacion = params.fechaOperacion;
      let fechaInicialOperacion = params.fechaInicialOperacion;
      let item = params.item;
      let infoArchivo = params.infoArchivo;
      let instrumento = params.instrumento;
      let _lugarNegociacion = params._lugarNegociacion;
      let _lugarNegociacionVacio = params._lugarNegociacionVacio;
      let _tipoOperacion = params._tipoOperacion;
      let _tipoActivo = params._tipoActivo;
      let codValoracionInstrumento = params.codValoracionInstrumento;
      let codOperacion = params.codOperacion;
      let _tipoCuenta = params._tipoCuenta;
      let _entidadFinanciera = params._entidadFinanciera;
      let _moneda = params._moneda;
      let _emisor = params._emisor;
      let _tipoAmortizacion = params._tipoAmortizacion;
      let _tipoInteres = params._tipoInteres;
      let _tipoTasa = params._tipoTasa;
      let codMercado = params.codMercado;
      let calfRiesgo = params._entidadFinanciera;
      let codCustodia = params.codCustodia;
      let instrumento135 = params.instrumento135;
      let instrumento136 = params.instrumento136;
      let cortoPlazo = params.cortoPlazo;
      let largoPlazo = params.largoPlazo;
      let calfRiesgoNormal = params.calfRiesgoNormal;
      let tipoCambio = params.tipoCambio;
      let _bolsa = params._bolsa;
      let _tipoValoracion = params._tipoValoracion;

      let _cadenaCombinadalugarNegTipoOperTipoInstrum =
        params._cadenaCombinadalugarNegTipoOperTipoInstrum;
      console.log(dependenciesArray);
      console.log(codeCurrentFile);
      const validarCampoIndividual = async (
        value,
        columnName,
        pattern,
        required,
        functAux,
        funct,
        mayBeEmpty,
        operationNotValid,
        dependency,
        item2,
        index2,
        item3,
        codeCurrentFile
      ) => {
        let match = value?.match(pattern);
        if (match === null && (mayBeEmpty === false || mayBeEmpty === null)) {
          errors.push({
            archivo: item.archivo,
            tipo_error: "TIPO DE DATO INCORRECTO",
            descripcion: `El contenido del archivo no superó la validación de tipo de dato.`,
            valor: value,
            columna: columnName,
            fila: index2,
          });
        } else {
          if (columnName === "fecha_operacion" || columnName === "fecha") {
            if (
              codeCurrentFile === "K" ||
              codeCurrentFile === "L" ||
              codeCurrentFile === "N" ||
              codeCurrentFile === "P"
            ) {
              if (value !== fechaInicialOperacion) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no superó la validación de tipo de dato, el cual tiene que coincidir con la fecha del nombre del archivo.`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else {
              let funcAuxAux = funct;
              if (
                value !== fechaOperacion &&
                funcAuxAux !== "fechaOperacionMenorAlArchivo"
              ) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no superó la validación de tipo de dato, el cual tiene que coincidir con la fecha del nombre del archivo.`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              } else if (value !== fechaOperacion) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no superó la validación de tipo de dato, el cual tiene que coincidir con la fecha del nombre del archivo.`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            }
          }
          if (item?.archivo?.includes("44C")) {
            map(dependenciesArray, (itemDP, indexDP) => {
              if (
                itemDP?.file?.includes("44C") &&
                itemDP?.code === "441" &&
                (itemDP?.value === "1" || itemDP?.value === 1)
              ) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El archivo no debe tener contenido debido a que el archivo ${itemDP.code} tiene la columna nro_pago con el valor de ${itemDP.value}.`,
                });
              }
            });
          } else if (item?.archivo?.includes("441")) {
            const serieCombinada441 = `${item2.tipo_instrumento}${item2.serie}`;
            map(dependenciesArray, (itemDP, indexDP) => {
              if (
                (itemDP?.file?.includes("411") ||
                  itemDP?.file?.includes("413")) &&
                serieCombinada441 !== itemDP.value
              ) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El tipo_instrumento combinado con la serie del archivo ${itemDP.file} no debe ser igual a el tipo_instrumento combinado con la serie del archivo ${item.archivo} debido a que el tipo_operacion en el archivo ${itemDP.file} es igual a "COP". SERIE DEL ARCHIVO ${itemDP.file}: ${itemDP.value}, SERIE DEL ARCHIVO ${item.archivo}: ${serieCombinada441}`,
                  valor: itemDP.value,
                  columna: itemDP.column,
                  fila: itemDP.row,
                });
              }
            });
          }
          if (columnName === "nro_pago" && codeCurrentFile === "441") {
            if (dependenciesArray.length >= 1) {
              map(dependenciesArray, (itemDP, indexDP) => {
                if (!itemDP?.file?.includes("44C") && itemDP?.code !== "441") {
                  if (value === "1" || value === 1) {
                    dependenciesArray.push({
                      file: item.archivo,
                      code: codeCurrentFile,
                      value: value,
                      row: index2,
                      column: columnName,
                    });
                  }
                }
              });
            } else {
              if (value === "1" || value === 1) {
                dependenciesArray.push({
                  file: item.archivo,
                  code: codeCurrentFile,
                  value: value,
                  row: index2,
                  column: columnName,
                });
              }
            }
          }
          if (
            columnName === "serie" &&
            codeCurrentFile === "411" &&
            operationNotValid === "tipoOperacionCOP" &&
            infoArchivo.tipoOperacionCOP
          ) {
            if (item2.tipo_operacion === "COP") {
              const serieCombinada411 = `${item2.tipo_instrumento}${item2.serie}`;
              if (dependenciesArray.length >= 1) {
                map(dependenciesArray, (itemDP, indexDP) => {
                  if (!itemDP?.file?.includes("411")) {
                    dependenciesArray.push({
                      file: item.archivo,
                      code: codeCurrentFile,
                      value: serieCombinada411,
                      row: index2,
                      column: columnName,
                    });
                  }
                });
              } else {
                dependenciesArray.push({
                  file: item.archivo,
                  code: codeCurrentFile,
                  value: serieCombinada411,
                  row: index2,
                  column: columnName,
                });
              }
            }
          }
          if (
            columnName === "serie" &&
            codeCurrentFile === "413" &&
            operationNotValid === "tipoOperacionCOP" &&
            infoArchivo.tipoOperacionCOP
          ) {
            if (item2.tipo_operacion === "COP") {
              const serieCombinada411 = `${item2.tipo_instrumento}${item2.serie}`;
              if (dependenciesArray.length >= 1) {
                map(dependenciesArray, (itemDP, indexDP) => {
                  if (!itemDP?.file?.includes("413")) {
                    dependenciesArray.push({
                      file: item.archivo,
                      code: codeCurrentFile,
                      value: serieCombinada411,
                      row: index2,
                      column: columnName,
                    });
                  }
                });
              } else {
                dependenciesArray.push({
                  file: item.archivo,
                  code: codeCurrentFile,
                  value: serieCombinada411,
                  row: index2,
                  column: columnName,
                });
              }
            }
          }
          if (funct === "bolsa") {
            let errFunction = true;
            map(_bolsa?.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                // console.log(value);
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con alguna sigla de Bolsa de Valores.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "tipoValoracion") {
            let errFunction = true;
            map(_tipoValoracion?.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                // console.log(value);
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con alguna sigla de Tipo de Valoración.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "tipoInstrumento") {
            let errFunction = true;
            map(instrumento?.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                // console.log(value);
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algun tipo de instrumento.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "tipoOperacion") {
            let errFunction = true;
            map(_tipoOperacion.resultFinal, (item4, index4) => {
              if (value === item4.codigo_rmv) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún tipo de operacion.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "lugarNegociacion") {
            let errFunction = true;
            map(_lugarNegociacion.resultFinal, (item4, index4) => {
              if (value === item4.codigo_rmv) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún lugar de negociacion.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "tipoActivo") {
            let errFunction = true;
            map(_tipoActivo?.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                // console.log(value);
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algun tipo de activo.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "codigoValoracionConInstrumento") {
            let errFunction = false;
            map(codValoracionInstrumento?.resultFinal, (item4, index4) => {
              if (item2.tipo_instrumento === item4.sigla) {
                if (value === "0" || value === 0) {
                  // console.log(value);
                  errFunction = false;
                } else {
                  errFunction = true;
                }
              }
            });
            // console.log(value);
            // console.log(codValoracionInstrumento.resultFinal);
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no es correcto debido a que el tipo de instrumento es ${item2.tipo_instrumento}, en el cual el codigo de valoracion debe ser 0.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "codigoOperacion") {
            let errFunction = true;
            map(codOperacion.resultFinal, (item4, index4) => {
              if (value === item4.codigo_aps) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún código de operación.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "marcacion") {
            try {
              let marcacion = await tipoMarcacion({
                monto_negociado: parseFloat(item2.monto_negociado),
                monto_minimo: parseFloat(item2.monto_minimo),
              });
              if (!marcacion.toString().includes(value)) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con el tipo de marcación.`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } catch (err) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `Error en tipo de dato. ${err.message}`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "accionesMonedaOriginal") {
            let _operacionEntreColumnas = infoArchivo?.paramsAccionesMO
              ? await operacionEntreColumnas({
                  total: {
                    key: columnName,
                    value: value,
                  },
                  fields: [
                    {
                      key: "numero_acciones",
                      value: parseFloat(item2.numero_acciones),
                    },
                    "*",
                    {
                      key: "precio_unitario",
                      value: parseFloat(item2.precio_unitario),
                    },
                  ],
                })
              : null;

            if (_operacionEntreColumnas.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _operacionEntreColumnas.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "tipoCuenta") {
            let errFunction = true;
            map(_tipoCuenta.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con alguna sigla de tipo de cuenta.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "entidadFinanciera") {
            let errFunction = true;
            map(_entidadFinanciera.resultFinal, (item4, index4) => {
              if (value === item4.codigo_rmv) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún codigo de entidad financiera.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "moneda") {
            let errFunction = true;
            map(_moneda.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún tipo de moneda.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "emisor") {
            let errFunction = true;
            map(_emisor.resultFinal, (item4, index4) => {
              if (value === item4.codigo_rmv) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún tipo de emisor.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "tipoAmortizacion") {
            let errFunction = true;
            map(_tipoAmortizacion.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún tipo de amortizacion.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "tipoInteres") {
            let errFunction = true;
            map(_tipoInteres.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún tipo de interes.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "tipoTasa") {
            let errFunction = true;
            map(_tipoTasa.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún tipo de tasa.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "codigoMercado") {
            let errFunction = true;
            map(codMercado.resultFinal, (item4, index4) => {
              if (value === item4.codigo_aps) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con algún codigo de mercado.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "flujoTotal") {
            let _operacionEntreColumnas = infoArchivo?.paramsFlujoTotal
              ? await operacionEntreColumnas({
                  total: {
                    key: columnName,
                    value: value,
                  },
                  fields: [
                    {
                      key: "interes",
                      value: parseFloat(item2.saldo_anterior),
                    },
                    "+",
                    {
                      key: "amortizacion",
                      value: parseFloat(item2.altas_bajas),
                    },
                  ],
                })
              : null;

            if (_operacionEntreColumnas.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _operacionEntreColumnas.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "calificacionRiesgo") {
            let errFunction = true;
            map(calfRiesgo?.resultFinal, (item4, index4) => {
              if (value === item4.descripcion) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con alguna descripción de calificación de riesgo.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "codigoCustodia") {
            let errFunction = true;
            map(codCustodia.resultFinal, (item4, index4) => {
              if (value === item4.sigla) {
                errFunction = false;
              }
            });
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con alguna sigla de código de custodia.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "calificacionRiesgoMultiple") {
            try {
              const calfRiesgoMultiple =
                await calificacionRiesgoConsultaMultiple({
                  tipo_instrumento: item2.tipo_instrumento,
                  plazo_valor: item2.plazo_valor,
                  calificacion_riesgo: value,
                  instrumento135,
                  instrumento136,
                  cortoPlazo,
                  largoPlazo,
                  calfRiesgoNormal,
                });
              if (calfRiesgoMultiple?.ok !== true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: calfRiesgoMultiple?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } catch (err) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `Error en tipo de dato. ${err.message}`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "fechaOperacionMenorAlArchivo") {
            try {
              const _fechaOperacionMenor =
                infoArchivo?.paramsFechaOperacionMenor === true
                  ? await fechaOperacionMenor({
                      fecha_nombre_archivo: fechaInicialOperacion,
                      fecha_contenido_operacion: value,
                    })
                  : null;
              if (_fechaOperacionMenor?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _fechaOperacionMenor?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } catch (err) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `Error en tipo de dato. ${err.message}`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "montoFinalConTipoDeCambio") {
            try {
              let errFunction = { ok: false, message: "" };
              map(tipoCambio, (item, index) => {
                if (errFunction.ok === false) {
                  montoFinalConTipoDeCambio({
                    saldo_mo: item2.saldo_mo,
                    saldo_bs: value,
                    tipo_cambio: item,
                    errFunction,
                  });
                }
              });

              if (errFunction?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: errFunction?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } catch (err) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `Error en tipo de dato. ${err.message}`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "mayorACeroDecimal") {
            const _mayorACeroDecimal = await mayorACeroDecimal({
              value: value,
            });
            // console.log(mayorACeroDecimal);

            if (_mayorACeroDecimal?.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _mayorACeroDecimal.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "mayorACeroEntero") {
            const _mayorACeroEntero = await mayorACeroEntero({
              value: value,
            });

            if (_mayorACeroEntero?.ok === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _mayorACeroEntero.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "cantidadPorPrecio") {
            const _cantidadPorPrecio = infoArchivo?.paramsCantidadPorPrecio
              ? await cantidadPorPrecio({
                  cantidad: item2.cantidad,
                  precio: item2.precio,
                  total_bs: value,
                })
              : null;

            if (_cantidadPorPrecio.ok === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _cantidadPorPrecio.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "totalBsMenosPrevisionesInversiones") {
            let _operacionEntreColumnas =
              infoArchivo?.paramsTotalBsMenosPrevisionesInversiones
                ? await operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: value,
                    },
                    fields: [
                      {
                        key: "total_bs",
                        value: parseFloat(item2.prevision_inversion_bs),
                      },
                      "-",
                      {
                        key: "prevision_inversion_bs",
                        value: parseFloat(item2.total_neto_inversiones_bs),
                      },
                    ],
                  })
                : null;

            if (_operacionEntreColumnas.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _operacionEntreColumnas.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "saldoAntMasAltasBajasMasActualizacion") {
            let _operacionEntreColumnas =
              infoArchivo?.paramsSaldoAntMasAltasBajasMasActualizacion
                ? await operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: value,
                    },
                    fields: [
                      {
                        key: "saldo_anterior",
                        value: parseFloat(item2.saldo_anterior),
                      },
                      "+",
                      {
                        key: "altas_bajas",
                        value: parseFloat(item2.altas_bajas),
                      },
                      "+",
                      {
                        key: "actualizacion",
                        value: parseFloat(item2.actualizacion),
                      },
                    ],
                  })
                : null;

            if (_operacionEntreColumnas.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _operacionEntreColumnas.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (
            funct === "saldoAntMenosBajasMasDepreciacionMesMasActualizacion"
          ) {
            let _operacionEntreColumnas =
              infoArchivo?.paramsSaldoAntMenosBajasMasDepreciacionMesMasActualizacion
                ? await operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: value,
                    },
                    fields: [
                      {
                        key: "saldo_anterior",
                        value: parseFloat(item2.saldo_anterior),
                      },
                      "-",
                      {
                        key: "bajas",
                        value: parseFloat(item2.bajas),
                      },
                      "+",
                      {
                        key: "depreciacion_periodo",
                        value: parseFloat(item2.depreciacion_periodo),
                      },
                      "+",
                      {
                        key: "actualizacion",
                        value: parseFloat(item2.actualizacion),
                      },
                    ],
                  })
                : null;

            if (_operacionEntreColumnas.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _operacionEntreColumnas.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "saldoFinalMesAnteriorBsMasMovimientoMesBs") {
            let _operacionEntreColumnas =
              infoArchivo?.paramsSaldoFinalMesAnteriorBsMasMovimientoMesBs
                ? await operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: value,
                    },
                    fields: [
                      {
                        key: "saldo_final_mes_anterior_bs",
                        value: parseFloat(item2.saldo_final_mes_anterior_bs),
                      },
                      "+",
                      {
                        key: "movimiento_mes_bs",
                        value: parseFloat(item2.movimiento_mes_bs),
                      },
                    ],
                  })
                : null;

            if (_operacionEntreColumnas.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _operacionEntreColumnas.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "depreciacionPeriodoMasAltasBajasDepreciacion") {
            let _operacionEntreColumnas =
              infoArchivo?.paramsDepreciacionPeriodoMasAltasBajasDepreciacion
                ? await operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: value,
                    },
                    fields: [
                      {
                        key: "depreciacion_periodo",
                        value: parseFloat(item2.depreciacion_periodo),
                      },
                      "+",
                      {
                        key: "altas_bajas_depreciacion",
                        value: parseFloat(item2.altas_bajas_depreciacion),
                      },
                    ],
                  })
                : null;

            if (_operacionEntreColumnas.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _operacionEntreColumnas.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "cantidadCuotasMultiplicadoCuotaBs") {
            let _operacionEntreColumnas =
              infoArchivo?.paramsCantidadCuotasMultiplicadoCuotaBs
                ? await operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: value,
                    },
                    fields: [
                      {
                        key: "cantidad_cuotas",
                        value: parseFloat(item2.cantidad_cuotas),
                      },
                      "*",
                      {
                        key: "cuota_bs",
                        value: parseFloat(item2.cuota_bs),
                      },
                    ],
                  })
                : null;

            if (_operacionEntreColumnas.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _operacionEntreColumnas.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "cantidadValoresMultiplicadoPrecioNegociacion") {
            let _operacionEntreColumnas =
              infoArchivo?.paramsCantidadCuotasMultiplicadoCuotaBs
                ? await operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: value,
                    },
                    fields: [
                      {
                        key: "cantidad_valores",
                        value: parseFloat(item2.cantidad_valores),
                      },
                      "*",
                      {
                        key: "precio_negociacion",
                        value: parseFloat(item2.precio_negociacion),
                      },
                    ],
                  })
                : null;

            if (_operacionEntreColumnas.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _operacionEntreColumnas.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          } else if (funct === "cartera") {
            const _cartera = infoArchivo?.paramsCartera
              ? await cartera({
                  cartera_origen: item2.cartera_origen,
                  cartera_destino: item2.cartera_destino,
                })
              : null;

            if (_cartera?.ok === false) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: _cartera.message,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          }
          if (
            operationNotValid === "cadenaCombinadalugarNegTipoOperTipoInstrum"
          ) {
            let errFunction = true;
            const siglaCombinada = `${item2.lugar_negociacion}${item2.tipo_operacion}${item2.tipo_instrumento}`;
            map(
              _cadenaCombinadalugarNegTipoOperTipoInstrum?.resultFinal,
              (item4, index4) => {
                if (siglaCombinada === item4.siglaCombinada) {
                  errFunction = false;
                }
              }
            );
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO",
                descripcion: `El contenido del archivo no coincide con alguna descripción de calificación de riesgo.`,
                valor: value,
                columna: columnName,
                fila: index2,
              });
            }
          }
        }
      };

      map(arrayDataObject, async (item2, index2) => {
        map(arrayValidateObject, async (item3, index3) => {
          let value = item2[item3.columnName];
          let columnName = item3.columnName;
          let pattern = item3.pattern;
          let required = item3.required;
          let mayBeEmpty =
            item3?.mayBeEmpty === true || item3?.mayBeEmpty === false
              ? item3.mayBeEmpty
              : null;
          let operationNotValid =
            item3?.operationNotValid?.length >= 1 ||
            item3?.operationNotValid !== ""
              ? item.operationNotValid
              : null;
          let funct = item3.function;
          let functAux = item3.function;
          let dependency = item3.dependency;
          // console.log("ANTES DE VALIDACIONES", value);
          // console.log("ANTES DE VALIDACIONES", errors);
          if (
            !item2[item3.columnName] &&
            required === true &&
            mayBeEmpty === false
          ) {
            errors.push({
              archivo: item.archivo,
              tipo_error: "VALOR EN NULO O VACIO",
              descripcion: `El valor está vacío o existe un error no controlado en el contenido del archivo.`,
              valor:
                typeof value === "undefined"
                  ? "indefinido"
                  : value === null
                  ? null
                  : "",
              columna: columnName,
              fila: index2,
            });
          } else {
            await validarCampoIndividual(
              value,
              columnName,
              pattern,
              mayBeEmpty,
              operationNotValid,
              required,
              funct,
              functAux,
              dependency,
              item2,
              index2,
              item3,
              codeCurrentFile
            );
          }
          // console.log("DESPUES DE VALIDACIONES", errors);
        });
      });

      resolve();
    }
  );
  return validacionesCamposArchivosFragmentoCodigoPromise;
}

exports.validarArchivo2 = async (req, res, next) => {
  const fechaInicialOperacion = req?.body?.fecha_operacion;
  const tipo_periodo = req?.body?.tipo_periodo;
  const fecha_entrega = req?.body?.fecha_entrega;

  try {
    const id_rol = req.user.id_rol;
    const id_usuario = req.user.id_usuario;
    const fechaOperacion = fechaInicialOperacion
      ? fechaInicialOperacion.split("-").join("")
      : moment().format("YYYYMMDD");

    console.log(fechaInicialOperacion);

    let infoTables = await seleccionarTablas({
      files: req.files,
    });

    if (infoTables.code === null && infoTables.table === null) {
      respErrorServidor500END(res, {
        type: "NAME TABLE",
        message: `Hubo un error al obtener los nombres de la tablas en las que el servidor trabajará, usuario con ID: "${id_usuario}" y ID_ROL: ${id_rol}.`,
      });
      return;
    } else {
      nameTable = infoTables.table;
      nameTableErrors = infoTables.tableErrors;
      codeCurrentFile = infoTables.code;

      const nroCargaPromise = new Promise(async (resolve, reject) => {
        let result = 1;
        let nroCarga = 1;
        queryNroCarga = ValorMaximoDeCampoUtil(nameTable, {
          fieldMax: "nro_carga",
          where: [
            {
              key: "id_rol",
              value: id_rol,
            },
            {
              key: "fecha_operacion",
              value: fechaInicialOperacion,
            },
            {
              key: "id_usuario",
              value: id_usuario,
            },
          ],
        });

        await pool
          .query(queryNroCarga)
          .then((resultNroCarga) => {
            if (!resultNroCarga.rowCount || resultNroCarga.rowCount < 1) {
              nroCarga = 1;
            } else {
              nroCarga =
                resultNroCarga.rows[0]?.max !== null
                  ? resultNroCarga.rows[0]?.max
                  : null;
            }
            result = nroCarga;
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {
            resolve(result);
          });
      });

      const nroCarga = await nroCargaPromise
        .then((response) => {
          return response;
        })
        .catch((err) => {
          errorsCode.push({
            type: "QUERY SQL ERROR",
            message: `Hubo un error al obtener el ultimo NUMERO DE CARGA en la tabla "${nameTable}" del usuario con ID: "${req.user.id_usuario}". ERROR: ${err.message}`,
            err,
          });
          return 1;
        });

      await validarArchivosIteraciones({
        req,
        res,
        fechaOperacion,
        fechaInicialOperacion,
      })
        .then(async (response) => {
          const filesReaded = response.filesReaded;
          const insertFilesPromise = new Promise(async (resolve, reject) => {
            let queryFiles = "";
            let bodyQuery = [];
            let currentFiles = [];
            let resultsPromise = [];
            map(req.files, (item, index) => {
              currentFiles.push(item.originalname);
            });
            bodyQuery.push({
              id_rol,
              fecha_operacion: fechaInicialOperacion,
              nro_carga: nroCarga === null ? 1 : nroCarga + 1,
              fecha_carga: new Date(),
              id_usuario,
              cargado: false,
            });
            if (fecha_entrega) {
              bodyQuery[0].fecha_entrega = fecha_entrega;
            }
            if (infoTables.code === "108") {
              bodyQuery[0].cod_institucion = infoTables.code;
              if (tipo_periodo === "D") {
                bodyQuery[0].id_periodo = 154;
              } else if (tipo_periodo === "M") {
                bodyQuery[0].id_periodo = 155;
              }
            }
            console.log(bodyQuery);
            queryFiles = InsertarVariosUtil(nameTable, {
              body: bodyQuery,
              returnValue: ["id_carga_archivos"],
            });
            console.log(queryFiles);
            await pool
              .query(queryFiles)
              .then(async (resultFiles) => {
                resultsPromise.push({
                  files: currentFiles,
                  message:
                    resultFiles.rowCount >= 1
                      ? `Los archivos fueron insertado correctamente a la tabla '${nameTable}'`
                      : `El archivo fue insertado correctamente a la tabla '${nameTable}'`,
                  result: {
                    rowsUpdate: resultFiles.rows,
                    rowCount: resultFiles.rowCount,
                  },
                });
              })
              .catch((err) => {
                console.log("ERR", err);
                errorsCode.push({
                  files: currentFiles,
                  type: "QUERY SQL ERROR",
                  message: `Hubo un error al insertar datos en la tabla '${nameTable}' ERROR: ${err.message}`,
                  err,
                });
              })
              .finally(() => {
                resolve({ resultsPromise, bodyQuery });
              });
          });

          await insertFilesPromise
            .then(async (response) => {
              if (errors.length >= 1 || errorsCode.length >= 1) {
                const insertErrorsPromise = new Promise(
                  async (resolve, reject) => {
                    let queryFiles = "";
                    let bodyQuery = [];
                    let currentFiles = [];
                    let resultsPromise = [];
                    map(errors, (item, index) => {
                      bodyQuery.push({
                        id_carga_archivos:
                          response.resultsPromise[0]?.result?.rowsUpdate[0]
                            .id_carga_archivos,
                        archivo: item.archivo,
                        tipo_error: item.tipo_error,
                        descripcion: item.descripcion,
                        valor:
                          item.valor === ""
                            ? "VACIO"
                            : item.hasOwnProperty("valor")
                            ? item.valor
                            : "",
                        fila: item.hasOwnProperty("fila")
                          ? parseInt(item.fila) + 1
                          : 0,
                        columna: item.hasOwnProperty("columna")
                          ? item.columna
                          : 0,
                      });
                    });

                    console.log(nameTableErrors);

                    queryFiles = InsertarVariosUtil(nameTableErrors, {
                      body: bodyQuery,
                      returnValue: ["id_error_archivo"],
                    });

                    await pool
                      .query(queryFiles)
                      .then(async (resultFiles) => {
                        resultsPromise.push({
                          files: currentFiles,
                          message:
                            resultFiles.rowCount >= 1
                              ? `Los archivos fueron insertado correctamente a la tabla '${nameTable}'`
                              : `El archivo fue insertado correctamente a la tabla '${nameTable}'`,
                          result: {
                            rowsUpdate: resultFiles.rows,
                            rowCount: resultFiles.rowCount,
                          },
                        });
                      })
                      .catch((err) => {
                        console.log("ERR", err);
                        errorsCode.push({
                          files: currentFiles,
                          type: "QUERY SQL ERROR",
                          message: `Hubo un error al insertar datos en la tabla '${nameTable}' ERROR: ${err.message}`,
                          err,
                        });
                        reject(err);
                      })
                      .finally(() => {
                        resolve({ resultsPromise, bodyQuery });
                      });
                  }
                );

                await insertErrorsPromise
                  .then((response) => {
                    // console.log(response);
                  })
                  .catch((err) => {
                    respErrorServidor500(
                      res,
                      err,
                      "Ocurrió un error inesperado."
                    );
                  })
                  .finally(() => {
                    respArchivoErroneo200(res, errors, response.resultsPromise);
                  });
              } else {
                req.errors = errors;
                req.errorsCode = errorsCode;
                req.results = response.resultsPromise;
                req.returnsValues =
                  response.resultsPromise[0]?.result?.rowsUpdate;
                req.filesReaded = filesReaded;
                req.filesUploadedBD = response.bodyQuery;
                req.codeCurrentFile = codeCurrentFile;
                req.nameTableAud = nameTable;
                req.tipo_periodo = tipo_periodo;
                // respResultadoCorrectoObjeto200(res, {
                //   results: response.resultsPromise,
                //   errors,
                // });
                next();
              }
            })
            .catch(() => {
              respErrorServidor500END(res, errorsCode);
              return;
            });
        })
        .catch((err) => {
          console.log("ERR1", err);
          respErrorServidor500END(res, { err, errorsCode });
        });
    }
  } catch (err) {
    console.log("ERR2", err);
    respErrorServidor500END(res, { err, errorsCode });
  }
};

exports.subirArchivo = async (req, res, next) => {
  nameTable = "";
  codeCurrentFile = "";
  codeCurrentFilesArray = [];
  nameTableErrors = "";
  errors = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO
  errorsCode = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO
  periodicidadFinal = null;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/tmp");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).any("archivos");

  upload(req, res, (err) => {
    // console.log("REQ FILES", req?.files);
    if (err instanceof multer.MulterError) {
      respErrorMulter500(res, err);
    } else if (err) {
      if (err.name == "ExtensionError") {
        respErrorExtensionError403(res, err);
      } else {
        respErrorServidor500(res, err);
      }
    } else {
      let filesUploaded = req?.files;
      if (!filesUploaded || filesUploaded?.length === 0) {
        respDatosNoRecibidos400(
          res,
          "No se encontro ningún archivo para subir."
        );
      } else {
        next();
      }
    }
  });
};
