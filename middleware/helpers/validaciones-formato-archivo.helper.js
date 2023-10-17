const { map, size, forEach, isUndefined, find } = require("lodash");
const { agregarError } = require("./funciones-auxiliares.helper");

const validarFechaOperacionIgual = (
  fileNames,
  fecha,
  nuevaCarga,
  errors = []
) => {
  forEach(fileNames, (fileName) => {
    if (!fileName.includes(fecha)) {
      const newError = {
        id_carga_archivos: nuevaCarga.id_carga_archivos,
        archivo: fileName,
        tipo_error: "FORMATO DE NOMBRE DE ARCHIVO",
        descripcion: `La fecha del archivo no es la misma que la fecha de operación (${fecha})`,
      };
      agregarError(newError, errors);
    }
  });
};

const validarArchivosNecesariosDeUsuario = (
  fileNames,
  confArchivos,
  formatoArchivosRequeridos,
  nuevaCarga,
  TABLE_INFO,
  errors = []
) => {
  const { codeInst } = TABLE_INFO;
  if (size(confArchivos) === 0) {
    const newError = {
      id_carga_archivos: nuevaCarga.id_carga_archivos,
      archivo: "",
      tipo_error: "USUARIO SIN ARCHIVOS DISPONIBLES",
      descripcion: "No se encontraron archivos de entrada",
    };
    agregarError(newError, errors);
  }
  if (size(fileNames) !== size(confArchivos) && codeInst !== "CUSTODIO") {
    const newError = {
      id_carga_archivos: nuevaCarga.id_carga_archivos,
      archivo: "",
      tipo_error: "CANTIDAD DE ARCHIVOS REQUERIDOS",
      descripcion: `La cantidad de archivos de entrada ('${size(
        fileNames
      )}') no es igual a la cantidad de archivos esperada ('${size(
        confArchivos
      )}', archivos esperados: ${map(confArchivos, "codigo")})`,
    };
    agregarError(newError, errors);
  }
  if (size(errors > 0)) return;

  if (codeInst === "CUSTODIO") {
    const confArchivo = confArchivos[0];
    forEach(fileNames, (fileName) => {
      if (!fileName.includes(confArchivo.codigo)) {
        const newError = {
          id_carga_archivos: nuevaCarga.id_carga_archivos,
          archivo: fileName,
          tipo_error: "ARCHIVO FALTANTE",
          descripcion: `El archivo ${fileName} no fue encontrado en los archivos esperados (${map(
            confArchivos,
            "codigo"
          )})`,
        };
        agregarError(newError, errors);
        return;
      }
    });
  } else {
    forEach(confArchivos, (confArchivo, index) => {
      const fileNameFind = find(fileNames, (fileName) => {
        return fileName?.includes(confArchivo.codigo);
      });
      const fileAux = fileNameFind || fileNames?.[index];

      if (isUndefined(fileNameFind)) {
        const newError = {
          id_carga_archivos: nuevaCarga.id_carga_archivos,
          archivo: fileAux,
          tipo_error: "ARCHIVO FALTANTE",
          descripcion: `El archivo ${fileAux} no fue encontrado en los archivos esperados (${map(
            confArchivos,
            "codigo"
          )})`,
        };
        agregarError(newError, errors);
        return;
      }
      const fileNameFormatFind = find(
        formatoArchivosRequeridos,
        (formatoArchivo) => {
          return formatoArchivo.archivo === fileNameFind;
        }
      );
      const formatoEsperadoFind = find(
        formatoArchivosRequeridos,
        (formatoArchivo) => {
          return formatoArchivo.archivo?.includes(confArchivo.codigo);
        }
      );
      if (isUndefined(fileNameFormatFind)) {
        const newError = {
          id_carga_archivos: nuevaCarga.id_carga_archivos,
          archivo: fileAux,
          tipo_error: "FORMATO DE ARCHIVO",
          descripcion: `El archivo ${fileAux} no tiene el formato correcto (formato esperado: ${confArchivo.nombre}, ${fileAux})`,
        };
        agregarError(newError, errors);
        return;
      }
    });
  }
};

module.exports = {
  validarFechaOperacionIgual,
  validarArchivosNecesariosDeUsuario,
};
