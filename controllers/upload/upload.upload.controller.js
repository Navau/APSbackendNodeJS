const { map } = require("lodash");
const pool = require("../../database");
const fs = require("fs");

const { formatoArchivo } = require("../../utils/formatoCamposArchivos.utils");

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
  ObtenerUltimoRegistro,
  EliminarMultiplesTablasUtil,
  AlterarSequenciaMultiplesTablasUtil,
  ValorMaximoDeCampoMultiplesTablasUtil,
} = require("../../utils/consulta.utils");

const {
  respErrorServidor500,
  respDatosNoRecibidos400,
  respResultadoCorrecto200,
  respResultadoVacio404,
  respIDNoRecibido400,
  respArchivoErroneo415,
  respErrorServidor500END,
  respResultadoCorrectoObjeto200,
} = require("../../utils/respuesta.utils");

var nameTable = "APS_aud_carga_archivos_bolsa";

// async function CargarArchivo(req, res) {
//   let fieldMax = "id_carga_archivos";
//   let idCargaArchivos = null;
//   let idArchivo = null;
//   let errors = [];
//   let filesReaded = req.filesReaded;
//   nameTable = req.nameTableAud;
//   let resultFinal = [];
//   let uploadPromise = null;
//   try {
//     uploadPromise = new Promise(async (resolve, reject) => {
//       let queryCargaArchivo = await ListarUtil(nameTable, {});
//       let currentFilesBD = [];
//       await pool
//         .query(queryCargaArchivo)
//         .then(async (result) => {
//           currentFilesBD = await result.rows;
//         })
//         .catch((err) => {
//           console.log(err);
//           errors.push({
//             type: "QUERY SQL ERROR",
//             message: `Hubo un error al obtener los datos en la tabla '${nameTable}' ERROR: ${err.message}`,
//             err,
//           });
//         });
//       try {
//         await map(req.files, async (item, index) => {
//           let existFileBD = {};
//           map(currentFilesBD, (item2, index2) => {
//             if (item2.nombre_archivo === item.originalname) {
//               existFileBD = item2;
//               return;
//             }
//           });
//           const params = {
//             fieldMax,
//             where: [
//               {
//                 key: "nombre_archivo",
//                 value: item.originalname,
//                 like: true,
//               },
//             ],
//           };
//           let filePath =
//             __dirname.substring(0, __dirname.indexOf("controllers")) +
//             item.path;
//           let queryMax = ValorMaximoDeCampoUtil(nameTable, params);
//           await pool
//             .query(queryMax)
//             .then(async (resultMax) => {
//               console.log(resultMax);
//               if (!resultMax.rowCount || resultMax.rowCount < 1) {
//                 idCargaArchivos = 1;
//               } else {
//                 idCargaArchivos =
//                   (await resultMax.rows[0].max) !== null
//                     ? resultMax.rows[0].max
//                     : 1;
//               }
//             })
//             .catch((err) => {
//               console.log(err);
//               errors.push({
//                 file: item.originalname,
//                 type: "QUERY SQL ERROR",
//                 message: `Hubo un error al obtener el Maximo ID del campo: ${fieldMax} ERROR: ${err.message}`,
//                 err,
//               });
//             });
//           let arrayDataObject = [];
//           map(filesReaded[index], (item2, index2) => {
//             let rowSplit = item2.split(",");
//             let resultObject = [];
//             map(rowSplit, (item3, index3) => {
//               if (item3 !== "") {
//                 resultObject = [
//                   ...resultObject,
//                   item3.trim(), //QUITAR ESPACIOS
//                 ];
//               }
//             });
//             if (item2 !== "") {
//               arrayDataObject.push(resultObject);
//             }
//           });
//           let arrayDataObjectWithIDandStatus = [];
//           map(arrayDataObject, (item2, index2) => {
//             let result = [...item2, `"${idCargaArchivos}","true"\r\n`];
//             arrayDataObjectWithIDandStatus.push(result);
//           });
//           let dataFile = arrayDataObjectWithIDandStatus.join("");
//           const filePathWrite = `./uploads/tmp/${item.originalname}`;
//           fs.writeFileSync(filePathWrite, dataFile);
//           let headers = null;
//           let tableFile = null;
//           let paramsFile = null;
//           if (item.originalname.includes("K.")) {
//             headers = formatoArchivo("k");
//             tableFile = "APS_oper_archivo_k";
//             idArchivo = "id_archivo_k";

//             headers = {
//               ...headers,
//               codigo_activo: headers.tipo_marcacion,
//               id_carga_archivos: idCargaArchivos,
//               estado: true,
//             };

//             delete headers.tipo_marcacion;

//             paramsFile = {
//               headers,
//               filePath,
//             };
//           } else if (item.originalname.includes("L.")) {
//           } else if (item.originalname.includes("N.")) {
//           } else if (item.originalname.includes("P.")) {
//           }
//           let queryMain = "";
//           let queryFile = "";
//           let queryDelete = "";
//           let queryMaxFile = "";
//           let queryResetIDFile = "";
//           let lastIDFile = null;
//           queryMaxFile = ValorMaximoDeCampoUtil(tableFile, {
//             fieldMax: idArchivo,
//           });

//           if (Object.keys(existFileBD).length >= 1) {
//             queryDelete = EliminarUtil(tableFile, {
//               where: {
//                 id_carga_archivos: existFileBD.id_carga_archivos,
//               },
//             });
//             queryMain = ActualizarUtil(nameTable, {
//               body: {
//                 id_carga_archivos: existFileBD.id_carga_archivos,
//                 fecha_operacion: new Date(existFileBD.fecha_operacion),
//                 nombre_archivo: item.originalname,
//                 nro_carga: existFileBD.nro_carga + 1,
//                 fecha_entrega: new Date(),
//                 fecha_carga: new Date(),
//                 id_usuario: req.user.id_usuario,
//                 cargado: true,
//               },
//               idKey: "id_carga_archivos",
//               idValue: existFileBD.id_carga_archivos,
//             });
//             queryFile = CargarArchivoABaseDeDatosUtil(tableFile, {
//               action: "insert",
//               paramsFile,
//               existFileBD,
//             });
//           } else {
//             queryMain = await InsertarUtil(nameTable, {
//               body: {
//                 fecha_operacion: new Date(),
//                 nombre_archivo: item.originalname,
//                 nro_carga: 1,
//                 fecha_entrega: new Date(),
//                 fecha_carga: new Date(),
//                 id_usuario: req.user.id_usuario,
//                 cargado: true,
//               },
//             });

//             queryFile = await CargarArchivoABaseDeDatosUtil(tableFile, {
//               action: "insert",
//               paramsFile,
//             });
//           }
//           await pool
//             .query(queryMain)
//             .then(async (resultMain) => {
//               resultFinal.push({
//                 file: item.originalname,
//                 message: `El archivo fue insertado correctamente a la tabla ''${nameTable}''`,
//                 result: {
//                   rowsUpdate: resultMain.rows,
//                   rowCount: resultMain.rowCount,
//                 },
//               });
//               if (queryDelete.length >= 1) {
//                 await pool
//                   .query(queryDelete)
//                   .then(async (resultDelete) => {
//                     resultFinal.push({
//                       file: item.originalname,
//                       message: `El archivo fue eliminado correctamente de la tabla '${tableFile}'`,
//                       result: {
//                         rowsUpdate: resultDelete.rows,
//                         rowCount: resultDelete.rowCount,
//                       },
//                     });
//                     await pool
//                       .query(queryMaxFile)
//                       .then(async (resultMaxFile) => {
//                         if (
//                           !resultMaxFile.rowCount ||
//                           resultMaxFile.rowCount < 1
//                         ) {
//                           lastIDFile = 1;
//                         } else {
//                           lastIDFile =
//                             (await resultMaxFile.rows[0]?.max) !== null
//                               ? resultMaxFile.rows[0].max
//                               : 1;
//                         }
//                       });
//                     queryResetIDFile = ResetearIDUtil(tableFile, {
//                       field: idArchivo,
//                       resetValue: lastIDFile + 1,
//                     });
//                     await pool.query(queryResetIDFile);
//                     await pool
//                       .query(queryFile)
//                       .then(async (resultFile) => {
//                         resultFinal.push({
//                           file: item.originalname,
//                           message: `El archivo fue insertado correctamente a la tabla '${tableFile}'`,
//                           result: {
//                             rowsUpdate: resultFile.rows,
//                             rowCount: resultFile.rowCount,
//                           },
//                         });
//                       })
//                       .catch((err) => {
//                         console.log(err);
//                         errors.push({
//                           file: item.originalname,
//                           type: "QUERY SQL ERROR",
//                           message: `Hubo un error al insertar datos en la tabla ${tableFile} ERROR: ${err.message}`,
//                           err,
//                         });
//                       });
//                   })
//                   .catch((err) => {
//                     console.log(err);
//                     errors.push({
//                       file: item.originalname,
//                       type: "QUERY SQL ERROR",
//                       message: `Hubo un error al eliminar datos en la tabla ${tableFile} ERROR: ${err.message}`,
//                       err,
//                     });
//                   });
//               } else {
//                 await pool.query(queryMaxFile).then(async (resultMaxFile) => {
//                   if (!resultMaxFile.rowCount || resultMaxFile.rowCount < 1) {
//                     lastIDFile = 1;
//                   } else {
//                     lastIDFile =
//                       (await resultMaxFile.rows[0]?.max) !== null
//                         ? resultMaxFile.rows[0].max
//                         : 1;
//                   }
//                 });
//                 queryResetIDFile = ResetearIDUtil(tableFile, {
//                   field: idArchivo,
//                   resetValue: lastIDFile === 1 ? 1 : lastIDFile + 1,
//                 });
//                 await pool
//                   .query(queryResetIDFile)
//                   .then((resultResetIDFile) => {});
//               }
//             })
//             .catch((err) => {
//               console.log(err);
//               errors.push({
//                 file: item.originalname,
//                 type: "QUERY SQL ERROR",
//                 message: `Hubo un error al insertar datos en la tabla '${nameTable}' ERROR: ${err.message}`,
//                 err,
//               });
//             });
//         });
//       } catch (err) {
//         respErrorServidor500(res, err, "Ocurrió un error inesperado.");
//       } finally {
//         resolve({ resultFinal, errors });
//       }
//     });
//   } catch (err) {
//     respErrorServidor500(res, err, "Ocurrió un error inesperado.");
//   }
//   uploadPromise
//     .then((response) => {
//       if (response.errors.length >= 1) {
//         respArchivoErroneo415(res, response.errors);
//       } else {
//         respResultadoCorrecto200(
//           res,
//           {
//             rows: response.resultFinal,
//           },
//           "Archivos Cargados correctamente."
//         );
//       }
//     })
//     .catch((err) => {
//       respErrorServidor500(res, err, "Ocurrió un error inesperado.");
//     });
// }

async function CargarArchivo3(req, res) {
  const fechaInicialOperacion = req?.body?.fecha_operacion;
  const filesReaded = req.filesReaded;
  // const filesUploadedBD = req.filesUploadedBD;
  const previousResults = req.results;
  const previousErrors = req.errors;
  const returnsValues = req.returnsValues;
  const idCargaArchivos = returnsValues[0].id_carga_archivos;
  const resultFinal = [];
  const tablesFilesArray = [];
  const sequencesTablesFilesArray = [];
  const idTablesFilesArray = [];
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
    table: null,
    tableErrors: null,
  };
  map(filesSort, (item, index) => {
    if (
      item.originalname.toUpperCase().substring(0, 3) === "108" &&
      !item.originalname.toUpperCase().includes(".CC")
    ) {
      infoTables = {
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
      infoTables = {
        code: "M",
        table: "APS_aud_carga_archivos_bolsa",
        tableErrors: "APS_aud_errores_carga_archivos_bolsa",
      };
    } else if (item.originalname.toUpperCase().includes(".CC")) {
      infoTables = {
        code: "CC",
        table: "APS_aud_carga_archivos_custodio",
        tableErrors: "APS_aud_errores_carga_archivos_custodio",
      };
    }
  });

  const uploadPromise = new Promise(async (resolve, reject) => {
    let errors = [];
    for (let index = 0; index < filesSort.length; index++) {
      const item = filesSort[index];
      const arrayDataObject = [];
      const filePath =
        __dirname.substring(0, __dirname.indexOf("controllers")) + item.path;
      //#region SEPARAR LOS CAMPOS DEL ARCHIVO QUE ESTA DIVIDO EN FILAS
      // console.log(filesReaded);
      // SE ORDENAN PRIMERO LOS ARCHIVOS ANTES DE ITERAR CON FILES READED
      map(filesReaded[index], (item2, index2) => {
        let rowSplit = item2.split(",");
        let resultObject = [];
        map(rowSplit, (item3, index3) => {
          if (item3 !== "") {
            resultObject = [
              ...resultObject,
              item3.trim(), //QUITAR ESPACIOS
            ];
          }
        });
        if (item2 !== "") {
          arrayDataObject.push(resultObject);
        }
      });
      //#endregion

      let headers = null;
      let codeFile = null;
      let tableFile = null;
      let idTable = null;

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
      } else if (item.originalname.includes(".CC")) {
        codeFile = "CC";
        tableFile = "APS_oper_archivo_Custodio";
      }
      headers = await formatoArchivo(codeFile);
      idTable = headers[0];
      headers.splice(0, 1); // ELIMINAR ID DE TABLA

      tablesFilesArray.push(tableFile);
      sequencesTablesFilesArray.push({
        table: tableFile,
        id: idTable,
      });
      idTablesFilesArray.push(idTable);
      //#region INSERTAR EL ID DE CARGA ARCHIVOS, COD_INSTITUCION, FECHA_INFORMACION A CADA FILA SEPARADA
      // console.log("arrayDataObject", arrayDataObject);
      const newArrayDataObject = [];
      // ["id_carga_archivos", "cod_institucion", "fecha_informacion"]
      // console.log(headers);
      // console.log(headers.includes("id_carga_archivos"));

      let stringFinalFile = "";
      let arrayHeadersAux = [];
      if (headers.includes("id_carga_archivos")) {
        stringFinalFile += `"${idCargaArchivos}"`;
        arrayHeadersAux.push("id_carga_archivos");
      }
      if (headers.includes("cod_institucion")) {
        stringFinalFile += `,"${infoTables.code}"`;
        arrayHeadersAux.push("cod_institucion");
      }
      if (headers.includes("fecha_informacion")) {
        stringFinalFile += `,"2022-05-05"`;
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
      //#endregion

      // console.log("stringFinalFile", stringFinalFile);
      map(arrayDataObject, (item2, index2) => {
        newArrayDataObject.push([...item2, ...stringFinalFile.split(",")]);
      });
      // console.log("newArrayDataObject", newArrayDataObject);
      //#endregion

      //#region INSERTANDO LA INFORMACION FORMATEADA A LA RUTA DE UPLOADS/TMP/ARCHIVO JUNTO CON EL ID DE CARGA DE ARCHIVOS
      const dataFile = newArrayDataObject.join("");
      const filePathWrite = `./uploads/tmp/${item.originalname}`;
      fs.writeFileSync(filePathWrite, dataFile);
      //#endregion
      // console.log(headers);
      // console.log(codeFile);
      // console.log(headers);
      // console.log(item.originalname);

      //#region Formateando informacion de archivo para insertar por medio de un INSERT QUERY
      let finalData = [];
      let partialData = [];
      // console.log(newArrayDataObject);
      map(newArrayDataObject, (itemV1, indexV1) => {
        // console.log("ITEMV1", itemV1);
        let dataObject = Object.assign({}, itemV1);
        partialData.push(dataObject);
      });
      // console.log(partialData);
      // console.log(headers);
      let partialHeaders = headers;
      map(partialData, (itemV1, indexV1) => {
        let x = {};
        map(itemV1, (itemV2, indexV2) => {
          let valueAux = itemV2;
          x = {
            ...x,
            [partialHeaders[indexV2]]: valueAux?.trim().replace(/['"]+/g, ""),
          };
        });
        finalData.push(x);
      });
      //#endregion
      console.log(finalData);
      if (codeFile === "P") {
      }

      map([finalData], (itemBPQ, indexBPQ) => {
        bodyFinalQuery = bodyFinalQuery.concat(itemBPQ);
      });

      let queryFiles = "";

      queryFiles = InsertarVariosUtil(tableFile, {
        body: bodyFinalQuery,
        returnValue: [`id_archivo_${codeFile.toLowerCase()}`],
      });

      console.log(queryFiles);

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
    }
  });

  const actualizarCampoCargado = async (resp, state) => {
    const queryUpdateForError = ActualizarUtil(infoTables.table, {
      body: {
        cargado: state,
      },
      idKey: "id_carga_archivos",
      idValue: idCargaArchivos,
    });
    console.log(queryUpdateForError);

    await pool
      .query(queryUpdateForError)
      .then((response) => {})
      .catch((err) => {})
      .finally(() => {
        resp;
      });
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
          query: "Eliminando cargas con error.",
          tables,
          ok: true,
        });
        return result;
      })
      .catch((err) => {
        console.log(err);
        resultFinal.push({
          query: "Eliminando cargas con error.",
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
            query: "Seleccionando Maximos de cada tabla.",
            item,
            id,
            ok: true,
          });
          return result;
        })
        .catch((err) => {
          console.log(err);
          resultFinal.push({
            query: "Seleccionando Maximos de cada tabla.",
            item,
            id,
            ok: false,
            err,
          });
          return null;
        });
      if (maxIdTables !== null) {
        const idReturn = parseInt(maxIdTables?.rows?.[0]?.max) + 1;
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
          query: "Alterando secuencias.",
          tables,
          idsSequencesArray,
          ok: true,
        });
        return result;
      })
      .catch((err) => {
        console.log(err);
        resultFinal.push({
          query: "Alterando secuencias.",
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
        actualizarCampoCargado(
          respResultadoCorrectoObjeto200(res, finalRespArray),
          true
        );
      }
    })
    .catch(async (err) => {
      const resultDelete = await eliminarArchivosCargados(
        tablesFilesArray,
        sequencesTablesFilesArray,
        idTablesFilesArray
      );
      console.log(resultDelete);
      await actualizarCampoCargado(
        respErrorServidor500(
          res,
          {
            errores: err,
            cargado: false,
            resultDelete: resultDelete,
            idCargaArchivos: idCargaArchivos,
          },
          "Ocurrió un error inesperado.",
          false
        )
      );
    });
}

//FUNCION PARA OBTENER TODOS LOS ACTIVIDAD ECONOMICA DE SEGURIDAD
function Listar(req, res) {
  const params = {
    status: "activo",
  };
  let query = ListarUtil(nameTable, params);
  pool.query(query, (err, result) => {
    if (err) {
      respErrorServidor500(res, err);
    } else {
      if (!result.rowCount || result.rowCount < 1) {
        respResultadoVacio404(res);
      } else {
        respResultadoCorrecto200(res, result);
      }
    }
  });
}

//FUNCION PARA OBTENER UN ACTIVIDAD ECONOMICA, CON BUSQUEDA
function Buscar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      status: "activo",
      body: body,
    };
    let query = BuscarUtil(nameTable, params);
    pool.query(query, (err, result) => {
      if (err) {
        respErrorServidor500(res, err);
      } else {
        if (!result.rows || result.rows < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrecto200(res, result);
        }
      }
    });
  }
}

//FUNCION PARA OBTENER UN ACTIVIDAD ECONOMICA, CON ID DEL ACTIVIDAD ECONOMICA
function Escoger(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = EscogerUtil(nameTable, params);
    pool.query(query, (err, result) => {
      if (err) {
        respErrorServidor500(res, err);
      } else {
        if (!result.rowCount || result.rowCount < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrecto200(res, result);
        }
      }
    });
  }
}

//FUNCION PARA INSERTAR UN ACTIVIDAD ECONOMICA
function Insertar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    const params = {
      body: body,
    };
    let query = InsertarUtil(nameTable, params);
    pool.query(query, (err, result) => {
      if (err) {
        respErrorServidor500(res, err);
      } else {
        if (!result.rowCount || result.rowCount < 1) {
          respResultadoVacio404(res);
        } else {
          respResultadoCorrecto200(
            res,
            result,
            "Información guardada correctamente"
          );
        }
      }
    });
  }
}

//FUNCION PARA ACTUALIZAR UN ACTIVIDAD ECONOMICA
function Actualizar(req, res) {
  const body = req.body;

  let query = "";

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = ActualizarUtil(nameTable, params);

      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(
              res,
              result,
              "Información actualizada correctamente"
            );
          }
        }
      });
    }
  }
}

//FUNCION PARA DESHABILITAR UN ACTIVIDAD ECONOMICA
function Deshabilitar(req, res) {
  const body = req.body;

  if (Object.entries(body).length === 0) {
    respDatosNoRecibidos400(res);
  } else {
    let idInfo = ValidarIDActualizarUtil(nameTable, body);
    if (!idInfo.idOk) {
      respIDNoRecibido400(res);
    } else {
      const params = {
        body: body,
        idKey: idInfo.idKey,
        idValue: idInfo.idValue,
      };
      query = DeshabilitarUtil(nameTable, params);
      pool.query(query, (err, result) => {
        if (err) {
          respErrorServidor500(res, err);
        } else {
          if (!result.rowCount || result.rowCount < 1) {
            respResultadoVacio404(res);
          } else {
            respResultadoCorrecto200(res, result);
          }
        }
      });
    }
  }
}

module.exports = {
  Listar,
  Buscar,
  Escoger,
  Insertar,
  Actualizar,
  Deshabilitar,
  CargarArchivo3,
};
