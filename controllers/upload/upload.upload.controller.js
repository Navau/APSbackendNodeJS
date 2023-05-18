const {
  map,
  partial,
  split,
  forEach,
  uniq,
  size,
  replace,
  isUndefined,
  minBy,
  find,
} = require("lodash");
const {
  ListarCRUD,
  BuscarCRUD,
  EscogerCRUD,
  InsertarCRUD,
  ActualizarCRUD,
} = require("../../utils/crud.utils");

const pool = require("../../database");
const fs = require("fs");

const { formatoArchivo } = require("../../utils/formatoCamposArchivos.utils");

const {
  ListarUtil,
  BuscarUtil,
  EscogerUtil,
  InsertarUtil,
  ActualizarUtil,
  ValidarIDActualizarUtil,
  ValorMaximoDeCampoUtil,
  CargarArchivoABaseDeDatosUtil,
  EliminarUtil,
  ResetearIDUtil,
  InsertarVariosUtil,
  ObtenerUltimoRegistro,
  EliminarMultiplesTablasUtil,
  AlterarSequenciaMultiplesTablasUtil,
  ValorMaximoDeCampoMultiplesTablasUtil,
  EscogerInternoUtil,
  AlterarSequenciaUtil,
  EjecutarFuncionSQL,
  EjecutarVariosQuerys,
} = require("../../utils/consulta.utils");

const {
  respArchivoErroneo415,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
  respArchivoErroneo200,
} = require("../../utils/respuesta.utils");
const dayjs = require("dayjs");

var nameTable = "APS_aud_carga_archivos_bolsa";

async function CargarArchivo(req, res) {
  try {
    const fechaInicialOperacion = req?.body?.fecha_operacion;
    const id_rol = req.user.id_rol;
    const id_usuario = req.user.id_usuario;
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
    const filesReaded = req.filesReaded;
    // console.log(filesReaded);
    // const filesUploadedBD = req.filesUploadedBD;
    const previousResults = req.results;
    const previousErrors = req.errors;
    const returnsValues = req.returnsValues;
    const idCargaArchivos = returnsValues[0].id_carga_archivos;
    let cargaBolsaActual = null;
    const resultFinal = [];
    const tablesFilesArray = [];
    const sequencesTablesFilesArray = [];
    const idTablesFilesArray = [];
    const errorsDateArray = [];
    let bodyFinalQuery = [];
    const filesSort = req.files.sort((a, b) => {
      if (a.originalname.toLowerCase() < b.originalname.toLowerCase()) {
        return -1;
      }
      if (a.originalname.toLowerCase() > b.originalname.toLowerCase()) {
        return 1;
      }
      return 0;
    }); // ORDENANDO LOS ARCHIVOS PARA ITERAR CON LA VARIABLE filesReaded

    // const filesSort = req.files;
    // console.log("filesReaded", filesReaded);
    // console.log("filesUploadedBD", filesUploadedBD);
    // console.log("previousResults", previousResults);
    // console.log("previousErrors", previousErrors);
    // console.log("returnsValues", returnsValues);
    let infoTables = {
      code: null,
      cod_institution: null,
      table: null,
      tableErrors: null,
    };

    forEach(filesSort, (item, index) => {
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
        infoTables = {
          code: codPensionesSeguros,
          cod_institution: codPensionesSeguros,
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
        infoTables = {
          code: "M",
          cod_institution: "bolsa",
          table: "APS_aud_carga_archivos_bolsa",
          tableErrors: "APS_aud_errores_carga_archivos_bolsa",
        };
      } else if (nameFile.includes(".CC")) {
        const stringAux = item.originalname.toUpperCase();
        const fechaAux = split(fechaInicialOperacion, "-").join("");
        const codFinal = (string, split) => {
          const splitString = string.split(split);
          return splitString[0];
        };
        infoTables = {
          code: "CC",
          cod_institution: codFinal(stringAux, fechaAux),
          table: "APS_aud_carga_archivos_custodio",
          tableErrors: "APS_aud_errores_carga_archivos_custodio",
        };
      } else if (nameFile.includes("CC")) {
        const fechaAux = split(fechaInicialOperacion, "-").join("");
        const fileSplitFecha = item.originalname
          .toUpperCase()
          .substring(0, item.originalname.toUpperCase().indexOf(fechaAux));
        const codFinal = (stringAux) => {
          const splitString = stringAux.split("CC");
          return splitString[1] === "" ? splitString[0] : splitString[1];
        };
        infoTables = {
          code: "CC",
          cod_institution: codFinal(fileSplitFecha),
          table: "APS_aud_carga_archivos_custodio",
          tableErrors: "APS_aud_errores_carga_archivos_custodio",
        };
      }
    });

    if (infoTables.cod_institution === "bolsa") {
      cargaBolsaActual = await pool
        .query(
          EscogerInternoUtil(nameTable, {
            select: ["*"],
            where: [{ key: "id_carga_archivos", value: idCargaArchivos }],
          })
        )
        .then((result) => {
          if (result.rowCount > 0)
            return { ok: true, result: result.rows?.[0] };
          else return { ok: false, result: result.rows?.[0] };
        })
        .catch((err) => {
          return { ok: null, err };
        });
      if (cargaBolsaActual.ok === null) throw cargaBolsaActual.err;
      if (cargaBolsaActual.ok === false)
        throw new Error(`No existe el registro con el id ${idCargaArchivos}`);
    }

    const uploadPromise = new Promise(async (resolve, reject) => {
      let errors = [];
      for (let index = 0; index < filesSort.length; index++) {
        try {
          const item = filesSort[index];
          const arrayDataObject = [];
          const filePath =
            __dirname.substring(0, __dirname.indexOf("controllers")) +
            item.path;
          //#region SEPARAR LOS CAMPOS DEL ARCHIVO QUE ESTA DIVIDO EN FILAS
          // console.log(filesReaded);
          // SE ORDENAN PRIMERO LOS ARCHIVOS ANTES DE ITERAR CON FILES READED
          map(filesReaded[index], (item2, index2) => {
            for (let i = 0; i < item2.length; i++) {
              if (item2.charCodeAt(i) === 65279) {
                item2 = item2.replace(item2.slice(i, 1), "");
              }
            }
            const rowWithoutQuotationMarks = item2.slice(1, item2.length - 1);
            const rowSplit = rowWithoutQuotationMarks.split('","');
            let resultObject = [];
            map(rowSplit, (item3, index3) => {
              resultObject = [...resultObject, `"${item3}"`];
            });
            if (item2 !== "") {
              arrayDataObject.push(resultObject);
            }
          });
          // console.log({ arrayDataObject, file: filesReaded[index] });
          //#endregion

          let headers = null;
          let detailsHeaders = null;
          let codeFile = null;
          let tableFile = null;
          let sequenceTableFile = null;
          let idTable = null;
          let dateField = null;
          let institutionField = null;
          let typeInstrumentField = null;
          let serieField = null;

          //#region SELECCION DE CODIGO DE ARCHIVO Y TABLA DE ARCHIVO
          if (item.originalname.includes("K.")) {
            codeFile = "K";
            tableFile = "APS_oper_archivo_k";
          } else if (item.originalname.includes("L.")) {
            codeFile = "L";
            tableFile = "APS_oper_archivo_l";
          } else if (item.originalname.includes("N.")) {
            codeFile = "N";
            tableFile = "APS_oper_archivo_n";
          } else if (item.originalname.includes("P.")) {
            codeFile = "P";
            tableFile = "APS_oper_archivo_p";
          } else if (item.originalname.includes(".411")) {
            codeFile = "411";
            tableFile = "APS_seguro_archivo_411";
          } else if (item.originalname.includes(".412")) {
            codeFile = "412";
            tableFile = "APS_seguro_archivo_412";
          } else if (item.originalname.includes(".413")) {
            codeFile = "413";
            tableFile = "APS_seguro_archivo_413";
          } else if (item.originalname.includes(".441")) {
            codeFile = "441";
            tableFile = "APS_seguro_archivo_441";
          } else if (item.originalname.includes(".442")) {
            codeFile = "442";
            tableFile = "APS_seguro_archivo_442";
          } else if (item.originalname.includes(".443")) {
            codeFile = "443";
            tableFile = "APS_seguro_archivo_443";
          } else if (item.originalname.includes(".444")) {
            codeFile = "444";
            tableFile = "APS_seguro_archivo_444";
          } else if (item.originalname.includes(".445")) {
            codeFile = "445";
            tableFile = "APS_seguro_archivo_445";
          } else if (item.originalname.includes(".451")) {
            codeFile = "451";
            tableFile = "APS_seguro_archivo_451";
          } else if (item.originalname.includes(".481")) {
            codeFile = "481";
            tableFile = "APS_seguro_archivo_481";
          } else if (item.originalname.includes(".482")) {
            codeFile = "482";
            tableFile = "APS_seguro_archivo_482";
          } else if (item.originalname.includes(".483")) {
            codeFile = "483";
            tableFile = "APS_seguro_archivo_483";
          } else if (item.originalname.includes(".484")) {
            codeFile = "484";
            tableFile = "APS_seguro_archivo_484";
          } else if (item.originalname.includes(".485")) {
            codeFile = "485";
            tableFile = "APS_seguro_archivo_485";
          } else if (item.originalname.includes(".486")) {
            codeFile = "486";
            tableFile = "APS_seguro_archivo_486";
          } else if (item.originalname.includes(".461")) {
            codeFile = "461";
            tableFile = "APS_seguro_archivo_461";
          } else if (item.originalname.includes(".471")) {
            codeFile = "471";
            tableFile = "APS_seguro_archivo_471";
          } else if (item.originalname.includes(".491")) {
            codeFile = "491";
            tableFile = "APS_seguro_archivo_491";
          } else if (item.originalname.includes(".492")) {
            codeFile = "492";
            tableFile = "APS_seguro_archivo_492";
          } else if (item.originalname.includes(".494")) {
            codeFile = "494";
            tableFile = "APS_seguro_archivo_494";
          } else if (item.originalname.includes(".496")) {
            codeFile = "496";
            tableFile = "APS_seguro_archivo_496";
          } else if (item.originalname.includes(".497")) {
            codeFile = "497";
            tableFile = "APS_seguro_archivo_497";
          } else if (item.originalname.includes(".498")) {
            codeFile = "498";
            tableFile = "APS_seguro_archivo_498";
          } else if (item.originalname.includes("DM")) {
            codeFile = "DM";
            tableFile = "APS_pensiones_archivo_DM";
          } else if (item.originalname.includes("DR")) {
            codeFile = "DR";
            tableFile = "APS_pensiones_archivo_DR";
          } else if (item.originalname.includes("UA")) {
            codeFile = "UA";
            tableFile = "APS_pensiones_archivo_UA";
          } else if (item.originalname.includes("UE")) {
            codeFile = "UE";
            tableFile = "APS_pensiones_archivo_UE";
          } else if (item.originalname.includes("TD")) {
            codeFile = "TD";
            tableFile = "APS_pensiones_archivo_TD";
          } else if (item.originalname.includes("DU")) {
            codeFile = "DU";
            tableFile = "APS_pensiones_archivo_DU";
          } else if (item.originalname.includes("UD")) {
            codeFile = "UD";
            tableFile = "APS_pensiones_archivo_UD";
          } else if (item.originalname.includes("TO")) {
            codeFile = "TO";
            tableFile = "APS_pensiones_archivo_TO";
          } else if (item.originalname.includes("CO")) {
            codeFile = "CO";
            tableFile = "APS_pensiones_archivo_CO";
          } else if (item.originalname.includes("TV")) {
            codeFile = "TV";
            tableFile = "APS_pensiones_archivo_TV";
          } else if (item.originalname.includes("DC")) {
            codeFile = "DC";
            tableFile = "APS_pensiones_archivo_DC";
          } else if (item.originalname.includes("DO")) {
            codeFile = "DO";
            tableFile = "APS_pensiones_archivo_DO";
          } else if (item.originalname.includes("BG")) {
            codeFile = "BG";
            tableFile = "APS_pensiones_archivo_BG";
          } else if (item.originalname.includes("FE")) {
            codeFile = "FE";
            tableFile = "APS_pensiones_archivo_FE";
          } else if (item.originalname.includes("VC")) {
            codeFile = "VC";
            tableFile = "APS_pensiones_archivo_VC";
          } else if (item.originalname.includes("CD")) {
            codeFile = "CD";
            tableFile = "APS_pensiones_archivo_CD";
          } else if (item.originalname.includes("DE")) {
            codeFile = "DE";
            tableFile = "APS_pensiones_archivo_DE";
          } else if (item.originalname.includes("LQ")) {
            codeFile = "LQ";
            tableFile = "APS_pensiones_archivo_LQ";
          } else if (item.originalname.includes("TR")) {
            codeFile = "TR";
            tableFile = "APS_pensiones_archivo_TR";
          } else if (
            item.originalname.includes("CC") &&
            infoTables.code === "CC"
          ) {
            codeFile = "CC";
            tableFile = "APS_oper_archivo_Custodio";
          } else if (item.originalname.includes("FC")) {
            codeFile = "FC";
            tableFile = "APS_pensiones_archivo_FC";
          }
          const columnsHeaders = await formatoArchivo(codeFile);
          detailsHeaders = await columnsHeaders.detailsHeaders;
          headers = await columnsHeaders.headers;
          idTable = headers[0];
          sequenceTableFile = {
            table: tableFile,
            id: idTable,
          };

          const codInstitucionAux = infoTables.cod_institution;
          // console.log({ codInstitucionAux });
          //#endregion

          headers?.splice(0, 1); // ELIMINAR ID DE TABLA

          tablesFilesArray.push(tableFile);
          sequencesTablesFilesArray.push({
            table: tableFile,
            id: idTable,
          });
          idTablesFilesArray.push(idTable);

          const valuesWhereInAux = [
            `fecha_operacion`,
            `fecha`,
            `fecha_informacion`,
            `cod_institucion`,
          ];

          if (infoTables.cod_institution === "CC") {
            valuesWhereInAux.push(`tipo_instrumento`);
            valuesWhereInAux.push(`serie`);
          }

          const queryInfoSchema = EscogerInternoUtil(
            "INFORMATION_SCHEMA.COLUMNS",
            {
              select: ["*"],
              where: [
                {
                  key: "COLUMN_NAME",
                  valuesWhereIn: valuesWhereInAux,
                  whereIn: true,
                },
                {
                  key: "TABLE_NAME",
                  value: tableFile,
                },
              ],
              orderby: {
                field: "COLUMN_NAME",
              },
            }
          );
          await pool
            .query(queryInfoSchema)
            .then((result) => {
              if (result.rowCount > 0) {
                map(result.rows, (itemResult, indexResult) => {
                  if (itemResult.column_name === "cod_institucion") {
                    institutionField = itemResult.column_name;
                  }
                  if (
                    itemResult.column_name === "tipo_instrumento" &&
                    infoTables.cod_institution === "CC"
                  ) {
                    typeInstrumentField = itemResult.column_name;
                  }
                  if (
                    itemResult.column_name === "serie" &&
                    infoTables.cod_institution === "CC"
                  ) {
                    serieField = itemResult.column_name;
                  }
                  if (itemResult.column_name.includes("fecha")) {
                    dateField = itemResult.column_name;
                  }
                });
              } else {
                errorsDateArray.push({
                  message: `No existe ningun campo que contenga 'fecha' en la tabla ${tableFile}.`,
                });
              }
            })
            .catch((err) => {
              console.log("ERR INFORMATION_SCHEMA.COLUMNS", err);
              errorsDateArray.push({
                message: `Ocurrio un error inesperado. ERROR: ${err.message}`,
              });
            });

          if (
            codeFile === "K" ||
            codeFile === "L" ||
            codeFile === "N" ||
            codeFile === "P"
          ) {
            if (!dateField) {
              errorsDateArray.push({
                message: `No existe el campo fecha para poder validar unicidad en la tabla ${tableFile}.`,
              });
            } else {
              const whereDelete = [
                {
                  key: dateField,
                  value: fechaInicialOperacion,
                },
              ];
              await eliminarInformacionDuplicada(
                tableFile,
                whereDelete,
                sequenceTableFile,
                idTable
              );
            }
          } else {
            if (infoTables.cod_institution === "CC") {
              if (
                !dateField ||
                !institutionField ||
                !typeInstrumentField ||
                !serieField
              ) {
                errorsDateArray.push({
                  message: `No existe el campo cod_institucion, fecha, tipo_instrumento y serie para poder validar unicidad en la tabla ${tableFile}.`,
                });
              } else {
                const typeInstrumentsValuesAux = [];
                const seriesValuesAux = [];
                forEach(arrayDataObject, (itemAux) => {
                  forEach(itemAux, (itemAux2, indexAux2) => {
                    if (indexAux2 === 0) {
                      typeInstrumentsValuesAux.push(itemAux2);
                    } else if (indexAux2 === 1) {
                      seriesValuesAux.push(itemAux2);
                    }
                  });
                });
                const seriesUniqs = map(uniq(seriesValuesAux), (itemAux) =>
                  replace(itemAux, /\"/g, `'`)
                );
                const typeInstrumentsUniqs = map(
                  uniq(typeInstrumentsValuesAux),
                  (itemAux) => replace(itemAux, /\"/g, `'`)
                );
                const whereDelete = [
                  {
                    key: dateField,
                    value: fechaInicialOperacion,
                  },
                  {
                    key: institutionField,
                    value: codInstitucionAux,
                  },
                  size(seriesUniqs) > 0 && {
                    key: serieField,
                    valuesWhereIn: seriesUniqs,
                    whereIn: true,
                  },
                  size(seriesUniqs) > 0 && {
                    key: typeInstrumentField,
                    valuesWhereIn: typeInstrumentsUniqs,
                    whereIn: true,
                  },
                ];
                await eliminarInformacionDuplicada(
                  tableFile,
                  whereDelete,
                  sequenceTableFile,
                  idTable
                );
              }
            } else {
              if (!dateField || !institutionField) {
                errorsDateArray.push({
                  message: `No existe el campo cod_institucion y fecha para poder validar unicidad en la tabla ${tableFile}.`,
                });
              } else {
                const whereDelete = [
                  {
                    key: dateField,
                    value: fechaInicialOperacion,
                  },
                  {
                    key: institutionField,
                    value: codInstitucionAux,
                  },
                ];
                await eliminarInformacionDuplicada(
                  tableFile,
                  whereDelete,
                  sequenceTableFile,
                  idTable
                );
              }
            }
          }

          if (errorsDateArray.length >= 1) {
            if (index === req.files.length - 1) {
              resolve({ errorsDateArray });
            }
          }

          //#region INSERTAR EL ID DE CARGA ARCHIVOS, COD_INSTITUCION, FECHA_INFORMACION A CADA FILA SEPARADA
          // console.log("arrayDataObject", arrayDataObject);
          const newArrayDataObject = [];
          // ["id_carga_archivos", "cod_institucion", "fecha_informacion"]
          // console.log("ANTIGUO", headers);
          // console.log(headers.includes("id_carga_archivos"));

          let stringFinalFile = "";
          let arrayHeadersAux = [];
          // console.log({
          //   headers,
          //   idCargaArchivos,
          //   codInstitucionAux,
          //   fechaInicialOperacion,
          // });
          if (headers.includes("id_carga_archivos")) {
            stringFinalFile += `"${idCargaArchivos}"`;
            arrayHeadersAux.push("id_carga_archivos");
          }
          if (headers.includes("cod_institucion")) {
            stringFinalFile += `,"${codInstitucionAux}"`;
            arrayHeadersAux.push("cod_institucion");
          }
          if (headers.includes("fecha_informacion")) {
            stringFinalFile += `,"${fechaInicialOperacion}"`;
            arrayHeadersAux.push("fecha_informacion");
          }
          //#region ELIMINANDO LOS CAMPOS DE ID_CARGA_ARCHIVOS, COD_INSTITUCION Y FECHA INFORMACION PARA VOLVER A PONERLOS PERO AL FINAL DEL ARRAY HEADERS
          stringFinalFile += `\r\n`;
          map(arrayHeadersAux, (item2, index2) => {
            let myIndex = headers.indexOf(item2);
            if (myIndex !== -1) {
              headers.splice(myIndex, 1);
            }
          });
          map(arrayHeadersAux, (item2, index2) => {
            headers.push(item2);
          });
          // console.log("NUEVO", headers);
          //#endregion

          // console.log("stringFinalFile", stringFinalFile);
          map(arrayDataObject, (item2, index2) => {
            newArrayDataObject.push([...item2, ...stringFinalFile.split(",")]);
          });
          // console.log("arrayDataObject", arrayDataObject);
          //#endregion

          //#region INSERTANDO LA INFORMACION FORMATEADA A LA RUTA DE UPLOADS/TMP/ARCHIVO JUNTO CON EL ID DE CARGA DE ARCHIVOS
          const dataFile = newArrayDataObject.join("");
          const filePathWrite = `./uploads/tmp/${item.originalname}`;
          fs.writeFileSync(filePathWrite, dataFile);
          //#endregion
          // console.log({ headers, codeFile, item: item.originalname });

          //#region Formateando informacion de archivo para insertar por medio de un INSERT QUERY
          let finalData = [];
          let partialData = [];
          // console.log({ newArrayDataObject });
          map(newArrayDataObject, (itemV1, indexV1) => {
            let dataObject = Object.assign({}, itemV1);
            partialData.push(dataObject);
          });
          // if (codeFile === "491") {
          // console.log({ partialData, length: partialData.length });
          //   console.log(headers, headers.length);
          // }
          let partialHeaders = headers;
          forEach(partialData, (itemV1, indexV1) => {
            let x = {};
            forEach(itemV1, (itemV2, indexV2) => {
              let valueAux = itemV2;
              x = {
                ...x,
                [partialHeaders[indexV2]]: valueAux
                  ?.trim()
                  .replace(/['"]+/g, ""),
              };
            });
            finalData.push(x);
          });
          //#endregion
          // console.log({ finalData, headers });

          map([finalData], (itemBPQ, indexBPQ) => {
            bodyFinalQuery = bodyFinalQuery.concat(itemBPQ);
          });
          // console.log(bodyFinalQuery);

          let queryFiles = "";

          if (bodyFinalQuery.length >= 1) {
            const codeFileAux = codeFile.toLowerCase();
            queryFiles = InsertarVariosUtil(tableFile, {
              body: bodyFinalQuery,
              returnValue: [
                `id_archivo_${codeFileAux === "cc" ? "custodio" : codeFileAux}`,
              ],
            });
          }
          // console.log(queryFiles);

          bodyFinalQuery = [];

          await pool
            .query(queryFiles)
            .then((resultFile) => {
              resultFinal.push({
                message: `El archivo fue insertado correctamente a la tabla '${tableFile}'`,
                result: {
                  rowsUpdate: resultFile.rows,
                  rowCount: resultFile.rowCount,
                },
              });
            })
            .catch((err) => {
              console.log(err);
              errors.push({
                type: "QUERY SQL ERROR",
                message: `Hubo un error al insertar datos en la tabla ${tableFile} ERROR: ${err.message}`,
                err,
              });
              // reject({ resultFinal, errors });
            })
            .finally(() => {
              if (index === req.files.length - 1) {
                resolve({ resultFinal, errors });
              }
            });
        } catch (err) {
          reject(err);
        }
      }
    });

    const actualizarCampoCargado = async (
      resp,
      state,
      codInst,
      reprocesado = false
    ) => {
      const bodyAux = {
        cargado: state,
      };
      // console.log({ body: req.body, cargaBolsaActual });
      if (
        codInst === "bolsa" &&
        cargaBolsaActual.result.cargado === false &&
        cargaBolsaActual.result.reproceso === true &&
        (req.body?.reproceso === true || req.body?.reproceso === "true")
      ) {
        bodyAux.reprocesado = reprocesado;
      }
      const queryUpdateForError = ActualizarUtil(infoTables.table, {
        body: bodyAux,
        idKey: "id_carga_archivos",
        idValue: idCargaArchivos,
      });
      // console.log("actualizarCampoCargado", { queryUpdateForError });

      await pool
        .query(queryUpdateForError)
        .then(async (resultUpdate) => {
          if (
            codInst === "bolsa" &&
            (req.body?.reproceso === true || req.body?.reproceso === "true")
          ) {
            const ultimaCargaAux = await pool
              .query(
                EscogerInternoUtil(infoTables.table, {
                  select: ["*"],
                  where: [
                    { key: "id_rol", value: req.user.id_rol },
                    { key: "reproceso", value: true },
                    { key: "reprocesado", value: false },
                  ],
                })
              )
              .then((result) => {
                const value = minBy(result.rows, "fecha_operacion");

                if (isUndefined(value))
                  throw new Error("No existe una fecha válida");
                let dayOfMonth = value.fecha_operacion?.getDate();
                dayOfMonth--;
                value.fecha_operacion.setDate(dayOfMonth);
                return value;
              })
              .catch((err) => {
                throw err;
              });
            if (
              fechaInicialOperacion !==
              dayjs(ultimaCargaAux.fecha_operacion).format("YYYY-MM-DD")
            ) {
              const updateUltimaCargaReprocesado = await pool
                .query(
                  ActualizarUtil(infoTables.table, {
                    body: { reprocesado: true },
                    idKey: "id_carga_archivos",
                    idValue: ultimaCargaAux.id_carga_archivos,
                  })
                )
                .then((result) => {})
                .catch((err) => {
                  throw err;
                });
            }
          }
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          resp;
        });
    };

    const funcionesInversiones = async (fechaI, id_rolI) => {
      const params = {
        body: {
          fechaI,
          id_rolI,
        },
      };
      const querys = [
        EjecutarFuncionSQL("aps_ins_renta_fija_td", params),
        EjecutarFuncionSQL("aps_ins_renta_fija_cupon_ud", params),
        EjecutarFuncionSQL("aps_ins_otros_activos_to", params),
        EjecutarFuncionSQL("aps_ins_otros_activos_cupon_co", params),
        EjecutarFuncionSQL("aps_ins_renta_variable_tv", params),
      ];

      const results = await EjecutarVariosQuerys(querys);
      if (results.ok === null) return { ok: null, result: results.result };
      if (results.ok === false) return { ok: false, result: results.errors };

      return { ok: true, result: results.result };
    };

    const eliminarInformacionDuplicada = async (
      table,
      where,
      sequence,
      idTable
    ) => {
      const resultFinal = [];
      const queryDelete = EliminarMultiplesTablasUtil([table], {
        where,
      });
      const infoDelete = await pool
        .query(queryDelete)
        .then((result) => {
          resultFinal.push({
            query: "Eliminando registros duplicados",
            table,
            ok: true,
          });
          return result;
        })
        .catch((err) => {
          console.log(err);
          resultFinal.push({
            query: "Eliminando registros duplicados",
            table,
            ok: false,
            err,
          });
          return null;
        });

      const queryMax = ValorMaximoDeCampoUtil(table, {
        fieldMax: idTable,
      });
      const maxIdTables = await pool
        .query(queryMax)
        .then((result) => {
          resultFinal.push({
            query: "Seleccionando Maximo de tabla",
            table,
            idTable,
            ok: true,
          });
          if (result.rows?.[0]?.max === null) {
            return 0;
          } else {
            return result.rows?.[0]?.max;
          }
        })
        .catch((err) => {
          console.log("ERR UPLOAD", err);
          resultFinal.push({
            query: "Seleccionando Maximo de tabla",
            table,
            idTable,
            ok: false,
            err,
          });
          return 0;
        });

      let idRestartValue = null;
      idRestartValue = parseInt(maxIdTables) + 1;

      const querySequence = AlterarSequenciaUtil(sequence, {
        restartValue: idRestartValue,
      });

      const alterSquences = await pool
        .query(querySequence)
        .then((result) => {
          resultFinal.push({
            query: "Alterando secuencia",
            table,
            idRestartValue,
            ok: true,
          });
          return result;
        })
        .catch((err) => {
          console.log(err);
          resultFinal.push({
            query: "Alterando secuencia",
            table,
            idRestartValue,
            ok: false,
            err,
          });
          return null;
        });

      return resultFinal;
    };

    const eliminarArchivosCargados = async (tables, sequences, idTables) => {
      const resultFinal = [];
      const idsSequencesArray = [];

      const queryDelete = EliminarMultiplesTablasUtil(tables, {
        where: [
          {
            key: "id_carga_archivos",
            value: idCargaArchivos,
          },
        ],
      });

      const infoDelete = await pool
        .query(queryDelete)
        .then((result) => {
          resultFinal.push({
            query: "Eliminando cargas con error",
            tables,
            ok: true,
          });
          return result;
        })
        .catch((err) => {
          console.log(err);
          resultFinal.push({
            query: "Eliminando cargas con error",
            tables,
            ok: false,
            err,
          });
          return null;
        });

      for (let index = 0; index < tables.length; index++) {
        const item = tables[index];
        const id = idTables[index];
        const queryMax = ValorMaximoDeCampoUtil(item, {
          fieldMax: id,
        });
        const maxIdTables = await pool
          .query(queryMax)
          .then((result) => {
            resultFinal.push({
              query: "Seleccionando Maximos de cada tabla",
              item,
              id,
              ok: true,
            });
            if (result.rows?.[0]?.max === null) {
              return 0;
            } else {
              return result.rows?.[0]?.max;
            }
          })
          .catch((err) => {
            console.log(err);
            resultFinal.push({
              query: "Seleccionando Maximos de cada tabla",
              item,
              id,
              ok: false,
              err,
            });
            return null;
          });
        if (maxIdTables !== null) {
          const idReturn = parseInt(maxIdTables) + 1;
          idsSequencesArray.push(idReturn);
        }
      }

      const querySequence = AlterarSequenciaMultiplesTablasUtil(sequences, {
        restartValue: idsSequencesArray,
      });

      const alterSquences = await pool
        .query(querySequence)
        .then((result) => {
          resultFinal.push({
            query: "Alterando secuencias",
            tables,
            idsSequencesArray,
            ok: true,
          });
          return result;
        })
        .catch((err) => {
          console.log(err);
          resultFinal.push({
            query: "Alterando secuencias",
            tables,
            idsSequencesArray,
            ok: false,
            err,
          });
          return null;
        });

      return resultFinal;
    };

    uploadPromise
      .then(async (response) => {
        if (response?.errorsDateArray) {
          respArchivoErroneo200(
            res,
            response.errorsDateArray,
            ...previousResults
          );
          return;
        }
        if (response.errors.length >= 1) {
          const resultDelete = await eliminarArchivosCargados(
            tablesFilesArray,
            sequencesTablesFilesArray,
            idTablesFilesArray
          );
          console.log(resultDelete);
          await actualizarCampoCargado(
            respArchivoErroneo415(res, {
              errores: [...response.errors, ...previousErrors],
              cargado: false,
              resultDelete,
              idCargaArchivos,
            }),
            false,
            infoTables.cod_institution,
            false
          );
        } else {
          const finalRespArray = [];
          map(previousResults[0].files, (item, index) => {
            finalRespArray.push({
              archivo: item,
              cargado: true,
              id_carga_archivos: idCargaArchivos,
              mensaje: `La información está correcta`,
              fecha_operacion: fechaInicialOperacion,
            });
          });
          if (infoTables.code === "02") {
            const funcionesInversionesAux = await funcionesInversiones(
              fechaInicialOperacion,
              req.user.id_usuario
            );
            if (funcionesInversionesAux.ok !== true) {
              throw funcionesInversionesAux.result;
            } else {
              actualizarCampoCargado(
                respResultadoCorrectoObjeto200(res, finalRespArray),
                true,
                infoTables.cod_institution,
                true
              );
            }
          } else {
            actualizarCampoCargado(
              respResultadoCorrectoObjeto200(res, finalRespArray),
              true,
              infoTables.cod_institution,
              true
            );
          }
        }
      })
      .catch(async (err) => {
        console.log("ERR UPLOAD", err);
        const resultDelete = await eliminarArchivosCargados(
          tablesFilesArray,
          sequencesTablesFilesArray,
          idTablesFilesArray
        );
        console.log(resultDelete);
        await actualizarCampoCargado(
          respErrorServidor500END(
            res,
            {
              errores: err,
              cargado: false,
              resultDelete: resultDelete,
              idCargaArchivos: idCargaArchivos,
            },
            `Ocurrió un error inesperado. ERROR: ${err.message}`,
            false,
            infoTables.cod_institution,
            false
          )
        );
      });
  } catch (err) {
    console.log("ERR UPLOAD", err);
    respErrorServidor500END(res, err);
  }
}

// OBTENER TODOS LOS ACTIVIDAD ECONOMICA DE SEGURIDAD
async function Listar(req, res) {
  const params = { req, res, nameTable };
  await ListarCRUD(params);
}

// OBTENER UN ACTIVIDAD ECONOMICA, CON BUSQUEDA
async function Buscar(req, res) {
  const params = { req, res, nameTable };
  await BuscarCRUD(params);
}

// OBTENER UN ACTIVIDAD ECONOMICA, CON ID DEL ACTIVIDAD ECONOMICA
async function Escoger(req, res) {
  const params = { req, res, nameTable };
  await EscogerCRUD(params);
}

// INSERTAR UN ACTIVIDAD ECONOMICA
async function Insertar(req, res) {
  const params = { req, res, nameTable };
  await InsertarCRUD(params);
}

// ACTUALIZAR UN ACTIVIDAD ECONOMICA
async function Actualizar(req, res) {
  const params = { req, res, nameTable };
  await ActualizarCRUD(params);
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  CargarArchivo,
};
