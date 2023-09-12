const { map, find, forEach, size } = require("lodash");
const { parentPort, workerData } = require("worker_threads");
const {
  validarFechaOperacionIgual,
  validarArchivosNecesariosDeUsuario,
} = require("../helpers/validaciones-formato-archivo.helper");

function formatearArchivo() {
  const {
    files,
    TABLE_INFO,
    fechaOperacionFormateada,
    fecha_operacion,
    tipo_periodo,
    fecha_entrega,
    tipo_carga,
    reproceso,
    id_rol,
    id_usuario,
    codigosSeguros,
    codigosPensiones,
    confArchivos,
    formatoArchivosRequeridos,
    nuevaCarga,
  } = workerData;
  const errorsFormatFile = [];
  let formattedFiles = files;
  try {
    const fileNames = map(files, "originalname");
    formattedFiles = map(confArchivos, (confArchivo) => {
      return {
        ...confArchivo,
        nombre: find(fileNames, (fileName) => {
          return fileName?.includes(confArchivo.codigo);
        }),
      };
    });

    validarFechaOperacionIgual(
      fileNames,
      fechaOperacionFormateada,
      nuevaCarga,
      errorsFormatFile
    );
    if (size(errorsFormatFile) > 0) return { formattedFiles, errorsFormatFile };

    validarArchivosNecesariosDeUsuario(
      fileNames,
      confArchivos,
      formatoArchivosRequeridos,
      nuevaCarga,
      errorsFormatFile
    );
  } catch (err) {
    errorsFormatFile.push({
      id_carga_archivos: nuevaCarga.id_carga_archivos,
      archivo: "",
      tipo_error: "ERROR DE SERVIDOR",
      mensaje: `Error de servidor al formatear los archivos. ${
        err?.message ? err.message : err
      }`,
    });
  }

  return { formattedFiles, errorsFormatFile };
}
parentPort.postMessage(formatearArchivo());
