const {
  map,
  forEach,
  size,
  find,
  isArray,
  includes,
  isEmpty,
} = require("lodash");
const { parentPort, workerData } = require("worker_threads");
const {} = require("../helpers/validaciones-contenido-archivo.helper");
const {
  agregarError,
  CONF_FILE_MESSAGES,
} = require("../helpers/funciones-auxiliares.helper");
const {
  funcionesValidacionesContenidoValores,
} = require("../helpers/funciones-validaciones-contenido-valores-archivos.helper");
const { DateTime } = require("luxon");

function validarContenidoValoresArchivo() {
  const {
    optionsValidationsFiles,
    objectArrayFileContent,
    nuevaCarga,
    fecha_operacion,
  } = workerData;
  const errorsContentValuesFile = [];
  const validatedContentValuesFiles = optionsValidationsFiles;
  try {
    const { DEFAULT_ERROR_DATA_TYPE_MESSAGE } = CONF_FILE_MESSAGES();
    forEach(objectArrayFileContent, (fileContent, fileNameAndCode) => {
      const fileName = fileNameAndCode.split("_separador_")[0];
      const fileCode = fileNameAndCode.split("_separador_")[1];
      const validations = optionsValidationsFiles[fileCode];
      const { fieldsUniqueBy, uniqueCombinationPerFile, formatDateFields } =
        validations[0].globalFileValidations;
      let matchDataType = true;
      forEach(fileContent, (row, rowIndex) => {
        forEach(row, (value, columnIndex) => {
          const findValidation = find(
            validations,
            (validation) => validation.columnName === columnIndex
          );
          const {
            pattern,
            functions,
            paramsBD,
            messages,
            mathOperation,
            mayBeEmptyFields,
            extraFunctionsParameters,
          } = findValidation;

          if (!isArray(pattern)) {
            forEach(formatDateFields, (formatDateField, dateFieldIndex) => {
              if (
                columnIndex === dateFieldIndex &&
                DateTime.fromISO(value).isValid
              ) {
                value = DateTime.fromISO(value).toFormat(formatDateField);
              }
            });
            if (!pattern?.test(value)) {
              matchDataType = false;
              if (isEmpty(value) && !includes(mayBeEmptyFields, columnIndex)) {
                agregarError(
                  {
                    id_carga_archivos: nuevaCarga.id_carga_archivos,
                    archivo: fileName,
                    tipo_error: "TIPO DE DATO INCORRECTO",
                    descripcion: DEFAULT_ERROR_DATA_TYPE_MESSAGE,
                    valor: value,
                    fila: rowIndex,
                    columna: columnIndex,
                  },
                  errorsContentValuesFile
                );
              }
            }
          } else {
            forEach(functions, (functionName) => {
              functionResult = funcionesValidacionesContenidoValores[
                functionName
              ]({
                paramsBD,
                value,
                fecha_operacion,
                columnIndex,
                row,
                messages,
                mayBeEmptyFields,
                pattern,
              });
              if (functionResult !== true) {
                agregarError(
                  {
                    id_carga_archivos: nuevaCarga.id_carga_archivos,
                    archivo: fileName,
                    tipo_error: "TIPO DE DATO INCORRECTO",
                    descripcion: DEFAULT_ERROR_DATA_TYPE_MESSAGE,
                    valor: value,
                    fila: rowIndex,
                    columna: columnIndex,
                  },
                  errorsContentValuesFile
                );
              }
            });
          }
          forEach(functions, (functionName) => {
            functionResult = funcionesValidacionesContenidoValores[
              functionName
            ]({
              paramsBD,
              value,
              fecha_operacion,
              columnIndex,
              row,
              messages,
              mayBeEmptyFields,
              pattern,
              fileCode,
              extraFunctionsParameters,
            });
            if (functionResult !== true) {
              agregarError(
                {
                  id_carga_archivos: nuevaCarga.id_carga_archivos,
                  archivo: fileName,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: functionResult,
                  valor: value,
                  fila: rowIndex,
                  columna: columnIndex,
                },
                errorsContentValuesFile
              );
            }
          });
          if (size(mathOperation) > 0) {
            const functionResult =
              funcionesValidacionesContenidoValores.operacionMatematica({
                value,
                mathOperation,
                row,
                rowIndex,
                fileContent,
                pattern,
              });
            if (functionResult !== true) {
              agregarError(
                {
                  id_carga_archivos: nuevaCarga.id_carga_archivos,
                  archivo: fileName,
                  tipo_error: "VALOR INCORRECTO OPERACIÓN NO VÁLIDA",
                  descripcion: functionResult,
                  valor: value,
                  fila: rowIndex,
                  columna: columnIndex,
                },
                errorsContentValuesFile
              );
            }
          }
        });
      });
      if (size(uniqueCombinationPerFile) > 0) {
        const functionResult =
          funcionesValidacionesContenidoValores.combinacionUnicaPorArchivo({
            uniqueCombinationPerFile,
            fileContent,
            fileCode,
            nuevaCarga,
            fileName,
          });
        if (functionResult !== true) {
          forEach(functionResult, (error) => {
            agregarError(error, errorsContentValuesFile);
          });
        }
      }

      if (size(fieldsUniqueBy) > 0) {
        const functionResult = funcionesValidacionesContenidoValores.unicoPor({
          fieldsUniqueBy,
          fileContent,
          nuevaCarga,
          fileName,
        });
        if (functionResult !== true) {
          forEach(functionResult, (error) => {
            agregarError(error, errorsContentValuesFile);
          });
        }
      }
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
