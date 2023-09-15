const {
  forEach,
  size,
  replace,
  map,
  isEmpty,
  filter,
  isNull,
  pull,
} = require("lodash");
const { agregarError } = require("./funciones-auxiliares.helper");

const quitarCaracteresExtrañosContenidoArchivo = (fileContent) => {
  forEach(fileContent, (value, index) => {
    if (value?.charCodeAt(index) === 65279) {
      console.log("VALUE", value, "INDEX", index, 65279);
      value = value.replace(value.slice(index, 1), "");
      console.log("VALUE", value, "INDEX", index, 65279);
    }
  });
};

const verificarArchivoVacio = (
  fileContent,
  fileIsEmpty,
  fileName,
  nuevaCarga,
  errors
) => {
  if (fileIsEmpty === false) {
    if (
      size(fileContent) === 0 ||
      size(replace(fileContent, /\s/g, "") === 0)
    ) {
      const newError = {
        id_carga_archivos: nuevaCarga.id_carga_archivos,
        archivo: fileName,
        tipo_error: "CONTENIDO DE ARCHIVO VACIO",
        descripcion: `El contenido del archivo no puede estar sin información o vació`,
      };
      agregarError(newError, errors);
    }
  }
};

const verificarFormatoContenidoArchivo = (
  fileContent,
  fileName,
  nuevaCarga,
  errors
) => {
  try {
    const splitByRow = fileContent.split(/[\r\n]+/);
    const fileContentSplitByRow = map(splitByRow, (row) => {
      if (!isEmpty(row)) return row;
      return null;
    }).filter((row) => !isNull(row));
    const validationCSVData = new RegExp(/^("[^"]*"(,("[^"]*"))*)?$/);
    forEach(fileContentSplitByRow, (row, indexRow) => {
      if (!validationCSVData.test(row)) {
        const newErrors = encontrarErroresPorFilaDeArchivo(
          row,
          fileName,
          indexRow,
          5,
          nuevaCarga
        );
        if (size(newErrors) === 0) {
          const newError = {
            id_carga_archivos: nuevaCarga.id_carga_archivos,
            archivo: fileName,
            tipo_error: "ERROR DE FORMATO DE CONTENIDO",
            descripcion:
              "El formato del archivo no contiene los campos entre comillas correctamente",
            fila: indexRow,
          };
          agregarError(newError, errors);
        }
        forEach(newErrors, (newError) => {
          agregarError(newError, errors);
        });
      }
    });
    return fileContentSplitByRow;
  } catch (err) {
    throw err;
  }
};

const verificarCantidadColumnasArchivo = (
  fileHeaders = [],
  fileContentSplit,
  fileName,
  nuevaCarga,
  errors
) => {
  fileHeaders.splice(0, 1); // ELIMINAR ID DE TABLA ARCHIVO
  const invalidHeaders = [
    "id_carga_archivos",
    "cod_institucion",
    "fecha_informacion",
  ];
  pull(fileHeaders, ...invalidHeaders); // ELIMINAR ID_CARGA_ARCHIVOS, COD_INSTITUCION Y FECHA_INFORMACION
  const fileContentRows = map(fileContentSplit, (row, indexRow) => {
    const values = row.split('","');
    if (size(values) !== size(fileHeaders)) {
      const newError = {
        id_carga_archivos: nuevaCarga.id_carga_archivos,
        archivo: fileName,
        tipo_error: "ERROR DE FORMATO DE CONTENIDO",
        descripcion: `La cantidad de columnas del archivo ('${size(
          values
        )}') no es igual a la cantidad de columnas esperada ('${size(
          fileHeaders
        )}')`,
        fila: indexRow,
      };
      agregarError(newError, errors);
      return null;
    }
    return values;
  });
  if (size(errors) > 0) return;
  const objectArrayFileContent = fileContentRows.map((row) => {
    const rowData = {};
    fileHeaders.forEach((header, index) => {
      rowData[header] = row[index].replace(/"/g, ""); // Elimina las comillas en cada valor
    });
    return rowData;
  });
  return objectArrayFileContent;
};

function encontrarErroresPorFilaDeArchivo(
  row,
  fileName,
  indexRow,
  contextLength = 10,
  nuevaCarga
) {
  try {
    const errorPositions = [];
    let insideQuotes = false;
    if (row?.[0] !== '"' || row?.[size(row) - 1] !== '"') {
      const message =
        row[0] === " " || row[size(row) - 1] === " "
          ? "El formato del archivo no debe contener espacios en blanco al inicio ni al final"
          : "El formato del archivo no contiene los campos entre comillas correctamente";
      errorPositions.push({
        id_carga_archivos: nuevaCarga.id_carga_archivos,
        archivo: fileName,
        tipo_error: "ERROR DE FORMATO DE CONTENIDO",
        descripcion: message,
        fila: indexRow,
      });
      return errorPositions;
    }
    for (let i = 0; i < size(row); i++) {
      const char = row[i];
      const startIndex = Math.max(i - contextLength, 0);
      const endIndex = Math.min(i + contextLength, size(row) - 1);
      const errorContext = row.substring(startIndex, endIndex + 1);
      if (char === '"') {
        insideQuotes = !insideQuotes; // Cambiamos el estado de dentro/fuera de comillas
      } else if (char === "," && insideQuotes === true) {
        errorPositions.push({
          id_carga_archivos: nuevaCarga.id_carga_archivos,
          archivo: fileName,
          tipo_error: "ERROR DE FORMATO DE CONTENIDO",
          descripcion: `El formato de archivo debe estar separado correctamente por comas (,) y comillas dobles ("") (error cerda de '${errorContext}')`,
          fila: indexRow,
        });
        return errorPositions;
      } else if (insideQuotes === false) {
        if (char !== ",") {
          errorPositions.push({
            id_carga_archivos: nuevaCarga.id_carga_archivos,
            archivo: fileName,
            tipo_error: "ERROR DE FORMATO DE CONTENIDO",
            descripcion: `El formato de archivo debe estar separado correctamente por comas (,) y comillas dobles ("") (error cerda de '${errorContext}')`,
            fila: indexRow,
          });
          i += row.indexOf('"', i - 2);
          insideQuotes = !insideQuotes;
        }
        if (char === "," && row[i + 1] !== '"') {
          const message = isEmpty(row[i + 1])
            ? `El formato de archivo no debe contener espacios en blanco y debe estar separado correctamente por comas (,) y comillas dobles ("") (error cerda de '${errorContext}')`
            : `El formato de archivo debe estar separado correctamente por comas (,) y comillas dobles ("") (error cerda de '${errorContext}')`;
          i += row.indexOf('"', i - 2);
          insideQuotes = !insideQuotes;
          errorPositions.push({
            id_carga_archivos: nuevaCarga.id_carga_archivos,
            archivo: fileName,
            tipo_error: "ERROR DE FORMATO DE CONTENIDO",
            descripcion: message,
            fila: indexRow,
          });
        }
      }
    }
    return errorPositions;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  quitarCaracteresExtrañosContenidoArchivo,
  verificarArchivoVacio,
  verificarFormatoContenidoArchivo,
  verificarCantidadColumnasArchivo,
};
