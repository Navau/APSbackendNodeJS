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
const {
  validarContenidoValoresDeArchivo,
  validarCombinacionesUnicasPorArchivo,
  validarValoresUnicosPorArchivo,
} = require("../helpers/validaciones-contenido-archivo.helper");
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
    objectArrayFilesContent,
    nuevaCarga,
    fecha_operacion,
  } = workerData;
  const informacionEntreArchivos = [];
  const errorsContentValuesFile = [];
  const validatedContentValuesFiles = optionsValidationsFiles;
  try {
    forEach(objectArrayFilesContent, (fileContent, fileNameAndCode) => {
      const fileName = fileNameAndCode.split("_separador_")[0];
      const fileCode = fileNameAndCode.split("_separador_")[1];

      const validations = optionsValidationsFiles[fileCode];
      const {
        fieldsUniqueBy,
        uniqueCombinationPerFile,
        formatDateFields,
        mayBeEmptyFields,
        replaceFieldValue,
      } = validations[0].globalFileValidations;
      const matchDataType = true;

      validarContenidoValoresDeArchivo({
        fileContent,
        validations,
        nuevaCarga,
        fileName,
        fileCode,
        formatDateFields,
        mayBeEmptyFields,
        matchDataType,
        fecha_operacion,
        informacionEntreArchivos,
        errorsContentValuesFile,
        replaceFieldValue,
      });

      validarCombinacionesUnicasPorArchivo({
        uniqueCombinationPerFile,
        nuevaCarga,
        fileContent,
        fileCode,
        fileName,
        errorsContentValuesFile,
      });

      validarValoresUnicosPorArchivo({
        fieldsUniqueBy,
        fileContent,
        nuevaCarga,
        fileName,
        errorsContentValuesFile,
      });
    });
  } catch (err) {
    console.log(err);
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
  return {
    objectArrayFilesContent,
    validatedContentValuesFiles,
    errorsContentValuesFile,
  };
}
parentPort.postMessage(validarContenidoValoresArchivo());
