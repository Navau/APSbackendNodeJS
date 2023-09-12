const { map, forEach, size } = require("lodash");
const { parentPort, workerData } = require("worker_threads");
const {
  quitarCaracteresExtrañosContenidoArchivo,
  verificarArchivoVacio,
  verificarFormatoContenidoArchivo,
  verificarCantidadColumnasArchivo,
} = require("../helpers/validaciones-contenido-archivo.helper");

function validarContenidoArchivo() {
  const { readedFiles, infoColumnasArchivos, TABLE_INFO, nuevaCarga } =
    workerData;
  const errorsContentFormatFile = [];
  let validatedContentFormatFiles = readedFiles;
  const headers = {};
  const filesContentSplitByRow = {};
  forEach(infoColumnasArchivos, (infoColumnaArchivo, index) => {
    headers[index] = map(infoColumnaArchivo, (columna) => columna.column_name);
  });
  try {
    forEach(readedFiles, (file) => {
      const { fileContent, fileIsEmpty, fileName } = file;
      quitarCaracteresExtrañosContenidoArchivo(fileContent);
      verificarArchivoVacio(
        fileContent,
        fileIsEmpty,
        fileName,
        nuevaCarga,
        errorsContentFormatFile
      );
    });

    if (size(errorsContentFormatFile) > 0)
      return { validatedContentFormatFiles, errorsContentFormatFile };

    forEach(readedFiles, (file) => {
      const { fileContent, fileName, fileCode } = file;
      const fileContentSplit = verificarFormatoContenidoArchivo(
        fileContent,
        fileName,
        nuevaCarga,
        errorsContentFormatFile
      );
      filesContentSplitByRow[fileCode] = fileContentSplit;
    });

    if (size(errorsContentFormatFile) > 0)
      return { validatedContentFormatFiles, errorsContentFormatFile };
    validatedContentFormatFiles = {};

    forEach(filesContentSplitByRow, (fileContentSplit, fileCode) => {
      const fileHeaders = headers[fileCode];
      const objectArrayFileContent = verificarCantidadColumnasArchivo(
        fileHeaders,
        fileContentSplit,
        fileCode,
        nuevaCarga,
        errorsContentFormatFile
      );
      validatedContentFormatFiles[fileCode] = objectArrayFileContent;
    });
  } catch (err) {
    errorsContentFormatFile.push({
      id_carga_archivos: nuevaCarga.id_carga_archivos,
      archivo: "",
      tipo_error: "ERROR DE SERVIDOR",
      descripcion: `Error de servidor al formatear los archivos. ${
        err?.message ? err.message : err
      }`,
    });
  }
  return { validatedContentFormatFiles, errorsContentFormatFile };
}
parentPort.postMessage(validarContenidoArchivo());
