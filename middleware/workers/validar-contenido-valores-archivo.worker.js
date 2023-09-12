const { map, forEach, size } = require("lodash");
const { parentPort, workerData } = require("worker_threads");
const {} = require("../helpers/validaciones-contenido-archivo.helper");
const { agregarError } = require("../helpers/funciones-auxiliares.helper");

function validarContenidoValoresArchivo() {
  const { optionsValidationsFiles, nuevaCarga } = workerData;
  const errorsContentValuesFile = [];
  const validatedContentValuesFiles = optionsValidationsFiles;
  try {
    console.log({
      columnName: "flujo_total",
      pattern: /^(0|[1-9][0-9]{0,13})(\.\d{2,2}){1,1}$/,
      functions: [() => console.log("XD"), () => console.log("XD")],
      messages: {
        DEFAULT_ERROR_DATA_TYPE_MESSAGE:
          "El campo no cumple las especificaciones de Tipo de Dato",
        MESSAGE_ERROR_DB: "",
      },
    });
    // forEach(optionsValidationsFiles, (validations) =>
    //   forEach(validations, (validation) => {
    //     forEach(validation.functions, (functionName) => {
    //       functionName();
    //     });
    //   })
    // );
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
