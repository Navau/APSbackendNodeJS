const multer = require("multer");
const path = require("path");
const {
  map,
  reduce,
  findIndex,
  filter,
  isEmpty,
  range,
  includes,
  replace,
  forEach,
  size,
  find,
  max,
  isUndefined,
  isNull,
  maxBy,
  isArray,
} = require("lodash");
const fs = require("fs");
const pool = require("../database");
const moment = require("moment");

const {
  obtenerValidaciones,
  tipoMarcacion,
  formatearDatosEInsertarCabeceras,
  obtenerInformacionDeArchivo,
  calificacionRiesgoConsultaMultiple,
  fechaOperacionMenor,
  montoFinalConTipoDeCambio,
  mayorACeroDecimal,
  mayorACeroEntero,
  operacionEntreColumnas,
  cartera,
  plazoCupon,
  mayorIgualACeroDecimal,
  mayorIgualACeroEntero,
  tipoValoracionConsultaMultiple,
  unico,
  igualA,
  selectComun,
  grupoUnico,
  menorACeroDecimal,
  menorACeroEntero,
  menorIgualACeroDecimal,
  menorIgualACeroEntero,
  compararFechas,
  monedaTipoCambio,
  rango,
  agrupacion,
  unicoPor,
  tasaEmision,
  serieEmision,
} = require("../utils/formatoCamposArchivos.utils");

const {
  ValorMaximoDeCampoUtil,
  InsertarVariosUtil,
  EjecutarFuncionSQL,
  EscogerInternoUtil,
  EjecutarQuery,
} = require("../utils/consulta.utils");

const {
  respErrorMulter500,
  respDatosNoRecibidos400,
  respErrorServidor500END,
  respArchivoErroneo200,
  respUsuarioNoAutorizado200END,
} = require("../utils/respuesta.utils");
const dayjs = require("dayjs");
const {
  VerificarPermisoTablaUsuarioAuditoria,
} = require("../utils/auditoria.utils");

var nameTable = "";
var codeCurrentFile = "";
var codeCurrentFilesArray = [];
var nameTableErrors = "";
var errors = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO
var errorsCode = []; //ERRORES QUE PUEDAN APARECER EN LOS ARCHIVO
var dependenciesArray = []; //DEPENDENCIAS Y RELACIONES ENTRE ARCHIVOS
var dependenciesArrayEmptys = [];
var lengthFilesObject = {}; //NUMERO DE FILAS DE CADA ARCHIVO

//TO DO: Re hacer todo esto de subida de archivos, para hacerlo mas legible y simplificado

function verificarArchivosRequeridos(archivosRequeridos, archivosSubidos) {
  const verificarArchivos = new Promise((resolve, reject) => {
    const arrayNameFilesToUpperCase = (array, property) => {
      var newArray = [];
      map(array, (item) => {
        const value = property !== "archivo" ? item.nombre : item[property];
        const myObjLower = { ...item, archivo: value?.toUpperCase() };
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
        return itemFI.archivo == item.archivo;
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
  let typeFileAux = null;

  const x = typeFiles[0].originalname;

  if (x.toUpperCase().includes(".CC") || x[2] + x[3] === "CC") {
    typeFileAux = "CUSTODIO";
  } else {
    typeFileAux = "PENSIONES O BOLSA";
    if (x.toUpperCase().substring(0, 1) === "M" && tipo_periodo === "D") {
      if (typeFiles.length >= 2) {
        periodicidad = [154, 219];
      } else {
        periodicidad = [154];
      }
    } else if (
      x.toUpperCase().substring(0, 3) === "108" &&
      tipo_periodo === "D"
    ) {
      periodicidad = [154];
    } else if (
      x.toUpperCase().substring(0, 3) === "108" &&
      tipo_periodo === "M"
    ) {
      periodicidad = [155];
    } else if (
      (x.toUpperCase().substring(0, 2) === "01" ||
        x.toUpperCase().substring(0, 2) === "02") &&
      tipo_periodo === "D"
    ) {
      periodicidad = [154];
    } else if (
      (x.toUpperCase().substring(0, 2) === "01" ||
        x.toUpperCase().substring(0, 2) === "02") &&
      tipo_periodo === "M"
    ) {
      periodicidad = [155];
    }
  }

  const obtenerListaArchivosPromise = new Promise(async (resolve, reject) => {
    let query = "";
    if (typeFileAux === "CUSTODIO") {
      query = EjecutarFuncionSQL(
        id_rol === 10
          ? "aps_fun_archivos_custodio_seguros"
          : "aps_fun_archivos_custodio_pensiones",
        {
          body: { fecha_operacion },
        }
      );
    } else {
      query = `SELECT replace(replace(replace(replace(replace(replace(replace(replace(replace(
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
        AND "APS_param_archivos_pensiones_seguros".activo = true;`;
    }

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
  const { files, codigosSeguros, codigosPensiones } = params;

  let result = {
    code: null,
    table: null,
  };
  forEach(files, (item, index) => {
    const nameFile = item.originalname.toUpperCase();
    const codSeguros = nameFile.substring(0, 3);
    const codPensiones = nameFile.substring(0, 2);
    const codPensionesSeguros =
      size(codigosSeguros) > 0
        ? codSeguros
        : size(codigosPensiones) > 0
        ? codPensiones
        : null;
    if (codPensionesSeguros === null) return result;
    const findSeguros = find(
      codigosSeguros,
      (itemF) => codSeguros === itemF.codigo
    );
    const findPensiones = find(
      codigosPensiones,
      (itemF) => codPensiones === itemF.codigo
    );
    if (
      (!isUndefined(findSeguros) || !isUndefined(findPensiones)) &&
      (!nameFile.includes(".CC") ||
        !item.originalname[2] + item.originalname[3] === "CC")
    ) {
      result = {
        code: codPensionesSeguros,
        table: "APS_aud_carga_archivos_pensiones_seguros",
        tableErrors: "APS_aud_errores_carga_archivos_pensiones_seguros",
      };
    } else if (
      nameFile.substring(0, 1) === "M" &&
      (nameFile.includes("K.") ||
        nameFile.includes("L.") ||
        nameFile.includes("N.") ||
        nameFile.includes("P."))
    ) {
      result = {
        code: "M",
        table: "APS_aud_carga_archivos_bolsa",
        tableErrors: "APS_aud_errores_carga_archivos_bolsa",
      };
    } else if (
      nameFile.includes(".CC") ||
      item.originalname[2] + item.originalname[3] === "CC"
    ) {
      result = {
        code: "CC",
        table: "APS_aud_carga_archivos_custodio",
        tableErrors: "APS_aud_errores_carga_archivos_custodio",
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
          result: map(response.rows, (itemMap) => {
            if (itemMap?.nombre) {
              return {
                ...itemMap,
                archivo: itemMap.nombre,
              };
            }
            return itemMap;
          }),
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
        // console.log(isAllFiles);
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
                  "El nombre del archivo no coincide con la fecha de operación",
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
              message: "No existen archivos disponibles para el usuario",
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
        //         "El archivo subido no coincide con los archivos requeridos del usuario",
        //     });
        //   });
        //   resolve(errors);
        //   return;
        // }
        console.log(isAllFiles);
        for (let index = 0; index < isAllFiles.currentFiles.length; index++) {
          // console.log("codeCurrentFilesArray: ", codeCurrentFilesArray);
          // console.log("isAllFiles.currentFiles: ", isAllFiles.currentFiles);
          // console.log("LENGTH isAllFiles: ", isAllFiles.currentFiles.length);
          // console.log("INDEX: ", index);
          const item = isAllFiles.currentFiles[index];
          // console.log("TEST PARA VER ASYNC", item.archivo);
          const filePath = `./uploads/tmp/${item.archivo}`;
          // console.log(fs.readFileSync(filePath));
          const data = fs.readFileSync(filePath, "utf8");

          let dataSplit = null;
          if (data.includes("\r\n")) {
            dataSplit = data.split("\r\n");
          } else if (data.includes("\n")) {
            dataSplit = data.split("\n");
          } else if (!data.replace(/\s/g, "").length) {
            dataSplit = [""];
          } else if (data.length >= 1) {
            dataSplit = [data];
          } else {
            dataSplit = [""];
          }
          if (
            isAllFiles.missingFiles.length === 0 &&
            isErrorPast === false &&
            isAllFiles.ok === false
          ) {
            errors.push({
              archivo: "",
              tipo_error: "USUARIO SIN ARCHIVOS REQUERIDOS",
              descripcion: "El usuario no cuenta con archivos requeridos",
            });
            isOkValidate = true;
            isErrorPast = true;
          } else if (isAllFiles.ok === false && isErrorPast === false) {
            map(isAllFiles.missingFiles, (item, index) => {
              errors.push({
                archivo: item.archivo,
                tipo_error: "ARCHIVO FALTANTE",
                descripcion:
                  "El archivo subido no coincide con los archivos requeridos del usuario",
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
                descripcion: "El contenido del archivo esta vacío",
              });
            } else if (
              data.length === 0 &&
              !item.archivo.includes("444") &&
              !item.archivo.includes("445") &&
              !item.archivo.includes("TD") &&
              !item.archivo.includes("TO") &&
              !item.archivo.includes("UD") &&
              !item.archivo.includes("CO")
            ) {
              // console.log("DATA TEST", data.length, item.archivo);
              let myIndex = findIndex(isAllFiles.currentFiles, (itemFI) => {
                return itemFI.archivo == item.archivo;
              });
              if (myIndex !== -1) {
                isAllFiles.currentFiles.splice(myIndex, 1);
              }
              index--;
            } else {
              // console.log("dataSplit", dataSplit);
              // console.log({ archivo: item.archivo });
              if (dataSplit.length === 0) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "FORMATO DE INFORMACION ERRONEO",
                  mensaje:
                    "Ocurrió un error debido al formato del contenido del archivo",
                });
              } else {
                isOkQuerys = true;
                let headers = null;
                let detailsHeaders = null;
                let infoArchivo = null;
                let arrayDataObject = null;

                await obtenerInformacionDeArchivo(
                  item.archivo,
                  fechaInicialOperacion
                )
                  .then((response) => {
                    infoArchivo = response;
                  })
                  .finally(async () => {
                    codeCurrentFile = await infoArchivo.codeCurrentFile;
                    nameTable = await infoArchivo.nameTable;
                    headers = await infoArchivo.headers;
                    detailsHeaders = await infoArchivo.detailsHeaders;
                    // console.log(codeCurrentFile, headers);

                    codeCurrentFilesArray.push(codeCurrentFile);

                    //#region VALIDADORES
                    const instrumento = infoArchivo?.paramsInstrumento
                      ? await selectComun(
                          infoArchivo.paramsInstrumento.table,
                          infoArchivo.paramsInstrumento.params
                        )
                      : null;
                    const _tipoAccion = infoArchivo?.paramsTipoAccion
                      ? await selectComun(
                          infoArchivo.paramsTipoAccion.table,
                          infoArchivo.paramsTipoAccion.params
                        )
                      : null;
                    const _tipoOperacion = infoArchivo?.paramsTipoOperacion
                      ? await selectComun(
                          infoArchivo.paramsTipoOperacion.table,
                          infoArchivo.paramsTipoOperacion.params
                        )
                      : null;
                    const _lugarNegociacion =
                      infoArchivo?.paramsLugarNegociacion
                        ? await selectComun(
                            infoArchivo.paramsLugarNegociacion.table,
                            infoArchivo.paramsLugarNegociacion.params
                          )
                        : null;
                    const _lugarNegociacionVacio =
                      infoArchivo?.paramsLugarNegociacionVacio
                        ? await selectComun(
                            infoArchivo.paramsLugarNegociacionVacio.table,
                            infoArchivo.paramsLugarNegociacionVacio.params
                          )
                        : null;
                    const _tipoActivo = infoArchivo?.paramsTipoActivo
                      ? await selectComun(
                          infoArchivo.paramsTipoActivo.table,
                          infoArchivo.paramsTipoActivo.params
                        )
                      : null;
                    const _tasaRendimientoConInstrumento139 =
                      infoArchivo?.paramsTasaRendimientoConInstrumento139
                        ? await selectComun(
                            infoArchivo.paramsTasaRendimientoConInstrumento139
                              .table,
                            infoArchivo.paramsTasaRendimientoConInstrumento139
                              .params
                          )
                        : null;
                    const _tasaRendimientoConInstrumento138 =
                      infoArchivo?.paramsTasaRendimientoConInstrumento138
                        ? await selectComun(
                            infoArchivo.paramsTasaRendimientoConInstrumento138
                              .table,
                            infoArchivo.paramsTasaRendimientoConInstrumento138
                              .params
                          )
                        : null;
                    const _entidadEmisora = infoArchivo?.paramsEntidadEmisora
                      ? await selectComun(
                          infoArchivo.paramsEntidadEmisora.table,
                          infoArchivo.paramsEntidadEmisora.params
                        )
                      : null;
                    const _plazoValorConInstrumento =
                      infoArchivo?.paramsPlazoValorConInstrumento
                        ? await selectComun(
                            infoArchivo.paramsPlazoValorConInstrumento.table,
                            infoArchivo.paramsPlazoValorConInstrumento.params
                          )
                        : null;
                    const _plazoValorConInstrumentoDiferente =
                      infoArchivo?.paramsPlazoValorConInstrumentoDiferente
                        ? await selectComun(
                            infoArchivo.paramsPlazoValorConInstrumentoDiferente
                              .table,
                            infoArchivo.paramsPlazoValorConInstrumentoDiferente
                              .params
                          )
                        : null;
                    const _tasaRelevanteConInstrumento =
                      infoArchivo?.paramsTasaRelevanteConInstrumento
                        ? await selectComun(
                            infoArchivo.paramsTasaRelevanteConInstrumento.table,
                            infoArchivo.paramsTasaRelevanteConInstrumento.params
                          )
                        : null;
                    const _tasaRelevanteConInstrumentoDiferente =
                      infoArchivo?.paramsTasaRelevanteConInstrumentoDiferente
                        ? await selectComun(
                            infoArchivo
                              .paramsTasaRelevanteConInstrumentoDiferente.table,
                            infoArchivo
                              .paramsTasaRelevanteConInstrumentoDiferente.params
                          )
                        : null;
                    const _plazoEconomicoConInstrumento =
                      infoArchivo?.paramsPlazoEconomicoConInstrumento
                        ? await selectComun(
                            infoArchivo.paramsPlazoEconomicoConInstrumento
                              .table,
                            infoArchivo.paramsPlazoEconomicoConInstrumento
                              .params
                          )
                        : null;
                    const _plazoEconomicoConInstrumentoDiferente =
                      infoArchivo?.paramsPlazoEconomicoConInstrumentoDiferente
                        ? await selectComun(
                            infoArchivo
                              .paramsPlazoEconomicoConInstrumentoDiferente
                              .table,
                            infoArchivo
                              .paramsPlazoEconomicoConInstrumentoDiferente
                              .params
                          )
                        : null;
                    const _tasaUltimoHechoConInstrumento =
                      infoArchivo?.paramsTasaUltimoHechoConInstrumento
                        ? await selectComun(
                            infoArchivo.paramsTasaUltimoHechoConInstrumento
                              .table,
                            infoArchivo.paramsTasaUltimoHechoConInstrumento
                              .params
                          )
                        : null;
                    const _tasaUltimoHechoConInstrumentoDiferente =
                      infoArchivo?.paramsTasaUltimoHechoConInstrumentoDiferente
                        ? await selectComun(
                            infoArchivo
                              .paramsTasaUltimoHechoConInstrumentoDiferente
                              .table,
                            infoArchivo
                              .paramsTasaUltimoHechoConInstrumentoDiferente
                              .params
                          )
                        : null;
                    const codOperacion = infoArchivo?.paramsCodOperacion
                      ? await selectComun(
                          infoArchivo.paramsCodOperacion.table,
                          infoArchivo.paramsCodOperacion.params
                        )
                      : null;
                    const _codigoOperacion = infoArchivo?.paramsCodigoOperacion
                      ? await selectComun(
                          infoArchivo.paramsCodigoOperacion.table,
                          infoArchivo.paramsCodigoOperacion.params
                        )
                      : null;
                    const _tipoCuenta = infoArchivo?.paramsTipoCuenta
                      ? await selectComun(
                          infoArchivo.paramsTipoCuenta.table,
                          infoArchivo.paramsTipoCuenta.params
                        )
                      : null;
                    const _entidadFinanciera =
                      infoArchivo?.paramsEntidadFinanciera
                        ? await selectComun(
                            infoArchivo.paramsEntidadFinanciera.table,
                            infoArchivo.paramsEntidadFinanciera.params
                          )
                        : null;
                    const _moneda = infoArchivo?.paramsMoneda
                      ? await selectComun(
                          infoArchivo.paramsMoneda.table,
                          infoArchivo.paramsMoneda.params
                        )
                      : null;
                    const _emisor = infoArchivo?.paramsEmisor
                      ? await selectComun(
                          infoArchivo.paramsEmisor.table,
                          infoArchivo.paramsEmisor.params
                        )
                      : null;
                    const _pais = infoArchivo?.paramsPais
                      ? await selectComun(
                          infoArchivo.paramsPais.table,
                          infoArchivo.paramsPais.params
                        )
                      : null;
                    const _tipoAmortizacion =
                      infoArchivo?.paramsTipoAmortizacion
                        ? await selectComun(
                            infoArchivo.paramsTipoAmortizacion.table,
                            infoArchivo.paramsTipoAmortizacion.params
                          )
                        : null;
                    const _tipoInteres = infoArchivo?.paramsTipoInteres
                      ? await selectComun(
                          infoArchivo.paramsTipoInteres.table,
                          infoArchivo.paramsTipoInteres.params
                        )
                      : null;
                    const _tipoTasa = infoArchivo?.paramsTipoTasa
                      ? await selectComun(
                          infoArchivo.paramsTipoTasa.table,
                          infoArchivo.paramsTipoTasa.params
                        )
                      : null;
                    const _prepago = infoArchivo?.paramsPrepago
                      ? await selectComun(
                          infoArchivo.paramsPrepago.table,
                          infoArchivo.paramsPrepago.params
                        )
                      : null;
                    const _subordinado = infoArchivo?.paramsSubordinado
                      ? await selectComun(
                          infoArchivo.paramsSubordinado.table,
                          infoArchivo.paramsSubordinado.params
                        )
                      : null;
                    const _calificacion = infoArchivo?.paramsCalificacion
                      ? await selectComun(
                          infoArchivo.paramsCalificacion.table,
                          infoArchivo.paramsCalificacion.params
                        )
                      : null;
                    const _calificacionVacio =
                      infoArchivo?.paramsCalificacionVacio
                        ? await selectComun(
                            infoArchivo.paramsCalificacionVacio.table,
                            infoArchivo.paramsCalificacionVacio.params
                          )
                        : null;
                    const _calificacionConInstrumento =
                      infoArchivo?.paramsCalificacionConInstrumento
                        ? await selectComun(
                            infoArchivo.paramsCalificacionConInstrumento.table,
                            infoArchivo.paramsCalificacionConInstrumento.params
                          )
                        : null;
                    const _calificadora = infoArchivo?.paramsCalificadora
                      ? await selectComun(
                          infoArchivo.paramsCalificadora.table,
                          infoArchivo.paramsCalificadora.params
                        )
                      : null;
                    const _calificadoraConInstrumento =
                      infoArchivo?.paramsCalificadoraConInstrumento
                        ? await selectComun(
                            infoArchivo.paramsCalificadoraConInstrumento.table,
                            infoArchivo.paramsCalificadoraConInstrumento.params
                          )
                        : null;
                    const _custodio = infoArchivo?.paramsCustodio
                      ? await selectComun(
                          infoArchivo.paramsCustodio.table,
                          infoArchivo.paramsCustodio.params
                        )
                      : null;
                    const _codigoMercado = infoArchivo?.paramsCodigoMercado
                      ? await selectComun(
                          infoArchivo.paramsCodigoMercado.table,
                          infoArchivo.paramsCodigoMercado.params
                        )
                      : null;
                    const calfRiesgo = infoArchivo?.paramsCalfRiesgo
                      ? await selectComun(
                          infoArchivo.paramsCalfRiesgo.table,
                          infoArchivo.paramsCalfRiesgo.params
                        )
                      : null;
                    const codCustodia = infoArchivo?.paramsCodCustodia
                      ? await selectComun(
                          infoArchivo.paramsCodCustodia.table,
                          infoArchivo.paramsCodCustodia.params
                        )
                      : null;
                    const _codigoCustodia = infoArchivo?.paramsCodigoCustodia
                      ? await selectComun(
                          infoArchivo.paramsCodigoCustodia.table,
                          infoArchivo.paramsCodigoCustodia.params
                        )
                      : null;
                    const _traspasoCustodia =
                      infoArchivo?.paramsTraspasoCustodia
                        ? await selectComun(
                            infoArchivo.paramsTraspasoCustodia.table,
                            infoArchivo.paramsTraspasoCustodia.params
                          )
                        : null;
                    const _codigoEmisor = infoArchivo?.paramsCodigoEmisor
                      ? await selectComun(
                          infoArchivo.paramsCodigoEmisor.table,
                          infoArchivo.paramsCodigoEmisor.params
                        )
                      : null;
                    const _precioNominalBs = infoArchivo?.paramsPrecioNominalBs
                      ? await selectComun(
                          infoArchivo.paramsPrecioNominalBs.table,
                          infoArchivo.paramsPrecioNominalBs.params
                        )
                      : null;
                    const _cantidadPagos = infoArchivo?.paramsCantidadPagos
                      ? await selectComun(
                          infoArchivo.paramsCantidadPagos.table,
                          infoArchivo.paramsCantidadPagos.params
                        )
                      : null;
                    const _subordinacion = infoArchivo?.paramsSubordinacion
                      ? await selectComun(
                          infoArchivo.paramsSubordinacion.table,
                          infoArchivo.paramsSubordinacion.params
                        )
                      : null;
                    const _codigoTraspasoCustodia =
                      infoArchivo?.paramsCodigoTraspasoCustodia
                        ? await selectComun(
                            infoArchivo.paramsCodigoTraspasoCustodia.table,
                            infoArchivo.paramsCodigoTraspasoCustodia.params
                          )
                        : null;
                    const _valorNominalBs = infoArchivo?.paramsValorNominalBs
                      ? await selectComun(
                          infoArchivo.paramsValorNominalBs.table,
                          infoArchivo.paramsValorNominalBs.params
                        )
                      : null;
                    const _codigoCuenta = infoArchivo?.paramsCodigoCuenta
                      ? await selectComun(
                          infoArchivo.paramsCodigoCuenta.table,
                          infoArchivo.paramsCodigoCuenta.params
                        )
                      : null;
                    const _descripcionCuenta =
                      infoArchivo?.paramsDescripcionCuenta
                        ? await selectComun(
                            infoArchivo.paramsDescripcionCuenta.table,
                            infoArchivo.paramsDescripcionCuenta.params
                          )
                        : null;
                    const _codigoCuentaDescripcion =
                      infoArchivo?.paramsCodigoCuentaDescripcion
                        ? await selectComun(
                            infoArchivo.paramsCodigoCuentaDescripcion.table,
                            infoArchivo.paramsCodigoCuentaDescripcion.params
                          )
                        : null;
                    const _codigoFondo = infoArchivo?.paramsCodigoFondo
                      ? await selectComun(
                          infoArchivo.paramsCodigoFondo.table,
                          infoArchivo.paramsCodigoFondo.params
                        )
                      : null;
                    const _tipoCuentaLiquidez =
                      infoArchivo?.paramsTipoCuentaLiquidez
                        ? await selectComun(
                            infoArchivo.paramsTipoCuentaLiquidez.table,
                            infoArchivo.paramsTipoCuentaLiquidez.params
                          )
                        : null;
                    const _cuentaContable = infoArchivo?.paramsCuentaContable
                      ? await selectComun(
                          infoArchivo.paramsCuentaContable.table,
                          infoArchivo.paramsCuentaContable.params
                        )
                      : null;
                    const _codigoBanco = infoArchivo?.paramsCodigoBanco
                      ? await selectComun(
                          infoArchivo.paramsCodigoBanco.table,
                          infoArchivo.paramsCodigoBanco.params
                        )
                      : null;
                    const _codigoAFP = infoArchivo?.paramsCodigoAFP
                      ? await selectComun(
                          infoArchivo.paramsCodigoAFP.table,
                          infoArchivo.paramsCodigoAFP.params
                        )
                      : null;
                    const _nombreAFP = infoArchivo?.paramsNombreAFP
                      ? await selectComun(
                          infoArchivo.paramsNombreAFP.table,
                          infoArchivo.paramsNombreAFP.params
                        )
                      : null;

                    const instrumento135 = infoArchivo?.paramsInstrumento135
                      ? await selectComun(
                          infoArchivo.paramsInstrumento135.table,
                          infoArchivo.paramsInstrumento135.params
                        )
                      : null;
                    const instrumento136 = infoArchivo?.paramsInstrumento136
                      ? await selectComun(
                          infoArchivo.paramsInstrumento136.table,
                          infoArchivo.paramsInstrumento136.params
                        )
                      : null;
                    const cortoPlazo = infoArchivo?.paramsCortoPlazo
                      ? await selectComun(
                          infoArchivo.paramsCortoPlazo.table,
                          infoArchivo.paramsCortoPlazo.params
                        )
                      : null;
                    const largoPlazo = infoArchivo?.paramsLargoPlazo
                      ? await selectComun(
                          infoArchivo.paramsLargoPlazo.table,
                          infoArchivo.paramsLargoPlazo.params
                        )
                      : null;
                    const calfRiesgoNormal = infoArchivo?.paramsCalfRiesgo
                      ? await selectComun(
                          infoArchivo.paramsCalfRiesgo.table,
                          infoArchivo.paramsCalfRiesgo.params
                        )
                      : null;
                    const tipoCambio = infoArchivo?.paramsTipoDeCambio
                      ? await selectComun(
                          infoArchivo.paramsTipoDeCambio.table,
                          infoArchivo.paramsTipoDeCambio.params
                        )
                      : null;
                    const _bolsa = infoArchivo?.paramsBolsa
                      ? await selectComun(
                          infoArchivo.paramsBolsa.table,
                          infoArchivo.paramsBolsa.params
                        )
                      : null;
                    const _tipoValoracion = infoArchivo?.paramsTipoValoracion
                      ? await selectComun(
                          infoArchivo.paramsTipoValoracion.table,
                          infoArchivo.paramsTipoValoracion.params
                        )
                      : null;
                    const _tipoValoracion22 =
                      infoArchivo?.paramsTipoValoracion22
                        ? await selectComun(
                            infoArchivo.paramsTipoValoracion22.table,
                            infoArchivo.paramsTipoValoracion22.params
                          )
                        : null;
                    const _tipoValoracion31 =
                      infoArchivo?.paramsTipoValoracion31
                        ? await selectComun(
                            infoArchivo.paramsTipoValoracion31.table,
                            infoArchivo.paramsTipoValoracion31.params
                          )
                        : null;
                    const _tipoValoracion210 =
                      infoArchivo?.paramsTipoValoracion22
                        ? await selectComun(
                            infoArchivo.paramsTipoValoracion210.table,
                            infoArchivo.paramsTipoValoracion210.params
                          )
                        : null;

                    const _instrumento135 = infoArchivo?.paramsInstrumento135
                      ? await selectComun(
                          infoArchivo.paramsInstrumento135.table,
                          infoArchivo.paramsInstrumento135.params
                        )
                      : null;
                    const _instrumento1 = infoArchivo?.paramsInstrumento1
                      ? await selectComun(
                          infoArchivo.paramsInstrumento1.table,
                          infoArchivo.paramsInstrumento1.params
                        )
                      : null;
                    const _instrumento25 = infoArchivo?.paramsInstrumento25
                      ? await selectComun(
                          infoArchivo.paramsInstrumento25.table,
                          infoArchivo.paramsInstrumento25.params
                        )
                      : null;

                    const _cadenaCombinadalugarNegTipoOperTipoInstrum =
                      infoArchivo?.paramsCadenaCombinadalugarNegTipoOperTipoInstrum
                        ? await selectComun(
                            infoArchivo
                              .paramsCadenaCombinadalugarNegTipoOperTipoInstrum
                              .table,
                            infoArchivo
                              .paramsCadenaCombinadalugarNegTipoOperTipoInstrum
                              .params
                          )
                        : null;
                    const _ciudad = infoArchivo?.paramsCiudad
                      ? await selectComun(
                          infoArchivo.paramsCiudad.table,
                          infoArchivo.paramsCiudad.params
                        )
                      : null;
                    const _tipoBienInmueble =
                      infoArchivo?.paramsTipoBienInmueble
                        ? await selectComun(
                            infoArchivo.paramsTipoBienInmueble.table,
                            infoArchivo.paramsTipoBienInmueble.params
                          )
                        : null;

                    const _totalVidaUtil = infoArchivo?.paramsTotalVidaUtil
                      ? await selectComun(
                          infoArchivo.paramsTotalVidaUtil.table,
                          infoArchivo.paramsTotalVidaUtil.params
                        )
                      : null;
                    const _totalVidaUtilDiferente =
                      infoArchivo?.paramsTotalVidaUtilDiferente
                        ? await selectComun(
                            infoArchivo.paramsTotalVidaUtilDiferente.table,
                            infoArchivo.paramsTotalVidaUtilDiferente.params
                          )
                        : null;
                    const _vidaUtilRestante =
                      infoArchivo?.paramsVidaUtilRestante
                        ? await selectComun(
                            infoArchivo.paramsVidaUtilRestante.table,
                            infoArchivo.paramsVidaUtilRestante.params
                          )
                        : null;
                    const _vidaUtilRestanteDiferente =
                      infoArchivo?.paramsVidaUtilRestanteDiferente
                        ? await selectComun(
                            infoArchivo.paramsVidaUtilRestanteDiferente.table,
                            infoArchivo.paramsVidaUtilRestanteDiferente.params
                          )
                        : null;

                    // console.log("TEST AAAAA");

                    //#endregion

                    await formatearDatosEInsertarCabeceras(
                      headers,
                      detailsHeaders,
                      dataSplit,
                      codeCurrentFile
                    )
                      .then(async (response) => {
                        // console.log(response);
                        arrayDataObject = response.arrayDataObject;

                        if (response?.errorsValues) {
                          map(
                            response?.errorsValues,
                            (itemError, indexError) => {
                              errors.push({
                                archivo: item?.archivo,
                                tipo_error: "ERROR DE CONTENIDO",
                                descripcion: itemError?.msg,
                                valor: itemError?.value,
                                columna: itemError?.column,
                                fila: itemError?.row,
                              });
                            }
                          );
                        }
                      })
                      .catch((err) => {
                        // console.log(err);
                        arrayDataObject = err;
                        map(err.errors, (itemError, indexError) => {
                          errors.push({
                            archivo: item?.archivo,
                            tipo_error: "ERROR DE CONTENIDO",
                            descripcion: itemError?.msg,
                            valor: itemError?.value,
                            columna: itemError?.column,
                            fila: itemError?.row,
                          });
                        });
                      })
                      .finally(async () => {
                        // console.log({
                        //   codeCurrentFile,
                        //   err: arrayDataObject?.err,
                        // });
                        // console.log("arrayDataObject", arrayDataObject);
                        if (!arrayDataObject?.err) {
                          // console.log("DENTRO DE IF");
                          let arrayValidateObject = await obtenerValidaciones(
                            codeCurrentFile
                          );

                          await validacionesCamposArchivosFragmentoCodigo({
                            arrayDataObject,
                            arrayValidateObject,
                            fechaOperacion,
                            fechaInicialOperacion,
                            item,
                            index,
                            isAllFiles,
                            infoArchivo,
                            instrumento,
                            _tipoAccion,
                            _lugarNegociacion,
                            _lugarNegociacionVacio,
                            _tipoOperacion,
                            _tipoActivo,
                            _tasaRendimientoConInstrumento139,
                            _tasaRendimientoConInstrumento138,
                            _entidadEmisora,
                            _plazoValorConInstrumento,
                            _plazoValorConInstrumentoDiferente,
                            _tasaRelevanteConInstrumento,
                            _tasaRelevanteConInstrumentoDiferente,
                            _plazoEconomicoConInstrumento,
                            _plazoEconomicoConInstrumentoDiferente,
                            _tasaUltimoHechoConInstrumento,
                            _tasaUltimoHechoConInstrumentoDiferente,
                            codOperacion,
                            _tipoCuenta,
                            _entidadFinanciera,
                            _moneda,
                            _emisor,
                            _pais,
                            _tipoAmortizacion,
                            _tipoInteres,
                            _tipoTasa,
                            _prepago,
                            _subordinado,
                            _calificacion,
                            _calificacionVacio,
                            _calificacionConInstrumento,
                            _calificadora,
                            _calificadoraConInstrumento,
                            _custodio,
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
                            _tipoValoracion22,
                            _tipoValoracion31,
                            _tipoValoracion210,
                            _instrumento135,
                            _instrumento1,
                            _instrumento25,
                            _ciudad,
                            _tipoBienInmueble,
                            _cadenaCombinadalugarNegTipoOperTipoInstrum,
                            _codigoOperacion,
                            _codigoMercado,
                            _codigoCustodia,
                            _traspasoCustodia,
                            _codigoCuenta,
                            _descripcionCuenta,
                            _codigoFondo,
                            _tipoCuentaLiquidez,
                            _cuentaContable,
                            _codigoAFP,
                            _nombreAFP,
                            _codigoBanco,
                            _codigoEmisor,
                            _precioNominalBs,
                            _cantidadPagos,
                            _subordinacion,
                            _codigoTraspasoCustodia,
                            _valorNominalBs,
                            _totalVidaUtil,
                            _totalVidaUtilDiferente,
                            _vidaUtilRestante,
                            _vidaUtilRestanteDiferente,
                            _codigoCuentaDescripcion,
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
      const arrayDataObject = params.arrayDataObject;
      const arrayValidateObject = params.arrayValidateObject;
      const fechaOperacion = params.fechaOperacion;
      const fechaInicialOperacion = params.fechaInicialOperacion;
      const item = params.item;
      const indexMainFiles = params.index;
      const isAllFiles = params.isAllFiles;
      const infoArchivo = params.infoArchivo;
      const instrumento = params.instrumento;
      const _tipoAccion = params._tipoAccion;
      const _lugarNegociacion = params._lugarNegociacion;
      const _lugarNegociacionVacio = params._lugarNegociacionVacio;
      const _tipoOperacion = params._tipoOperacion;
      const _tipoActivo = params._tipoActivo;
      const _tasaRendimientoConInstrumento139 =
        params._tasaRendimientoConInstrumento139;
      const _tasaRendimientoConInstrumento138 =
        params._tasaRendimientoConInstrumento138;
      const _entidadEmisora = params._entidadEmisora;
      const _plazoValorConInstrumento = params._plazoValorConInstrumento;
      const _plazoValorConInstrumentoDiferente =
        params._plazoValorConInstrumentoDiferente;
      const _tasaRelevanteConInstrumento = params._tasaRelevanteConInstrumento;
      const _tasaRelevanteConInstrumentoDiferente =
        params._tasaRelevanteConInstrumentoDiferente;
      const _plazoEconomicoConInstrumento =
        params._plazoEconomicoConInstrumento;
      const _plazoEconomicoConInstrumentoDiferente =
        params._plazoEconomicoConInstrumentoDiferente;
      const _tasaUltimoHechoConInstrumento =
        params._tasaUltimoHechoConInstrumento;
      const _tasaUltimoHechoConInstrumentoDiferente =
        params._tasaUltimoHechoConInstrumentoDiferente;
      const _tipoCuenta = params._tipoCuenta;
      const _entidadFinanciera = params._entidadFinanciera;
      const _moneda = params._moneda;
      const _emisor = params._emisor;
      const _pais = params._pais;
      const _tipoAmortizacion = params._tipoAmortizacion;
      const _tipoInteres = params._tipoInteres;
      const _tipoTasa = params._tipoTasa;
      const _prepago = params._prepago;
      const _subordinado = params._subordinado;
      const _calificacion = params._calificacion;
      const _calificacionVacio = params._calificacionVacio;
      const _calificacionConInstrumento = params._calificacionConInstrumento;
      const _calificadora = params._calificadora;
      const _calificadoraConInstrumento = params._calificadoraConInstrumento;
      const _custodio = params._custodio;
      const calfRiesgo = params._entidadFinanciera;
      const instrumento135 = params.instrumento135;
      const instrumento136 = params.instrumento136;
      const cortoPlazo = params.cortoPlazo;
      const largoPlazo = params.largoPlazo;
      const calfRiesgoNormal = params.calfRiesgoNormal;
      const _tipoCambio = params.tipoCambio;
      const _bolsa = params._bolsa;
      const _tipoValoracion = params._tipoValoracion;
      const _tipoValoracion22 = params._tipoValoracion22;
      const _tipoValoracion31 = params._tipoValoracion31;
      const _tipoValoracion210 = params._tipoValoracion210;
      const _instrumento135 = params._instrumento135;
      const _instrumento1 = params._instrumento1;
      const _instrumento25 = params._instrumento25;
      const _ciudad = params._ciudad;
      const _tipoBienInmueble = params._tipoBienInmueble;
      const _totalVidaUtil = params._totalVidaUtil;
      const _totalVidaUtilDiferente = params._totalVidaUtilDiferente;
      const _vidaUtilRestante = params._vidaUtilRestante;
      const _vidaUtilRestanteDiferente = params._vidaUtilRestanteDiferente;
      // console.log("_totalVidaUtil", _totalVidaUtil);
      // console.log("_totalVidaUtilDiferente", _totalVidaUtilDiferente);

      const _codigoOperacion = params._codigoOperacion;
      const _codigoMercado = params._codigoMercado;
      const _codigoCustodia = params._codigoCustodia;
      const _traspasoCustodia = params._traspasoCustodia;
      const _codigoCuenta = params._codigoCuenta;
      const _descripcionCuenta = params._descripcionCuenta;
      const _codigoCuentaDescripcion = params._codigoCuentaDescripcion;
      const _codigoFondo = params._codigoFondo;
      const _tipoCuentaLiquidez = params._tipoCuentaLiquidez;
      const _cuentaContable = params._cuentaContable;
      const _codigoBanco = params._codigoBanco;
      const _codigoAFP = params._codigoAFP;
      const _nombreAFP = params._nombreAFP;
      const _codigoEmisor = params._codigoEmisor;
      const _precioNominalBs = params._precioNominalBs;
      const _cantidadPagos = params._cantidadPagos;
      const _subordinacion = params._subordinacion;
      const _codigoTraspasoCustodia = params._codigoTraspasoCustodia;
      const _valorNominalBs = params._valorNominalBs;

      let lugarNegociacionTipoOperacionAux = false;
      let groupingAux = false;
      let serieAux = "";
      let contadorSerieAux = 0;

      const _cadenaCombinadalugarNegTipoOperTipoInstrum =
        params._cadenaCombinadalugarNegTipoOperTipoInstrum;
      // console.log(dependenciesArray);
      // console.log(codeCurrentFile);
      // console.log("arrayDataObject", arrayDataObject);
      // console.log(valuesUniquesArray);
      lengthFilesObject[codeCurrentFile] = arrayDataObject.length;
      const validarCampoIndividual = async (
        value,
        columnName,
        pattern,
        date,
        funct,
        mayBeEmpty,
        operationNotValid,
        notValidate,
        unique,
        uniqueBy,
        singleGroup,
        endSingleGroup,
        grouping,
        messageError,
        typeError,
        item2,
        index2,
        item3,
        codeCurrentFile,
        arrayDataObject,
        arrayValidateObject,
        index3
      ) => {
        let match;
        if (date === true) {
          const valueAux =
            value?.slice(0, 4) +
            "-" +
            value?.slice(4, 6) +
            "-" +
            value?.slice(6);
          match = valueAux?.match(pattern);
        } else {
          match = value?.match(pattern);
        }

        if (mayBeEmpty === true && !value) {
        } else {
          if (match === null) {
            // SI NO PUEDE ESTAR VACIO Y EL VALRFO ES VACIO
            errors.push({
              archivo: item.archivo,
              tipo_error: "TIPO DE DATO INCORRECTO",
              descripcion:
                typeError === "format"
                  ? "El campo no cumple el formato establecido"
                  : `El campo no cumple las especificaciones de Tipo de Dato`,
              valor: value,
              columna: columnName,
              fila: index2,
            }); //FORMATO DE VALOR DE DOMINIO
          }
        }
        try {
          if (columnName.includes("fecha") && notValidate === null) {
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
                  descripcion:
                    columnName === "fecha_vencimiento"
                      ? "Fecha de Vencimiento incorrecta, debe corresponder a la Fecha del Archivo"
                      : `La fecha debe coincidir con el nombre del archivo`,
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
                  descripcion: `La fecha debe coincidir con el nombre del archivo`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              } else if (value !== fechaOperacion) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `La fecha debe coincidir con el nombre del archivo`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            }
          }
          //#region EJECUCION DE VALIDACIONES DE DEPENDENCIAS DE ARCHIVOS
          if (codeCurrentFile === "441" || codeCurrentFile === "443") {
            const serieCombinada = `${item2.tipo_instrumento}${item2.serie}`;
            map(dependenciesArray, (itemDP, indexDP) => {
              if (
                serieCombinada !== itemDP.value &&
                (itemDP.code === "411" || itemDP.code === "413")
              ) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO OPERACION NO VALIDA",
                  descripcion: `El tipo_instrumento combinado con la serie del archivo ${itemDP.file} no debe ser igual a el tipo_instrumento combinado con la serie del archivo ${item.archivo} debido a que el tipo_operacion en el archivo ${itemDP.file} es igual a "COP". SERIE DEL ARCHIVO ${itemDP.file}: ${itemDP.value}, SERIE DEL ARCHIVO ${item.archivo}: ${serieCombinada}`,
                  valor: itemDP.value,
                  columna: itemDP.column,
                  fila: itemDP.row,
                });
              }
            });
          }
          if (
            (codeCurrentFile === "444" || codeCurrentFile === "445") &&
            index2 === arrayDataObject.length - 1 &&
            index3 === arrayValidateObject.length - 1
          ) {
            // console.log(dependenciesArray);
            map(dependenciesArray, (itemDP, indexDP) => {
              if (
                (itemDP.code === "441" && codeCurrentFile === "444") ||
                (itemDP.code === "442" && codeCurrentFile === "445")
              ) {
                if (itemDP.column === "nro_pago") {
                  const cantidadNroPago = itemDP.value.nro_pago;
                  const tasa = itemDP.value.tasa;
                  const tipoTasa = itemDP.value.tasa?.tipo_tasa;
                  const tasaEmision = itemDP.value.tasa?.tasa_emision;
                  const dependencyInstrumentoSerie =
                    itemDP.value.instrumentoSerie;
                  let currentInstrumentoSerie = "";
                  let currentInstrumentoSerieAux = "";
                  let countCurrentInstrumentoSerie = 0;
                  const errTasaArray = [];

                  map(arrayDataObject, (itemArray, indexArray) => {
                    currentInstrumentoSerie = `${itemArray.tipo_instrumento}${itemArray.serie}`;
                    if (
                      dependencyInstrumentoSerie === currentInstrumentoSerie
                    ) {
                      if (tasa !== null) {
                        if (tasaEmision !== itemArray.tasa_interes) {
                          errTasaArray.push({
                            value: itemArray.tasa_interes,
                            valuePrevious: tasaEmision,
                            column: "tasa_interes",
                            serie: currentInstrumentoSerie,
                            row: indexArray,
                            message: `No es la misma Tasa que indica el archivo ${itemDP.code}`,
                          });
                        }
                      }
                      currentInstrumentoSerieAux = currentInstrumentoSerie;
                      countCurrentInstrumentoSerie++;
                    }
                  });

                  if (
                    parseInt(countCurrentInstrumentoSerie) !==
                    parseInt(cantidadNroPago)
                  ) {
                    errors.push({
                      archivo: `${itemDP.file}, ${item.archivo}`,
                      tipo_error: `VALOR INCORRECTO de ${itemDP.code} a ${codeCurrentFile}`,
                      descripcion: `El Archivo ${codeCurrentFile} no tiene la cuponera de la Serie del Archivo ${itemDP.code}`,
                      valor: `${
                        itemDP.code
                      }: serie: ${dependencyInstrumentoSerie}, ${
                        itemDP.column
                      }: ${cantidadNroPago}, ${codeCurrentFile}: ${
                        currentInstrumentoSerieAux &&
                        `serie: ${currentInstrumentoSerieAux}, `
                      }registros: ${countCurrentInstrumentoSerie}`,
                      columna: `${itemDP.code}: ${itemDP.column}`,
                      fila: itemDP.row,
                    });
                  }
                  if (errTasaArray.length >= 1) {
                    map(errTasaArray, (itemErr, indexErr) => {
                      errors.push({
                        archivo: item.archivo,
                        tipo_error: `VALOR INCORRECTO`,
                        descripcion: itemErr.message,
                        valor: `serie: ${currentInstrumentoSerie} ${codeCurrentFile}: tasa_interes: ${itemErr.value}, ${itemDP.code}: tasa_emision: ${itemErr.valuePrevious}`,
                        columna: itemErr.column,
                        fila: itemErr.row,
                      });
                    });
                  }
                }
              }
            });
          }
          if (
            (codeCurrentFile === "444" || codeCurrentFile === "CO") &&
            index2 === arrayDataObject.length - 1 &&
            index3 === arrayValidateObject.length - 1
          ) {
            // console.log(dependenciesArray);
            map(dependenciesArray, (itemDP, indexDP) => {
              if (
                (itemDP.code === "TD" && codeCurrentFile === "UD") ||
                (itemDP.code === "TO" && codeCurrentFile === "CO")
              ) {
                if (itemDP.column === "nro_pago") {
                  const cantidadNroPago = itemDP.value.nro_pago;
                  const tasa = itemDP.value.tasa;
                  const tipoTasa = itemDP.value.tasa?.tipo_tasa;
                  const tasaEmision = itemDP.value.tasa?.tasa_emision;
                  const dependencyInstrumentoSerie =
                    itemDP.value.instrumentoSerie;
                  let currentInstrumentoSerie = "";
                  let currentInstrumentoSerieAux = "";
                  let countCurrentInstrumentoSerie = 0;
                  const errTasaArray = [];

                  map(arrayDataObject, (itemArray, indexArray) => {
                    currentInstrumentoSerie = `${itemArray.tipo_instrumento}${itemArray.serie}`;
                    if (
                      dependencyInstrumentoSerie === currentInstrumentoSerie
                    ) {
                      if (tasa !== null) {
                        if (tasaEmision !== itemArray.tasa_interes) {
                          errTasaArray.push({
                            value: itemArray.tasa_interes,
                            valuePrevious: tasaEmision,
                            column: "tasa_interes",
                            serie: currentInstrumentoSerie,
                            row: indexArray,
                            message: `No es la misma Tasa que indica el archivo ${itemDP.code}`,
                          });
                        }
                      }
                      currentInstrumentoSerieAux = currentInstrumentoSerie;
                      countCurrentInstrumentoSerie++;
                    }
                  });
                  // console.log("cantidadNroPago441", cantidadNroPago441);
                  // console.log(
                  //   "countCurrentInstrumentoSerie",
                  //   countCurrentInstrumentoSerie
                  // );
                  // console.log(tasa, tipoTasa, tasaEmision);
                  // console.log("errTasaArray", errTasaArray);

                  if (
                    parseInt(countCurrentInstrumentoSerie) !==
                    parseInt(cantidadNroPago)
                  ) {
                    errors.push({
                      archivo: `${itemDP.file}, ${item.archivo}`,
                      tipo_error: `VALOR INCORRECTO de ${itemDP.code} a ${codeCurrentFile}`,
                      descripcion: `El Archivo ${codeCurrentFile} no tiene la cuponera de la Serie del Archivo ${itemDP.code}`,
                      valor: `${
                        itemDP.code
                      }: serie: ${dependencyInstrumentoSerie}, ${
                        itemDP.column
                      }: ${cantidadNroPago}, ${codeCurrentFile}: ${
                        currentInstrumentoSerieAux &&
                        `serie: ${currentInstrumentoSerieAux}, `
                      }registros: ${countCurrentInstrumentoSerie}`,
                      columna: `${itemDP.code}: ${itemDP.column}`,
                      fila: itemDP.row,
                    });
                  }
                  if (errTasaArray.length >= 1) {
                    map(errTasaArray, (itemErr, indexErr) => {
                      errors.push({
                        archivo: item.archivo,
                        tipo_error: `VALOR INCORRECTO`,
                        descripcion: itemErr.message,
                        valor: `serie: ${currentInstrumentoSerie} ${codeCurrentFile}: tasa_interes: ${itemErr.value}, ${itemDP.code}: tasa_emision: ${itemErr.valuePrevious}`,
                        columna: itemErr.column,
                        fila: itemErr.row,
                      });
                    });
                  }
                }
              }
            });
          }
          if (codeCurrentFile === "CR" || codeCurrentFile === "CV") {
            const serieCombinada = `${item2.tipo_instrumento}${item2.serie}`;
            map(dependenciesArray, (itemDP, indexDP) => {
              if (
                serieCombinada !== itemDP.value &&
                (itemDP.code === "DM" || itemDP.code === "DR")
              ) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO OPERACION NO VALIDA",
                  descripcion: `El tipo_instrumento combinado con la serie del archivo ${itemDP.file} no debe ser igual a el tipo_instrumento combinado con la serie del archivo ${item.archivo} debido a que el tipo_operacion en el archivo ${itemDP.file} es igual a "COP". SERIE DEL ARCHIVO ${itemDP.file}: ${itemDP.value}, SERIE DEL ARCHIVO ${item.archivo}: ${serieCombinada}`,
                  valor: itemDP.value,
                  columna: itemDP.column,
                  fila: itemDP.row,
                });
              }
            });
          }
          //#endregion

          //#region CREACION DE VALIDACIONES DE DEPENDENCIAS DE ARCHIVOS
          if (codeCurrentFile === "441" || codeCurrentFile === "442") {
            if (columnName === "nro_pago") {
              if (isNaN(parseInt(value))) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El valor no es un numero válido`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              } else {
                if (parseInt(value) > 1) {
                  let tasaAux = null;
                  if (codeCurrentFile === "441") {
                    item2.tipo_tasa === "F"
                      ? (tasaAux = {
                          tipo_tasa: item2.tipo_tasa,
                          tasa_emision: item2.tasa_emision,
                        })
                      : null;
                  } else if (codeCurrentFile === "442") {
                    tasaAux = {
                      tasa_emision: item2.tasa_emision,
                    };
                  }
                  const instrumentoSerie = `${item2.tipo_instrumento}${item2.serie}`;
                  dependenciesArray.push({
                    file: item.archivo,
                    code: codeCurrentFile,
                    value: {
                      instrumentoSerie,
                      [columnName]: value,
                      tasa: tasaAux,
                    },
                    row: index2,
                    column: columnName,
                  });
                }
              }
            }
          }
          if (codeCurrentFile === "411" || codeCurrentFile === "412") {
            if (
              columnName === "serie" &&
              operationNotValid === "tipoOperacionCOP"
            ) {
              if (item2.tipo_operacion === "COP") {
                const serieCombinada = `${item2.tipo_instrumento}${item2.serie}`;
                dependenciesArray.push({
                  file: item.archivo,
                  code: codeCurrentFile,
                  value: serieCombinada,
                  row: index2,
                  column: columnName,
                });
              }
            }
          }
          if (codeCurrentFile === "DM" || codeCurrentFile === "DR") {
            if (
              columnName === "serie" &&
              operationNotValid === "tipoOperacionCOP"
            ) {
              if (item2.tipo_operacion === "COP") {
                const serieCombinada = `${item2.tipo_instrumento}${item2.serie}`;
                dependenciesArray.push({
                  file: item.archivo,
                  code: codeCurrentFile,
                  value: serieCombinada,
                  row: index2,
                  column: columnName,
                });
              }
            }
          }
          if (codeCurrentFile === "TD" || codeCurrentFile === "TO") {
            if (columnName === "nro_pago") {
              if (isNaN(parseInt(value))) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El valor no es un numero válido`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              } else {
                if (parseInt(value) > 1) {
                  let tasaAux = null;
                  if (codeCurrentFile === "TD") {
                    item2.tipo_tasa === "F"
                      ? (tasaAux = {
                          tipo_tasa: item2.tipo_tasa,
                          tasa_emision: item2.tasa_emision,
                        })
                      : null;
                  } else if (codeCurrentFile === "TO") {
                    tasaAux = {
                      tasa_emision: item2.tasa_emision,
                    };
                  }
                  const instrumentoSerie = `${item2.tipo_instrumento}${item2.serie}`;
                  dependenciesArray.push({
                    file: item.archivo,
                    code: codeCurrentFile,
                    value: {
                      instrumentoSerie,
                      [columnName]: value,
                      tasa: tasaAux,
                    },
                    row: index2,
                    column: columnName,
                  });
                }
              }
            }
          }
          //#endregion

          for (
            let indexFunction = 0;
            indexFunction < funct?.length;
            indexFunction++
          ) {
            const itemFunction = funct[indexFunction];

            if (itemFunction === "bolsa") {
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
                  descripcion: `El contenido del archivo no coincide con alguna sigla de Bolsa de Valores`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tipoValoracion") {
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
                  descripcion: `El contenido del archivo no coincide con alguna sigla de Tipo de Valoración`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tipoAccion") {
              let errFunction = true;
              map(_tipoAccion?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  // console.log(value);
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna sigla de Tipo de Acción`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "serieEmision") {
              const functionMessage = serieEmision(
                item2?.tipo_instrumento,
                value
              );
              if (functionMessage !== true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: functionMessage,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "precioNominalBs") {
              try {
                const _monedaTipoCambio = await monedaTipoCambio({
                  moneda: item2.moneda,
                  value1: {
                    key: "precio_nominal_bs",
                    value: item2.precio_nominal_bs,
                  },
                  value2: {
                    key: "precio_nominal_mo",
                    value: item2.precio_nominal_mo,
                  },
                  tipoCambio: _tipoCambio,
                });
                if (_monedaTipoCambio?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _monedaTipoCambio?.message,
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
            } else if (itemFunction === "valorNominalBs") {
              try {
                const _monedaTipoCambio = await monedaTipoCambio({
                  moneda: item2.moneda,
                  value1: {
                    key: "valor_nominal_bs",
                    value: item2.valor_nominal_bs,
                  },
                  value2: {
                    key: "valor_nominal_mo",
                    value: item2.valor_nominal_mo,
                  },
                  tipoCambio: _tipoCambio,
                });
                if (_monedaTipoCambio?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _monedaTipoCambio?.message,
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
            } else if (itemFunction === "tipoValoracionConsultaMultiple") {
              try {
                const _tipoValoracionConsultaMultiple =
                  await tipoValoracionConsultaMultiple({
                    tipo_instrumento: item2.tipo_instrumento,
                    tipo_valoracion: item2.tipo_valoracion,
                    _instrumento135,
                    _instrumento1,
                    _instrumento25,
                    _tipoValoracion22,
                    _tipoValoracion31,
                    _tipoValoracion210,
                  });
                if (_tipoValoracionConsultaMultiple?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _tipoValoracionConsultaMultiple?.message,
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
            } else if (itemFunction === "tipoInstrumento") {
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
                  descripcion: `El campo no corresponde a ninguno de los autorizados por el RMV`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tipoOperacion") {
              let errFunction = true;
              if (lugarNegociacionTipoOperacionAux) {
                map(_tipoOperacion?.resultFinal, (item4, index4) => {
                  if (value === item4.codigo_rmv) {
                    errFunction = false;
                  }
                });
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `El campo no corresponde a ninguno de los autorizados por el RMV`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (itemFunction === "lugarNegociacion") {
              let errFunction = true;
              let errFunctionEmpty = true;
              map(_lugarNegociacionVacio?.resultFinal, (item4, index4) => {
                if (item2.tipo_operacion === item4.codigo_rmv) {
                  errFunctionEmpty = false;
                }
              });
              if (!errFunctionEmpty) {
                lugarNegociacionTipoOperacionAux = false;
                // descripcion: `El campo lugar_negociacion debe estar vacio debido a que el tipo_operacion es ${item3.tipo_operacion}`,
                if (value !== "" || value?.length !== 0) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `El campo debe estar vacío`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                lugarNegociacionTipoOperacionAux = true;
                map(_lugarNegociacion?.resultFinal, (item4, index4) => {
                  if (item2.lugar_negociacion === item4.codigo_rmv) {
                    errFunction = false;
                  }
                });
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `El campo no corresponde a ninguno de los autorizados por el RMV`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (itemFunction === "tipoActivo") {
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
                  descripcion: `El campo no corresponde a ninguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tasaRendimientoConInstrumento") {
              let _igualA = null;
              let _mayorACeroDecimal = null;
              let functionAux = null;
              map(
                _tasaRendimientoConInstrumento138?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_activo === item4.sigla) {
                    functionAux = 1;
                  }
                }
              );
              map(
                _tasaRendimientoConInstrumento139?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_activo === item4.sigla) {
                    functionAux = 2;
                  }
                }
              );

              if (functionAux === 1) {
                _igualA = igualA({
                  value: parseInt(value),
                  equalTo: 0,
                });
                if (_igualA?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _igualA?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else if (functionAux === 2) {
                _mayorACeroDecimal = mayorACeroDecimal({
                  value: value,
                });
                if (_mayorACeroDecimal?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _mayorACeroDecimal?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El valor de ${columnName} no es correcto debido a que el tipo_activo es ${item2.tipo_activo}`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "entidadEmisora") {
              let errFunction = true;
              map(_entidadEmisora?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  // console.log(value);
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna entidad emisora`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "plazoValorConInstrumento") {
              let _igualA = null;
              let _mayorIgualACeroDecimal = null;
              let functionAux = null;
              map(_plazoValorConInstrumento?.resultFinal, (item4, index4) => {
                if (item2.tipo_instrumento === item4.sigla) {
                  functionAux = 1;
                }
              });
              map(
                _plazoValorConInstrumentoDiferente?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_instrumento === item4.sigla) {
                    functionAux = 2;
                  }
                }
              );

              if (functionAux === 1) {
                _igualA = igualA({
                  value: parseInt(value),
                  equalTo: 0,
                });
                if (_igualA?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _igualA?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else if (functionAux === 2) {
                _mayorIgualACeroDecimal = mayorIgualACeroDecimal({
                  value: value,
                });
                if (_mayorIgualACeroDecimal?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _mayorACeroDecimal?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El valor de ${columnName} no es correcto debido a que el tipo_instrumento es ${item2.tipo_instrumento}`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tasaRelevanteConInstrumento") {
              let _igualA = null;
              let _mayorACeroDecimal = null;
              let functionAux = null;
              map(
                _tasaRelevanteConInstrumento?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_instrumento === item4.sigla) {
                    functionAux = 1;
                  }
                }
              );
              map(
                _tasaRelevanteConInstrumentoDiferente?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_instrumento === item4.sigla) {
                    functionAux = 2;
                  }
                }
              );

              if (functionAux === 1) {
                _igualA = igualA({
                  value: parseInt(value),
                  equalTo: 0,
                });
                if (_igualA?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _igualA?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else if (functionAux === 2) {
                _mayorACeroDecimal = mayorACeroDecimal({
                  value: value,
                });
                if (_mayorACeroDecimal?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _mayorACeroDecimal?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El valor de ${columnName} no es correcto debido a que el tipo_instrumento es ${item2.tipo_instrumento}`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tasaRendimientoConInstrumento") {
              let _igualA = null;
              let _mayorACeroDecimal = null;
              let functionAux = null;
              map(
                _tasaRelevanteConInstrumento?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_instrumento === item4.sigla) {
                    functionAux = 1;
                  }
                }
              );
              map(
                _tasaRelevanteConInstrumentoDiferente?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_instrumento === item4.sigla) {
                    functionAux = 2;
                  }
                }
              );

              if (functionAux === 1) {
                _igualA = igualA({
                  value: parseInt(value),
                  equalTo: 0,
                });
                if (_igualA?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _igualA?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else if (functionAux === 2) {
                _mayorACeroDecimal = mayorACeroDecimal({
                  value: value,
                });
                if (_mayorACeroDecimal?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _mayorACeroDecimal?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El valor de ${columnName} no es correcto debido a que el tipo_instrumento es ${item2.tipo_instrumento}`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "plazoEconomicoConInstrumento") {
              let _igualA = null;
              let _mayorIgualACeroDecimal = null;
              let functionAux = null;
              map(
                _plazoEconomicoConInstrumento?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_instrumento === item4.sigla) {
                    functionAux = 1;
                  }
                }
              );
              map(
                _plazoEconomicoConInstrumentoDiferente?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_instrumento === item4.sigla) {
                    functionAux = 2;
                  }
                }
              );

              if (functionAux === 1) {
                _igualA = igualA({
                  value: parseInt(value),
                  equalTo: 0,
                });
                if (_igualA?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _igualA?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else if (functionAux === 2) {
                _mayorIgualACeroDecimal = mayorIgualACeroDecimal({
                  value: value,
                });
                if (_mayorIgualACeroDecimal?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _mayorACeroDecimal?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El valor de ${columnName} no es correcto debido a que el tipo_instrumento es ${item2.tipo_instrumento}`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tasaUltimoHechoConInstrumento") {
              let _igualA = null;
              let _mayorIgualACeroDecimal = null;
              let functionAux = null;
              map(
                _tasaUltimoHechoConInstrumento?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_instrumento === item4.sigla) {
                    functionAux = 1;
                  }
                }
              );
              map(
                _tasaUltimoHechoConInstrumentoDiferente?.resultFinal,
                (item4, index4) => {
                  if (item2.tipo_instrumento === item4.sigla) {
                    functionAux = 2;
                  }
                }
              );

              if (functionAux === 1) {
                _igualA = igualA({
                  value: parseInt(value),
                  equalTo: 0,
                });
                if (_igualA?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _igualA?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else if (functionAux === 2) {
                _mayorIgualACeroDecimal = mayorIgualACeroDecimal({
                  value: value,
                });
                if (_mayorIgualACeroDecimal?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _mayorACeroDecimal?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El valor de ${columnName} no es correcto debido a que el tipo_instrumento es ${item2.tipo_instrumento}`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "codigoOperacion") {
              let errFunction = true;
              map(_codigoOperacion?.resultFinal, (item4, index4) => {
                if (value === item4.codigo_aps) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con algún código de operación`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "marcacion") {
              try {
                const _tipoMarcacion = infoArchivo.paramsTipoMarcacion
                  ? await tipoMarcacion({
                      tipo_marcacion: item2.tipo_marcacion,
                      monto_negociado: parseFloat(item2.monto_negociado),
                      monto_minimo: parseFloat(item2.monto_minimo),
                    })
                  : null;
                if (_tipoMarcacion?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _tipoMarcacion?.message,
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
            } else if (itemFunction === "tipoCuenta") {
              let errFunction = true;
              map(_tipoCuenta?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna sigla de tipo de cuenta`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "entidadFinanciera") {
              let errFunction = true;
              map(_entidadFinanciera?.resultFinal, (item4, index4) => {
                if (value === item4.codigo_rmv) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El campo no corresponde a ninguna entidad financiera activa`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "moneda") {
              let errFunction = true;
              // console.log(_moneda);
              // console.log([value]);
              map(_moneda?.resultFinal, (item4, index4) => {
                if (
                  value === item4.codigo_otros_activos ||
                  value === item4.sigla ||
                  value === item4.codigo_valoracion
                ) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: isUndefined(messageError)
                    ? `El campo no corresponde a ninguno de los autorizados por el RMV`
                    : messageError,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "emisor") {
              let errFunction = true;
              map(_emisor?.resultFinal, (item4, index4) => {
                if (value === item4.codigo_rmv) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `Solicitar el Registro de Emisor a la APS (Autorización RMV)`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "pais") {
              let errFunction = true;
              map(_pais?.resultFinal, (item4, index4) => {
                if (value === item4.codigo) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El campo no corresponde a ninguno de los autorizados por el RMV`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tipoAmortizacion") {
              let errFunction = true;
              map(_tipoAmortizacion?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con algún tipo de amortizacion`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tipoInteres") {
              let errFunction = true;
              map(_tipoInteres?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El campo no corresponde a ningún Tipo de Interés definido`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tipoTasa") {
              let errFunction = true;
              map(_tipoTasa?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El campo no corresponde a ningún Tipo de Tasa definido`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tasaEmision") {
              const functionMessage = tasaEmision(item2?.tipo_interes, value);
              if (functionMessage !== true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: functionMessage,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "prepago") {
              let errFunction = true;
              map(_prepago?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna sigla de prepago`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "subordinado") {
              let errFunction = true;
              map(_subordinado?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna sigla de subordinado`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "calificacion") {
              if (mayBeEmpty === true && !value) {
              } else {
                let errFunction = true;
                map(_calificacion?.resultFinal, (item4, index4) => {
                  if (value === item4.descripcion) {
                    errFunction = false;
                  }
                });
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `La calificación no se encuentra en ninguna calificación válida`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (itemFunction === "calificadora") {
              if (mayBeEmpty === true && !value) {
              } else {
                let errFunction = true;
                map(_calificadora?.resultFinal, (item4, index4) => {
                  if (value === item4.sigla) {
                    errFunction = false;
                  }
                });
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `La calificadora no se encuentra en ninguna calificadora válida`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (itemFunction === "calificadoraConInstrumento") {
              let errFunction = true;
              let errFunctionInstrumento = true;
              map(_calificadoraConInstrumento?.resultFinal, (item4, index4) => {
                if (item2.tipo_instrumento === item4.sigla) {
                  errFunctionInstrumento = false;
                }
              });
              map(_calificadora?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunctionInstrumento) {
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `La calificadora no se encuentra en ninguna calificadora válida`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                if (
                  (value !== "" || value.length >= 1) &&
                  errFunction === true
                ) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `La calificadora no se encuentra en ninguna calificadora válida`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (itemFunction === "calificacionConInstrumento") {
              const tiposInstrumentos = item3?.tiposInstrumentos;
              let errFunction = true;
              let errFunctionInstrumento = true;
              let errFunctionVacio = true;
              if (!isUndefined(tiposInstrumentos)) {
                if (!includes(tiposInstrumentos, item2.tipo_instrumento))
                  errFunctionInstrumento = false;
              } else {
                forEach(_calificacionConInstrumento?.resultFinal, (item4) => {
                  if (item2.tipo_instrumento === item4.sigla)
                    errFunctionInstrumento = false;
                });
              }
              if (!errFunctionInstrumento) {
                forEach(_calificacionVacio?.resultFinal, (item4) => {
                  if (value === item4.descripcion) errFunctionVacio = false;
                });
                if (
                  (value !== "" || value.length >= 1) &&
                  errFunctionVacio === true
                ) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `La calificación no se encuentra en ninguna calificación válida`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                map(_calificacion?.resultFinal, (item4, index4) => {
                  if (value === item4.descripcion) {
                    errFunction = false;
                  }
                });
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `La calificación no se encuentra en ninguna calificación válida`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (itemFunction === "custodio") {
              if (mayBeEmpty === true && !value) {
              } else {
                let errFunction = true;
                map(_custodio?.resultFinal, (item4, index4) => {
                  if (value === item4.sigla) {
                    errFunction = false;
                  }
                });
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `El campo no corresponde a ninguna sigla de Custodio definida`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (itemFunction === "codigoMercado") {
              let errFunction = true;
              map(_codigoMercado?.resultFinal, (item4, index4) => {
                if (value === item4.codigo_aps) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con algún codigo de mercado`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "codigoCuenta") {
              let errFunction = true;
              map(_codigoCuenta?.resultFinal, (item4, index4) => {
                if (value === item4.cuenta) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El Código de Cuenta no existe en el Plan de Cuentas`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "descripcionCuenta") {
              let errFunction = true;
              map(_descripcionCuenta?.resultFinal, (item4, index4) => {
                if (value === item4.descripcion) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna descripción de cuenta`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "codigoCuentaDescripcion") {
              let errFunction = true;
              const points = filter(
                item2.codigo_cuenta,
                (itemFilter) => itemFilter === "."
              );
              if (points.length < 5) {
                map(_codigoCuentaDescripcion?.resultFinal, (item4, index4) => {
                  if (
                    `${item2.codigo_cuenta} ${item2.descripcion}` ===
                    item4.valor
                  ) {
                    errFunction = false;
                  }
                });
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `Cuenta+descripción no existe en el Plan de Cuentas`,
                    valor: `${item2.codigo_cuenta} ${item2.descripcion}`,
                    columna: `codigo_cuenta, ${columnName}`,
                    fila: index2,
                  });
                }
              }
            } else if (itemFunction === "codigoFondo") {
              let errFunction = true;
              map(_codigoFondo?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tipoCuentaLiquidez") {
              let errFunction = true;
              map(_tipoCuentaLiquidez?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "cuentaContable") {
              let errFunction = true;
              map(_cuentaContable?.resultFinal, (item4, index4) => {
                if (value === item4.cuenta) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `La cuenta contable no coincide con ningún plan de cuentas disponible`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "codigoBanco") {
              let errFunction = true;
              map(_codigoBanco?.resultFinal, (item4, index4) => {
                if (value === item4.sigla || value === item4.codigo_rmv) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "codigoAFP") {
              let errFunction = true;
              map(_codigoAFP?.resultFinal, (item4, index4) => {
                if (value === item4.codigo) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "nombreAFP") {
              let errFunction = true;
              map(_nombreAFP?.resultFinal, (item4, index4) => {
                if (value === item4.institucion) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "codigoEmisor") {
              let errFunction = true;
              map(_codigoEmisor?.resultFinal, (item4, index4) => {
                if (value === item4.codigo_aps) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con algún codigo de emisor`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "precioNominalBs") {
              let errFunction = true;
              map(_precioNominalBs?.resultFinal, (item4, index4) => {
                if (value === item4.codigo_valoracion) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con algún precio nominal en bolivianos`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "cantidadPagos") {
              let errFunction = false;
              let _instrumentoClasificador = null;
              map(_cantidadPagos?.resultFinal, (item4, index4) => {
                if (item2.tipo_instrumento === item4.sigla_instrumento) {
                  _instrumentoClasificador = item4;
                }
              });

              if (_instrumentoClasificador.sigla_clasificador === "RF") {
                if (value > 0) {
                  errFunction = true;
                }
              } else if (
                _instrumentoClasificador.sigla_clasificador === "EXRF"
              ) {
                if (value === 1) {
                  errFunction = true;
                }
              }
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna cantidad de pagos válida`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "subordinacion") {
              let errFunction = true;
              map(_subordinacion?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna cantidad de pagos`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "valorNominalBs") {
              let errFunction = true;
              map(_valorNominalBs?.resultFinal, (item4, index4) => {
                if (value === item4.compra) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con algun valor válido`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "interesMasAmortizacion") {
              let _operacionEntreColumnas =
                infoArchivo?.paramsInteresMasAmortizacion
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
                      },
                      fields: [
                        {
                          key: "interes",
                          value: parseFloat(item2.interes),
                        },
                        "+",
                        {
                          key: "amortizacion",
                          value: parseFloat(item2.amortizacion),
                        },
                      ],
                    })
                  : null;

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              itemFunction === "saldoCapitalMenosAmortizacionCuponAnterior"
            ) {
              if (item2.serie !== serieAux) {
                serieAux = item2.serie;
                contadorSerieAux += index2 + 1;
              }
              if (index2 >= contadorSerieAux) {
                let _operacionEntreColumnas =
                  infoArchivo?.paramsSaldoCapitalMenosAmortizacionCuponAnterior
                    ? await operacionEntreColumnas({
                        total: {
                          key: `${columnName} (fila actual: ${index2})`,
                          value: parseFloat(value),
                        },
                        fields: [
                          {
                            key: `saldo_capital (fila anterior: ${index2 - 1})`,
                            value: parseFloat(
                              arrayDataObject[index2 - 1].saldo_capital
                            ),
                          },
                          "-",
                          {
                            key: `amortizacion (fila actual: ${index2})`,
                            value: parseFloat(
                              arrayDataObject[index2].amortizacion
                            ),
                          },
                        ],
                      })
                    : null;

                if (_operacionEntreColumnas?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: _operacionEntreColumnas?.message,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (
              funct ===
              "saldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000"
            ) {
              let _operacionEntreColumnas =
                infoArchivo?.paramsSaldoCapitalMultiplicadoPlazoCuponMultiplicadoTasaInteresDividido36000
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
                      },
                      fields: [
                        {
                          key: `saldo_capital`,
                          value: parseFloat(item2.saldo_capital),
                        },
                        "*",
                        {
                          key: `plazo_cupon`,
                          value: parseFloat(item2.plazo_cupon),
                        },
                        "*",
                        {
                          key: `tasa_interes`,
                          value: parseFloat(item2.tasa_interes),
                        },
                        "/",
                        {
                          key: `36000`,
                          value: 36000,
                        },
                      ],
                    })
                  : null;

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "calificacionRiesgo") {
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
                  descripcion: `El contenido del archivo no coincide con alguna descripción de calificación de riesgo`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "codigoCustodia") {
              let errFunction = true;
              map(_codigoCustodia?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna sigla de código de custodia`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "traspasoCustodia") {
              let errFunction = true;
              map(_traspasoCustodia?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna sigla de código de traspaso custodia`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "traspasoCustodiaConCodigoOperacion") {
              if (item2.codigo_operacion === "T") {
                let errFunction = true;
                map(_traspasoCustodia?.resultFinal, (item4, index4) => {
                  if (value === item4.sigla) {
                    errFunction = false;
                  }
                });
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `El contenido del archivo no coincide con alguna sigla de código de traspaso custodia`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (
              itemFunction === "codigoTraspasoCustodiaConCodigoOperacion"
            ) {
              if (item2.codigo_operacion === "T") {
                let errFunction = true;
                map(_traspasoCustodia?.resultFinal, (item4, index4) => {
                  if (value === item4.sigla) {
                    errFunction = false;
                  }
                });
                if (errFunction === true) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: `El contenido del archivo no coincide con alguna sigla de código de traspaso custodia`,
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              }
            } else if (itemFunction === "codigoTraspasoCustodia") {
              let errFunction = true;
              map(_codigoTraspasoCustodia?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El contenido del archivo no coincide con alguna sigla de código de traspaso custodia`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "calificacionRiesgoMultiple") {
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
            } else if (itemFunction === "fechaOperacionMenorAlArchivo") {
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
            } else if (itemFunction === "montoFinalConTipoDeCambio") {
              try {
                let errFunction = { ok: false, message: "" };
                map(_tipoCambio, (item, index) => {
                  if (errFunction?.ok === false) {
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
            } else if (itemFunction === "mayorACeroDecimal") {
              const _mayorACeroDecimal = await mayorACeroDecimal({
                value: value,
              });
              // console.log(_mayorACeroDecimal);

              if (_mayorACeroDecimal?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _mayorACeroDecimal?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "mayorACeroEntero") {
              const _mayorACeroEntero = await mayorACeroEntero({
                value: value,
              });

              if (_mayorACeroEntero?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _mayorACeroEntero?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "mayorIgualACeroDecimal") {
              const _mayorIgualACeroDecimal = await mayorIgualACeroDecimal({
                value: value,
              });
              // console.log(mayorACeroDecimal);

              if (_mayorIgualACeroDecimal?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _mayorIgualACeroDecimal?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "mayorIgualACeroEntero") {
              const _mayorIgualACeroEntero = await mayorIgualACeroEntero({
                value: value,
              });

              if (_mayorIgualACeroEntero?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _mayorIgualACeroEntero?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "menorACeroDecimal") {
              const _menorACeroDecimal = await menorACeroDecimal({
                value: value,
              });
              // console.log(_menorACeroDecimal);

              if (_menorACeroDecimal?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _menorACeroDecimal?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "menorACeroEntero") {
              const _menorACeroEntero = await menorACeroEntero({
                value: value,
              });

              if (_menorACeroEntero?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _menorACeroEntero?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "menorIgualACeroDecimal") {
              const _menorIgualACeroDecimal = await menorIgualACeroDecimal({
                value: value,
              });
              // console.log(_menorIgualACeroDecimal);

              if (_menorIgualACeroDecimal?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _menorIgualACeroDecimal?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "menorIgualACeroEntero") {
              const _menorIgualACeroEntero = await menorIgualACeroEntero({
                value: value,
              });

              if (_menorIgualACeroEntero?.ok === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _menorIgualACeroEntero?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "cantidadMultiplicadoPrecio") {
              const _operacionEntreColumnas =
                infoArchivo?.paramsCantidadMultiplicadoPrecio
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
                      },
                      fields: [
                        {
                          key: "cantidad",
                          value: parseFloat(item2.cantidad),
                        },
                        "*",
                        {
                          key: "precio",
                          value: parseFloat(item2.precio),
                        },
                      ],
                    })
                  : null;

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              itemFunction === "totalBsMenosPrevisionesInversionesBs"
            ) {
              let _operacionEntreColumnas =
                infoArchivo?.paramsTotalBsMenosPrevisionesInversionesBs
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
                      },
                      fields: [
                        {
                          key: "total_bs",
                          value: parseFloat(item2.total_bs),
                        },
                        "-",
                        {
                          key: "prevision_inversion_bs",
                          value: parseFloat(item2.prevision_inversiones_bs),
                        },
                      ],
                    })
                  : null;

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              funct ===
              "saldoAnt+incrementoRevTec+decrementoRevTec+altasBajas+Actualizacion"
            ) {
              let _operacionEntreColumnas = infoArchivo?.[
                "paramsSaldoAnt+incrementoRevTec+decrementoRevTec+altasBajas+Actualizacion"
              ]
                ? await operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: parseFloat(value),
                      pattern,
                    },
                    fields: [
                      {
                        key: "saldo_anterior",
                        value: parseFloat(item2.saldo_anterior),
                      },
                      "+",
                      {
                        key: "incremento_rev_tec",
                        value: parseFloat(item2.incremento_rev_tec),
                      },
                      "+",
                      {
                        key: "decremento_rev_tec",
                        value: parseFloat(item2.decremento_rev_tec),
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

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              funct ===
              "saldoAntDepAcum+bajasDepAcum+actualizacionDepAcum+depreciacionPeriodo"
            ) {
              let _operacionEntreColumnas = infoArchivo?.[
                "paramsSaldoAntDepAcum+bajasDepAcum+actualizacionDepAcum+depreciacionPeriodo"
              ]
                ? await operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: parseFloat(value),
                      pattern,
                    },
                    fields: [
                      {
                        key: "saldo_anterior",
                        value: parseFloat(item2.saldo_anterior),
                      },
                      "-",
                      {
                        key: "bajas_dep_acum",
                        value: parseFloat(item2.bajas_dep_acum),
                      },
                      "+",
                      {
                        key: "actualizacion_dep_acum",
                        value: parseFloat(item2.actualizacion_dep_acum),
                      },
                      "+",
                      {
                        key: "depreciacion_periodo",
                        value: parseFloat(item2.depreciacion_periodo),
                      },
                    ],
                  })
                : null;

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "saldoFinalMenosSaldoFinalDep") {
              // console.log("ITEM2", item2);
              let _operacionEntreColumnas =
                infoArchivo?.paramsSaldoFinalMenosSaldoFinalDep
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
                      },
                      fields: [
                        {
                          key: "saldo_final",
                          value: parseFloat(item2.saldo_final),
                        },
                        "-",
                        {
                          key: "saldo_final_dep_acum",
                          value: parseFloat(item2.saldo_final_dep_acum),
                        },
                      ],
                    })
                  : null;

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              itemFunction === "saldoFinalMesAnteriorBsMasMovimientoMesBs"
            ) {
              let _operacionEntreColumnas =
                infoArchivo?.paramsSaldoFinalMesAnteriorBsMasMovimientoMesBs
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
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

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              itemFunction === "depreciacionPeriodoMasAltasBajasDepreciacion"
            ) {
              let _operacionEntreColumnas =
                infoArchivo?.paramsDepreciacionPeriodoMasAltasBajasDepreciacion
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
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

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "cantidadCuotasMultiplicadoCuotaBs") {
              let _operacionEntreColumnas =
                infoArchivo?.paramsCantidadCuotasMultiplicadoCuotaBs
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
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

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              itemFunction === "cantidadValoresMultiplicadoPrecioNegociacion"
            ) {
              let _operacionEntreColumnas =
                infoArchivo?.paramsCantidadCuotasMultiplicadoCuotaBs
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
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

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              itemFunction === "cantidadMultiplicadoPrecioEquivalente"
            ) {
              let _operacionEntreColumnas =
                infoArchivo?.paramsCantidadMultiplicadoPrecioEquivalente
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
                      },
                      fields: [
                        {
                          key: "cantidad",
                          value: parseFloat(item2.cantidad),
                        },
                        "*",
                        {
                          key: "precio_equivalente",
                          value: parseFloat(item2.precio_equivalente),
                        },
                      ],
                    })
                  : null;

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              itemFunction === "precioMercadoMOMultiplicadoCantidadValores"
            ) {
              let _operacionEntreColumnas =
                infoArchivo?.paramsPrecioMercadoMOMultiplicadoCantidadValores
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
                      },
                      fields: [
                        {
                          key: "precio_mercado_mo",
                          value: parseFloat(item2.precio_mercado_mo),
                        },
                        "*",
                        {
                          key: "cantidad_valores",
                          value: parseFloat(item2.cantidad_valores),
                        },
                      ],
                    })
                  : null;

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (
              funct ===
              "saldoCapitalMultiplicadoPlazoCuponMultiplicadoInteresDividido36000"
            ) {
              let _operacionEntreColumnas =
                infoArchivo?.paramsPrecioMercadoMOMultiplicadoCantidadValores
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseFloat(value),
                        pattern,
                      },
                      fields: [
                        {
                          key: "saldo_capital",
                          value: parseFloat(item2.saldo_capital),
                        },
                        "*",
                        {
                          key: "plazo_cupon",
                          value: parseFloat(item2.plazo_cupon),
                        },
                        "*",
                        {
                          key: "interes",
                          value: parseFloat(item2.interes),
                        },
                      ],
                    })
                  : null;

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "cartera") {
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
                  descripcion: _cartera?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "nroPago") {
              let _nroPago = { ok: true, message: "" };
              if (infoArchivo?.paramsNroPago) {
                if (parseInt(item2.plazo_cupon) > 0) {
                  _nroPago = operacionEntreColumnas({
                    total: {
                      key: columnName,
                      value: parseFloat(value),
                    },
                    fields: [
                      {
                        key: "plazo_emision",
                        value: parseInt(item2.plazo_emision),
                      },
                      "/",
                      {
                        key: "plazo_cupon",
                        value: parseInt(item2.plazo_cupon),
                      },
                    ],
                  });
                } else if (
                  item2.plazo_cupon === 0 ||
                  item2.plazo_cupon === "0"
                ) {
                  if (item2.nro_pago !== "0") {
                    _nroPago.ok = false;
                    _nroPago.message =
                      "El campo plazo_cupon es igual a 0 por lo tanto el valor de nro_pago debe ser igual a 0";
                  }
                }
              }

              if (_nroPago?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _nroPago?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "plazoCupon") {
              const _plazoCupon = infoArchivo?.paramsPlazoCupon
                ? await plazoCupon({
                    nro_pago: parseInt(item2.nro_pago),
                    plazo_cupon: parseInt(item2.plazo_cupon),
                  })
                : null;

              if (_plazoCupon?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _plazoCupon?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "fechaVencimientoMenosFechaEmision") {
              let _operacionEntreColumnas =
                infoArchivo?.paramsFechaVencimientoMenosFechaEmision
                  ? await operacionEntreColumnas({
                      total: {
                        key: columnName,
                        value: parseInt(value),
                        pattern,
                      },
                      fields: [
                        {
                          key: "fecha_vencimiento (en dias)",
                          value: new Date(
                            item2.fecha_vencimiento?.slice(0, 4) +
                              "-" +
                              item2.fecha_vencimiento?.slice(4, 6) +
                              "-" +
                              item2.fecha_vencimiento?.slice(6)
                          ),
                        },
                        "-",
                        {
                          key: "fecha_emision (en dias)",
                          value: new Date(
                            item2.fecha_emision?.slice(0, 4) +
                              "-" +
                              item2.fecha_emision?.slice(4, 6) +
                              "-" +
                              item2.fecha_emision?.slice(6)
                          ),
                        },
                      ],
                      dates: true,
                    })
                  : null;
              // console.log(_operacionEntreColumnas);

              if (_operacionEntreColumnas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _operacionEntreColumnas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "ciudad") {
              let errFunction = true;
              map(_ciudad?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El campo no corresponde a ninguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "tipoBienInmueble") {
              let errFunction = true;
              map(_tipoBienInmueble?.resultFinal, (item4, index4) => {
                if (value === item4.sigla) {
                  errFunction = false;
                }
              });
              if (errFunction === true) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El campo no corresponde a ninguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "mayorAFechaEmision") {
              const _compararFechas = infoArchivo?.paramsMayorAFechaEmision
                ? await compararFechas({
                    date1: new Date(
                      !value.includes("-")
                        ? value?.slice(0, 4) +
                          "-" +
                          value?.slice(4, 6) +
                          "-" +
                          value?.slice(6)
                        : value
                    ),
                    operator: ">",
                    date2: new Date(
                      !item.fecha_emision.includes("-")
                        ? item.fecha_emision?.slice(0, 4) +
                          "-" +
                          item.fecha_emision?.slice(4, 6) +
                          "-" +
                          item.fecha_emision?.slice(6)
                        : item.fecha_emision
                    ),
                  })
                : null;

              if (_compararFechas?.ok === false) {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: _compararFechas?.message,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "totalVidaUtil") {
              let _igualA = null;
              let _rango = null;
              let functionAux = null;
              map(_totalVidaUtil?.resultFinal, (item4, index4) => {
                if (item2.tipo_bien_inmueble === item4.sigla) {
                  functionAux = 1;
                }
              });
              map(_totalVidaUtilDiferente?.resultFinal, (item4, index4) => {
                if (item2.tipo_bien_inmueble === item4.sigla) {
                  functionAux = 2;
                }
              });

              if (functionAux === 1) {
                _rango = rango({
                  value: parseInt(value),
                  valueTo: range?.[0],
                  valueFrom: range?.[1],
                });
                if (_rango?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion:
                      "Cuando tipo_bien_inmueble es EDI el Valor debe estar entre 0 y 480",
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else if (functionAux === 2) {
                _igualA = igualA({
                  value: value,
                  equalTo: 0,
                });
                if (_igualA?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion:
                      "Cuando tipo_bien_inmueble no es EDI el valor debe ser 0",
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El campo no corresponde a ninguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            } else if (itemFunction === "vidaUtilRestante") {
              let _igualA = null;
              let _rango = null;
              let functionAux = null;
              map(_vidaUtilRestante?.resultFinal, (item4, index4) => {
                if (item2.tipo_bien_inmueble === item4.sigla) {
                  functionAux = 1;
                }
              });
              map(_vidaUtilRestanteDiferente?.resultFinal, (item4, index4) => {
                if (item2.tipo_bien_inmueble === item4.sigla) {
                  functionAux = 2;
                }
              });

              if (functionAux === 1) {
                _rango = rango({
                  value: parseInt(value),
                  valueTo: range?.[0],
                  valueFrom: range?.[1],
                });
                if (_rango?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion:
                      "Cuando tipo_bien_inmueble es EDI el Valor debe estar entre 0 y 480",
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else if (functionAux === 2) {
                _igualA = igualA({
                  value: value,
                  equalTo: 0,
                });
                if (_igualA?.ok === false) {
                  errors.push({
                    archivo: item.archivo,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion:
                      "Cuando tipo_bien_inmueble no es EDI el valor debe ser 0",
                    valor: value,
                    columna: columnName,
                    fila: index2,
                  });
                }
              } else {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: `El campo no corresponde a ninguno de los autorizados`,
                  valor: value,
                  columna: columnName,
                  fila: index2,
                });
              }
            }
          }

          if (
            operationNotValid === "cadenaCombinadalugarNegTipoOperTipoInstrum"
          ) {
            // console.log(operationNotValid);
            let errFunction = true;
            const siglaCombinada = `${item2.lugar_negociacion}${item2.tipo_operacion}${item2.tipo_instrumento}`;
            // console.log(_cadenaCombinadalugarNegTipoOperTipoInstrum);
            map(
              _cadenaCombinadalugarNegTipoOperTipoInstrum?.resultFinal,
              (item4, index4) => {
                if (siglaCombinada === item4.siglacombinada) {
                  errFunction = false;
                }
              }
            );
            if (errFunction === true) {
              errors.push({
                archivo: item.archivo,
                tipo_error: "VALOR INCORRECTO OPERACION NO VALIDA",
                descripcion: `La operacion no es válida`,
                valor: siglaCombinada,
                columna: `lugar_negociacion, tipo_operacion, tipo_instrumento`,
                fila: index2,
              });
            }
          }
          if (unique === true && index2 === arrayDataObject?.length - 1) {
            const _unico = infoArchivo.paramsUnico
              ? await unico({
                  fileArrayObject: arrayDataObject,
                  field: {
                    value,
                    key: columnName,
                  },
                })
              : null;

            // console.log(_unico);

            if (_unico?.length >= 1) {
              map(_unico, (item4, index4) => {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: item4?.message,
                  valor: item4?.value,
                  columna: columnName,
                  fila: item4?.row,
                });
              });
            }
          }
          if (
            !isNull(uniqueBy) &&
            !isEmpty(uniqueBy) &&
            index2 === arrayDataObject?.length - 1
          ) {
            const _unicoPor = await unicoPor({
              fileArrayObject: arrayDataObject,
              field: columnName,
              validatedBy: uniqueBy,
            });

            if (size(_unicoPor) >= 1) {
              forEach(_unicoPor, (errorUnicoPor) => {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: errorUnicoPor?.message,
                  valor: errorUnicoPor?.value,
                  columna: columnName,
                  fila: errorUnicoPor?.row,
                });
              });
            }
          }
          if (
            endSingleGroup === true &&
            index2 === arrayDataObject?.length - 1
          ) {
            const _singleGroup = infoArchivo.paramsSingleGroup
              ? await grupoUnico({
                  fileArrayValidateObject: arrayValidateObject,
                  fileArrayObject: arrayDataObject,
                  codeCurrentFile,
                })
              : null;

            // console.log(_unico);

            if (_singleGroup?.length >= 1) {
              map(_singleGroup, (item4, index4) => {
                errors.push({
                  archivo: item.archivo,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: item4?.message,
                  valor: item4?.value,
                  columna: item4?.column,
                  fila: item4?.row,
                });
              });
            }
          }

          //! grouping sin USAR E INCOMPLETO
          if (
            grouping === true &&
            groupingAux === false &&
            index2 === arrayDataObject?.length - 1
          ) {
            // console.log("TEST");
            const _grouping = infoArchivo?.paramsGrouping
              ? agrupacion({
                  fileArrayValidateObject: arrayValidateObject,
                  fileArrayObject: arrayDataObject,
                })
              : null;
            groupingAux = true;
          }
        } catch (err) {
          errors.push({
            archivo: item.archivo,
            tipo_error: "VALOR INCORRECTO",
            descripcion: `Error inesperado. ${err.message}`,
            valor: value,
            columna: columnName,
            fila: index2,
          });
        }
      };

      if (
        codeCurrentFile === "TD" ||
        codeCurrentFile === "TO" ||
        codeCurrentFile === "UD" ||
        codeCurrentFile === "CO"
      ) {
        dependenciesArrayEmptys.push({
          code: codeCurrentFile,
          file: item.archivo,
          empty: size(arrayDataObject) === 0 ? true : false,
        });
      }
      if (
        indexMainFiles === size(isAllFiles.currentFiles) - 1 &&
        size(dependenciesArrayEmptys) !== 0
      ) {
        // console.log(dependenciesArrayEmptys);
        const auxEmpty = {
          TD: find(
            dependenciesArrayEmptys,
            (itemFind) => itemFind.code === "TD"
          ),
          TO: find(
            dependenciesArrayEmptys,
            (itemFind) => itemFind.code === "TO"
          ),
          UD: find(
            dependenciesArrayEmptys,
            (itemFind) => itemFind.code === "UD"
          ),
          CO: find(
            dependenciesArrayEmptys,
            (itemFind) => itemFind.code === "CO"
          ),
        };
        forEach(dependenciesArrayEmptys, (itemDAE) => {
          const errorAux = (code1, file1, code2, file2) => {
            errors.push({
              archivo: file2,
              tipo_error: `ERROR DE CONTENIDO de ${code1} a ${code2}`,
              descripcion: `El Archivo ${code1} (${file1}) esta vacío o sin información por lo tanto el archivo ${code2} (${file2}) tambien debe estar vacío o sin información`,
              valor: `VACIO`,
              columna: "",
              fila: -1,
            });
          };
          if (itemDAE.code === "TD") {
            if (itemDAE.empty === true && auxEmpty.UD.empty === false) {
              errorAux(
                itemDAE.code,
                itemDAE.file,
                auxEmpty.UD.code,
                auxEmpty.UD.file
              );
            }
          } else if (itemDAE.code === "TO") {
            if (itemDAE.empty === true && auxEmpty.CO.empty === false) {
              errorAux(
                itemDAE.code,
                itemDAE.file,
                auxEmpty.CO.code,
                auxEmpty.CO.file
              );
            }
          }
        });
      }
      if (codeCurrentFile === "444" && arrayDataObject?.length === 0) {
        map(dependenciesArray, (itemDP, indexDP) => {
          if (itemDP.column === "nro_pago" && itemDP.code === "441") {
            errors.push({
              archivo: item.archivo,
              tipo_error: "ERROR DE CONTENIDO de 441 a 444",
              descripcion: `El Archivo 444 esta vacío o sin información en el cual tiene que tener informacion debido a que en el archivo 441 existe cupones.`,
              valor: `VACIO`,
              columna: "",
              fila: -1,
            });
          }
        });
      }
      console.log(
        "ARCHIVO:",
        codeCurrentFile,
        "FILAS:",
        arrayDataObject?.length
      );

      for (let index2 = 0; index2 < arrayDataObject.length; index2++) {
        const item2 = arrayDataObject[index2];
        // console.log("codeCurrentFile", codeCurrentFile);
        map(arrayValidateObject, async (item3, index3) => {
          let value = item2[item3.columnName];
          let columnName = item3.columnName;
          let pattern = item3.pattern;
          let date = item3?.date === true ? item3.date : null;
          let mayBeEmpty =
            item3?.mayBeEmpty === true || item3?.mayBeEmpty === false
              ? item3.mayBeEmpty
              : null;
          let operationNotValid =
            item3?.operationNotValid?.length >= 1 ||
            item3?.operationNotValid !== ""
              ? item3.operationNotValid
              : null;
          let funct = item3.function;
          let typeError =
            item3?.typeError ||
            item3?.typeError?.length >= 1 ||
            item3?.typeError !== ""
              ? item.typeError
              : null;

          let notValidate =
            item3?.notValidate === true ? item3.notValidate : null;
          let unique = item3?.unique === true ? item3.unique : null;
          let uniqueBy = item3?.uniqueBy ? item3.uniqueBy : null;
          let singleGroup =
            item3?.singleGroup === true ? item3.singleGroup : null;
          let endSingleGroup =
            item3?.endSingleGroup === true ? item3.endSingleGroup : null;

          let grouping = item3?.grouping === true ? item3.grouping : null;
          let messageError = isUndefined(item3?.messageError)
            ? undefined
            : item3?.messageError;
          if (!value && (mayBeEmpty === false || mayBeEmpty === null)) {
            errors.push({
              archivo: item.archivo,
              tipo_error: "VALOR EN NULO O VACIO",
              descripcion: `El campo no debe estar vacío`,
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
              date,
              funct,
              mayBeEmpty,
              operationNotValid,
              notValidate,
              unique,
              uniqueBy,
              singleGroup,
              endSingleGroup,
              grouping,
              messageError,
              typeError,
              item2,
              index2,
              item3,
              codeCurrentFile,
              arrayDataObject,
              arrayValidateObject,
              index3
            );
          }
        });
      }

      resolve();
    }
  );
  return validacionesCamposArchivosFragmentoCodigoPromise;
}

exports.validarArchivo = async (req, res, next) => {
  const fechaInicialOperacion = req?.body?.fecha_operacion;
  const tipo_periodo = req?.body?.tipo_periodo;
  const fecha_entrega = req?.body?.fecha_entrega;

  try {
    const id_rol = req.user.id_rol;
    const id_usuario = req.user.id_usuario;
    const fechaOperacion = fechaInicialOperacion
      ? fechaInicialOperacion.split("-").join("")
      : moment().format("YYYYMMDD");

    const paramsQueryAux = {
      select: ["codigo, sigla, id_rol, id_usuario"],
      where: [
        { key: "id_usuario", value: id_usuario },
        { key: "id_rol", value: id_rol },
      ],
    };
    const codigosSeguros = await EjecutarQuery(
      EscogerInternoUtil("aps_view_modalidad_seguros", paramsQueryAux)
    );
    const codigosPensiones = await EjecutarQuery(
      EscogerInternoUtil("aps_view_modalidad_pensiones", paramsQueryAux)
    );

    let infoTables = await seleccionarTablas({
      files: req.files,
      codigosSeguros,
      codigosPensiones,
    });

    const permiso = await VerificarPermisoTablaUsuarioAuditoria({
      table: infoTables.table,
      action: "Insertar",
      req,
      res,
    });
    if (permiso.ok === false) {
      respUsuarioNoAutorizado200END(
        res,
        null,
        (action = "Insertar"),
        infoTables.table
      );
      return;
    }

    if (infoTables.code === null && infoTables.table === null) {
      respErrorServidor500END(res, {
        type: "NAME TABLE",
        message: `Hubo un error al obtener los nombres de la tablas en las que el servidor trabajará, usuario con ID: "${id_usuario}" y ID_ROL: ${id_rol}`,
      });
      return;
    }

    nameTable = infoTables.table;
    nameTableErrors = infoTables.tableErrors;
    codeCurrentFile = infoTables.code;

    const nroCargaPromise = new Promise(async (resolve, reject) => {
      let result = 1;
      let nroCarga = 1;
      const whereAux = [
        { key: "id_rol", value: id_rol },
        { key: "fecha_operacion", value: fechaInicialOperacion },
        { key: "id_usuario", value: id_usuario },
      ];
      if (nameTable === "APS_aud_carga_archivos_pensiones_seguros") {
        whereAux.push({
          key: "id_periodo",
          value: tipo_periodo === "M" ? 155 : 154,
        });
      }
      queryNroCarga = EscogerInternoUtil(nameTable, {
        select: ["*"],
        where: whereAux,
      });

      await pool
        .query(queryNroCarga)
        .then((resultNroCarga) => {
          result = maxBy(resultNroCarga.rows, "nro_carga")?.nro_carga || 0;
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
        return undefined;
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
          process.env.TZ = "America/La_Paz";
          const whereBodyQuery = {
            id_rol,
            fecha_operacion: fechaInicialOperacion,
            nro_carga: isUndefined(nroCarga) ? 1 : nroCarga + 1,
            fecha_carga: new Date(),
            id_usuario,
            cargado: false,
          };
          if (nroCarga?.reprocesado) whereBodyQuery["reprocesado"] = false;

          if (nroCarga?.reproceso)
            whereBodyQuery["reproceso"] =
              req.body.reproceso === true || req.body.reproceso === "true"
                ? true
                : false;

          bodyQuery.push(whereBodyQuery);
          if (fecha_entrega) {
            bodyQuery[0].fecha_entrega = fecha_entrega;
          }
          if (size(codigosPensiones) > 0 || size(codigosSeguros) > 0) {
            bodyQuery[0].cod_institucion = infoTables.code;
            if (tipo_periodo === "D") {
              bodyQuery[0].id_periodo = 154;
            } else if (tipo_periodo === "M") {
              bodyQuery[0].id_periodo = 155;
            }
          }
          // console.log(bodyQuery);
          queryFiles = InsertarVariosUtil(nameTable, {
            body: bodyQuery,
            returnValue: ["id_carga_archivos"],
          });
          // console.log(queryFiles);
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
              console.log("ERR CARGA", err);
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
                          ? includes(item?.valor, "'")
                            ? replace(item.valor, /\'/g, "''")
                            : item.valor
                          : "",
                      fila: item.hasOwnProperty("fila")
                        ? parseInt(item.fila) + 1
                        : 0,
                      columna: item.hasOwnProperty("columna")
                        ? item.columna
                        : 0,
                    });
                  });
                  // console.log(errors);

                  // console.log(nameTableErrors);

                  queryFiles = InsertarVariosUtil(nameTableErrors, {
                    body: bodyQuery,
                    returnValue: ["id_error_archivo"],
                  });
                  // console.log("queryFiles", queryFiles);

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
                      console.log("ERR CARGA ERRORES", err);
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
                  console.log("ERR", err);
                  respErrorServidor500END(
                    res,
                    err,
                    "Ocurrió un error inesperado."
                  );
                })
                .finally(() => {
                  respArchivoErroneo200(res, errors, response.resultsPromise);
                });
            } else {
              // console.log("PASE");
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
          .catch((err) => {
            console.log({ err, errorsCode });
            respErrorServidor500END(res, errorsCode);
            return;
          });
      })
      .catch((err) => {
        console.log("ERR1", err);
        respErrorServidor500END(res, { err, errorsCode });
      });
  } catch (err) {
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
  dependenciesArray = [];
  dependenciesArrayEmptys = [];

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
    if (err instanceof multer.MulterError) respErrorMulter500(res, err);
    else if (err) {
      if (err.name == "ExtensionError") respErrorExtensionError403(res, err);
      else respErrorServidor500END(res, err);
    } else {
      let filesUploaded = req?.files;
      if (!filesUploaded || filesUploaded?.length === 0) {
        respDatosNoRecibidos400(
          res,
          "No se encontro ningún archivo para subir."
        );
      } else next();
    }
  });
};
