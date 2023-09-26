const {
  forEach,
  size,
  replace,
  map,
  isEmpty,
  filter,
  isNull,
  pull,
  find,
  includes,
  isArray,
  isUndefined,
  trim,
  set,
} = require("lodash");
const {
  agregarError,
  CONF_FILE_MESSAGES,
} = require("./funciones-auxiliares.helper");
const { DateTime } = require("luxon");
const {
  funcionesValidacionesContenidoValores,
} = require("./funciones-validaciones-contenido-valores-archivos.helper");

const quitarCaracteresExtrañosContenidoArchivo = (fileContent) => {
  try {
    let result = "";
    forEach(fileContent, (char, index) => {
      if (char?.charCodeAt(index) === 65279) {
        console.log({
          char,
          index,
          typeOF: typeof char,
          size: char.length,
          charCode: char.charCodeAt(index),
        });
        char = char.replace(char.slice(index, index + 1), "");
        console.log({
          char,
          index,
          typeOF: typeof char,
          size: char.length,
          charCode: char.charCodeAt(index),
        });
      }
      result += char;
    });
    return result;
  } catch (err) {
    console.log(err);
  }
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
        descripcion: `El contenido del archivo no puede estar sin información o vacío`,
      };
      agregarError(newError, errors);
    }
  }
};

const verificarFormatoContenidoArchivo = (
  fileContent,
  fileName,
  nuevaCarga,
  fileIsEmpty,
  errors
) => {
  try {
    if (fileIsEmpty === true && trim(fileContent) === "") return null;
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

const encontrarErroresPorFilaDeArchivo = (
  row,
  fileName,
  indexRow,
  contextLength = 10,
  nuevaCarga
) => {
  try {
    const errorPositions = [];
    let insideQuotes = false;
    if (row?.[0] !== '"' || row?.[size(row) - 1] !== '"') {
      const message =
        row[0] === " " || row[size(row) - 1] === " "
          ? "El formato del archivo no debe contener espacios en blanco al inicio ni al final"
          : "El formato del archivo no contiene los campos entre comillas correctamente";
      console.log({ row, 0: row[0], last: row[size(row) - 1] });
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
};

const validarContenidoValoresDeArchivo = (params) => {
  const {
    fileContent,
    validations,
    nuevaCarga,
    fileName,
    fileCode,
    formatDateFields,
    matchDataType,
    fecha_operacion,
    mayBeEmptyFields,
    informacionEntreArchivos,
    errorsContentValuesFile,
    replaceFieldValue,
  } = params;
  const OPTIONS_VALUES = {
    value: undefined,
    matchDataType,
    isLastRow: false,
    isLastColumn: false,
    isLastNroCupon: false,
  };
  forEach(fileContent, (row, rowIndex) => {
    let columnCounter = 0;
    OPTIONS_VALUES.isLastRow = false;
    OPTIONS_VALUES.isLastColumn = false;
    OPTIONS_VALUES.isLastNroCupon = false;
    if (rowIndex === size(fileContent) - 1) OPTIONS_VALUES.isLastRow = true;
    if (
      fileContent?.[rowIndex + 1]?.nro_cupon === "1" ||
      rowIndex === size(fileContent) - 1
    )
      OPTIONS_VALUES.isLastNroCupon = true;

    forEach(row, (value, columnIndex) => {
      columnCounter++;
      if (columnCounter === size(row) - 1) OPTIONS_VALUES.isLastColumn = true;
      forEach(replaceFieldValue, (replaceValue, replaceColumnIndex) => {
        if (columnIndex === replaceColumnIndex)
          value = DateTime.fromISO(value).toFormat(replaceValue);
      });
      OPTIONS_VALUES.value = value;
      const findValidation = find(
        validations,
        (validation) => validation.columnName === columnIndex
      );

      if (isUndefined(findValidation)) {
        throw new Error(
          `No se encontró la columna '${columnIndex}' en el archivo '${fileCode}'`
        );
      }

      const {
        pattern,
        functions,
        paramsBD,
        messages,
        mathOperation,
        extraFunctionsParameters,
      } = findValidation;

      validarTiposDeDatos({
        OPTIONS_VALUES,
        pattern,
        columnIndex,
        row,
        rowIndex,
        functions,
        paramsBD,
        messages,
        mayBeEmptyFields,
        formatDateFields,
        errorsContentValuesFile,
        nuevaCarga,
        fecha_operacion,
        fileName,
        fileCode,
      });

      validarFuncionesDeColumnas({
        OPTIONS_VALUES,
        pattern,
        row,
        rowIndex,
        columnIndex,
        paramsBD,
        messages,
        functions,
        mayBeEmptyFields,
        nuevaCarga,
        extraFunctionsParameters,
        errorsContentValuesFile,
        fileCode,
        fileName,
        fecha_operacion,
      });

      validarOperacionesMatematicasDeColumnas({
        OPTIONS_VALUES,
        pattern,
        row,
        rowIndex,
        columnIndex,
        mathOperation,
        nuevaCarga,
        errorsContentValuesFile,
        fileContent,
        fileName,
        fileCode,
      });

      validarOperacionesEntreArchivos({
        OPTIONS_VALUES,
        row,
        rowIndex,
        columnCounter,
        columnIndex,
        nuevaCarga,
        validations,
        fileCode,
        fileName,
        fileContent,
        informacionEntreArchivos,
        errorsContentValuesFile,
      });
    });
  });
};

const validarTiposDeDatos = (params) => {
  const {
    OPTIONS_VALUES,
    pattern,
    columnIndex,
    row,
    rowIndex,
    functions,
    paramsBD,
    messages,
    mayBeEmptyFields,
    formatDateFields,
    errorsContentValuesFile,
    nuevaCarga,
    fecha_operacion,
    fileName,
    fileCode,
  } = params;
  const { DEFAULT_ERROR_DATA_TYPE_MESSAGE } = CONF_FILE_MESSAGES();
  if (!isArray(pattern)) {
    forEach(formatDateFields, (formatDateField, dateFieldIndex) => {
      if (
        columnIndex === dateFieldIndex &&
        DateTime.fromISO(OPTIONS_VALUES.value).isValid
      ) {
        OPTIONS_VALUES.value = DateTime.fromISO(OPTIONS_VALUES.value).toFormat(
          formatDateField
        );
      }
    });
    if (!pattern?.test(OPTIONS_VALUES.value)) {
      OPTIONS_VALUES.matchDataType = false;
      if (
        isEmpty(OPTIONS_VALUES.value) &&
        includes(mayBeEmptyFields, columnIndex)
      ) {
      } else {
        agregarError(
          {
            id_carga_archivos: nuevaCarga.id_carga_archivos,
            archivo: fileName,
            tipo_error: "TIPO DE DATO INCORRECTO",
            descripcion: messages?.DATA_TYPE || DEFAULT_ERROR_DATA_TYPE_MESSAGE,
            valor: OPTIONS_VALUES.value,
            fila: rowIndex,
            columna: columnIndex,
          },
          errorsContentValuesFile
        );
      }
    }
  } else {
    const { value } = OPTIONS_VALUES;
    forEach(functions, (functionName) => {
      functionResult = funcionesValidacionesContenidoValores[functionName]({
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
            descripcion: messages?.DATA_TYPE || DEFAULT_ERROR_DATA_TYPE_MESSAGE,
            valor: value,
            fila: rowIndex,
            columna: columnIndex,
          },
          errorsContentValuesFile
        );
      }
    });
  }
};

const validarFuncionesDeColumnas = (params) => {
  const {
    OPTIONS_VALUES,
    pattern,
    row,
    rowIndex,
    columnIndex,
    paramsBD,
    messages,
    functions,
    mayBeEmptyFields,
    nuevaCarga,
    extraFunctionsParameters,
    errorsContentValuesFile,
    fileCode,
    fileName,
    fecha_operacion,
  } = params;
  const { value, isLastColumn, isLastRow, isLastNroCupon } = OPTIONS_VALUES;
  forEach(functions, (functionName) => {
    functionResult = funcionesValidacionesContenidoValores[functionName]({
      paramsBD,
      value,
      fecha_operacion,
      columnIndex,
      isLastNroCupon,
      isLastRow,
      isLastColumn,
      row,
      rowIndex,
      messages,
      mayBeEmptyFields,
      pattern,
      fileCode,
      extraFunctionsParameters,
      functionName,
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
};

const validarOperacionesMatematicasDeColumnas = (params) => {
  const {
    OPTIONS_VALUES,
    pattern,
    row,
    rowIndex,
    columnIndex,
    mathOperation,
    nuevaCarga,
    errorsContentValuesFile,
    fileContent,
    fileName,
    fileCode,
  } = params;
  const { value } = OPTIONS_VALUES;
  if (size(mathOperation) > 0) {
    const functionResult =
      funcionesValidacionesContenidoValores.operacionMatematica({
        value,
        mathOperation,
        row,
        rowIndex,
        fileContent,
        pattern,
        fileCode,
        columnIndex,
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
};

const validarOperacionesEntreArchivos = (params) => {
  const {
    OPTIONS_VALUES,
    row,
    rowIndex,
    columnCounter,
    columnIndex,
    nuevaCarga,
    validations,
    fileCode,
    fileName,
    fileContent,
    informacionEntreArchivos,
    errorsContentValuesFile,
  } = params;
  const { value, matchDataType } = OPTIONS_VALUES;
  const functionResult =
    funcionesValidacionesContenidoValores.validacionesEntreArchivos({
      value,
      row,
      rowIndex,
      columnIndex,
      columnCounter,
      matchDataType,
      validations,
      nuevaCarga,
      informacionEntreArchivos,
      fileName,
      fileCode,
      fileContent,
    });
  if (functionResult !== true) {
    forEach(functionResult, (error) => {
      agregarError(error, errorsContentValuesFile);
    });
  }
};

const validarCombinacionesUnicasPorArchivo = (params) => {
  const {
    uniqueCombinationPerFile,
    nuevaCarga,
    fileContent,
    fileCode,
    fileName,
    errorsContentValuesFile,
  } = params;
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
};

const validarValoresUnicosPorArchivo = (params) => {
  const {
    fieldsUniqueBy,
    fileContent,
    nuevaCarga,
    fileName,
    errorsContentValuesFile,
  } = params;
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
};

module.exports = {
  quitarCaracteresExtrañosContenidoArchivo,
  verificarArchivoVacio,
  verificarFormatoContenidoArchivo,
  verificarCantidadColumnasArchivo,
  validarContenidoValoresDeArchivo,
  validarCombinacionesUnicasPorArchivo,
  validarValoresUnicosPorArchivo,
};
