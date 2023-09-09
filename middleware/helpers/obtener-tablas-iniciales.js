const { filter, map, find, size, forEach } = require("lodash");
const { DateTime } = require("luxon");

async function obtenerTablasIniciales(
  data,
  confArchivos,
  user,
  codigosSeguros,
  codigosPensiones
) {
  try {
    const fileNames = map(data.files, "originalname");
    const { fechaOperacionFormateada, fecha_operacion } = data;
    const errorsFormatFile = [];
    validarFechaOperacionIgual(fileNames, fechaOperacionFormateada);

    const validaFormatoArchivo = filter(confArchivos, (confArchivo) => {
      const fileNameFind = find(fileNames, (fileName) => {
        const fileNameExtension = fileName.split(".").pop();
        return fileNameExtension === confArchivo.codigo;
      });

      const splitFileName = fileNameFind.split(fechaOperacionFormateada);
      const codInstFile = splitFileName[0];
      const extFile = splitFileName[1];
      const splitConfFileFormat = confArchivo.nombre.split("aaaammdd");
      const codInstConfFile = splitConfFileFormat[0];
      const extConfFile = splitConfFileFormat[1];
      const fechaOperacionValida = validarFechaConFormato(
        fileNameFind,
        confArchivo,
        fecha_operacion
      );
      if (fechaOperacionFormateada !== true)
        errorsFormatFile.push(fechaOperacionValida);

      forEach(codInstFile, (item, index) => {
        item.replace("n");
      });
      if (size(codInstFile) === size(codInstConfFile)) {
      }
    });
  } catch (err) {
    throw err;
  }
}

const validarFechaOperacionIgual = (fileNames, fecha) => {
  const validacion = map(fileNames, (fileName) => {
    if (!fileName.includes(fecha))
      return {
        archivo: fileName,
        tipo_error: "FORMATO DE NOMBRE DE ARCHIVO",
        mensaje: `La fecha del archivo no es la misma que la fecha de operación (${fecha})`,
      };
    return null;
  }).filter((fileName) => fileName !== null);
  if (size(validacion) > 0)
    throw {
      type: "errores_archivos",
      errors: validacion,
    };
  else return true;
};

const validarFechaConFormato = (
  fileName,
  confArchivo,
  fecha,
  format = "aaaammdd"
) => {
  const lxFormat = format
    .replace("aaaa", "yyyy")
    .replace("mm", "MM")
    .replace("dd", "dd");
  if (DateTime.fromFormat(fecha, lxFormat).isValid === false)
    return {
      archivo: fileName,
      tipo_error: "FORMATO DE NOMBRE DE ARCHIVO",
      mensaje: `El nombre del archivo ${fileName} no tiene el formato correcto (formato esperado: ${confArchivo.nombre})`,
    };
  return true;
};

module.exports = {
  obtenerTablasIniciales,
};
