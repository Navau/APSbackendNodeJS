const { map, find, forEach, size } = require("lodash");
const { parentPort, workerData } = require("worker_threads");
const {
  validarFechaOperacionIgual,
  validarArchivosNecesariosDeUsuario,
  validarErroresDeSubidaDeArchivos,
} = require("../helpers/validaciones-formato-archivo.helper");
const { agregarError } = require("../helpers/funciones-auxiliares.helper");

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
    uploadErrors,
  } = workerData;
  const errorsFormatFile = [];
  let formattedFiles = files;
  try {
    const { codeInst } = TABLE_INFO;
    const fileNames = map(files, "originalname");
    if (size(confArchivos) === 0)
      throw "No existen archivos para formatear en 'APS_param_archivos_pensiones_seguros'";

    if (codeInst === "CUSTODIO") {
      formattedFiles = map(fileNames, (fileName) => {
        const confArchivo = confArchivos[0];
        return {
          ...confArchivo,
          nombre: fileName,
        };
      });
    } else {
      formattedFiles = map(confArchivos, (confArchivo) => {
        return {
          ...confArchivo,
          nombre: find(fileNames, (fileName) => {
            return fileName?.includes(confArchivo.codigo);
          }),
        };
      });
    }

    validarErroresDeSubidaDeArchivos(
      uploadErrors,
      nuevaCarga,
      errorsFormatFile
    );
    if (size(errorsFormatFile) > 0) return { formattedFiles, errorsFormatFile };

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
      TABLE_INFO,
      errorsFormatFile
    );
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
      errorsFormatFile
    );
  }

  return { formattedFiles, errorsFormatFile };
}
parentPort.postMessage(formatearArchivo());
