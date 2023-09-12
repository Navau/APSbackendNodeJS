const { map, forEach, size, find, isArray } = require("lodash");
const { parentPort, workerData } = require("worker_threads");
const {} = require("../helpers/validaciones-contenido-archivo.helper");
const { agregarError } = require("../helpers/funciones-auxiliares.helper");
const {
  funcionesValidacionesContenidoValores,
} = require("../helpers/funciones-validaciones-contenido-valores-archivos.helper");

function validarContenidoValoresArchivo() {
  const { optionsValidationsFiles, objectArrayFileContent, nuevaCarga } =
    workerData;
  const errorsContentValuesFile = [];
  const validatedContentValuesFiles = optionsValidationsFiles;
  try {
    forEach(objectArrayFileContent, (fileContent, fileName) => {
      const fileCode = fileName.split(".").pop();
      const validations = optionsValidationsFiles[fileCode];
      forEach(fileContent, (fileContentRow, rowIndex) => {
        forEach(fileContentRow, (contentColumn, columnIndex) => {
          const findValidation = find(
            validations,
            (validation) => validation.columnName === columnIndex
          );
          const { pattern, functions, paramsBD, messages } = findValidation;
          const { DEFAULT_ERROR_DATA_TYPE_MESSAGE } = messages;
          if (!isArray(pattern)) {
            if (!pattern?.test(contentColumn)) {
              agregarError(
                {
                  id_carga_archivos: nuevaCarga.id_carga_archivos,
                  archivo: fileName,
                  tipo_error: "TIPO DE DATO INCORRECTO",
                  descripcion: DEFAULT_ERROR_DATA_TYPE_MESSAGE,
                  valor: contentColumn,
                  fila: rowIndex,
                  columna: columnIndex,
                },
                errorsContentValuesFile
              );
            }
            forEach(functions, (fn) => {
              fnResult = funcionesValidacionesContenidoValores[fn]({
                paramsBD,
                contentColumn,
                columnIndex,
                fileContentRow,
              });
              if (fnResult === false) {
                agregarError(
                  {
                    id_carga_archivos: nuevaCarga.id_carga_archivos,
                    archivo: fileName,
                    tipo_error: "VALOR INCORRECTO",
                    descripcion: fn,
                    valor: contentColumn,
                    fila: rowIndex,
                    columna: columnIndex,
                  },
                  errorsContentValuesFile
                );
              }
            });
          }
        });
      });
    });
  } catch (err) {
    agregarError(
      {
        id_carga_archivos: nuevaCarga.id_carga_archivos,
        archivo: "",
        tipo_error: "ERROR DE SERVIDOR",
        descripcion: `Error de servidor al formatear los archivos. ${
          err?.message ? err.message : err
        }`,
      },
      errorsContentValuesFile
    );
  }
  return { validatedContentValuesFiles, errorsContentValuesFile };
}
parentPort.postMessage(validarContenidoValoresArchivo());
