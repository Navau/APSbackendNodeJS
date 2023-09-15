const {
  isUndefined,
  find,
  isNumber,
  filter,
  map,
  forEach,
  size,
  isObject,
  includes,
  isNull,
  reduce,
  some,
  isEqual,
  groupBy,
  pickBy,
  intersection,
  intersectionBy,
  intersectionWith,
  uniqBy,
  flatMap,
  pick,
  differenceBy,
  difference,
  isEmpty,
} = require("lodash");
const { DateTime } = require("luxon");
const math = require("mathjs");

const operateDates = (operations) => {
  try {
    let result = null;
    let operator = null;
    let resultFinal = null;
    let posInit = 0;
    let posEnd = 0;

    forEach(operations, (element, index) => {
      if (element?.date) {
        const { date, operateResultBy } = element;
        if (result === null) {
          result = date;
          posInit = index;
        } else {
          if (operator === "+") result = result + date;
          else if (operator === "-") result = result - date;
          else if (operator === "*") result = result * date;
          else if (operator === "/") result = result / date;
        }
        if (operateResultBy === "days") {
          posEnd = index;
          resultFinal = Math.abs(result) / (1000 * 3600 * 24);
        }
      } else if (["+", "-", "*", "/"].includes(element)) {
        operator = element;
      }
    });
    if (resultFinal === null) throw new Error("Operación sin éxito");
    return { resultFinal, posInit, posEnd };
  } catch (err) {
    throw err;
  }
};

const searchValueInArray = (array, value) => {
  const searchResult = find(array, (element) => {
    const property = Object.keys(element)[0];
    return element[property] === value;
    // return some(properties, (property) => element[property] === value);
  });
  return !isUndefined(searchResult);
};

const defaultValidationContentValues = (params, message) => {
  try {
    if (!isUndefined(params?.paramsBD)) {
      const { paramsBD, value, messages } = params;
      const { tipo_instrumento_data_db } = paramsBD;
      if (!searchValueInArray(tipo_instrumento_data_db, value))
        return (
          messages?.ERROR_MESSAGE_DB ||
          message ||
          "El campo no corresponde a ningún registro válido"
        );
      return true;
    }
    return params;
  } catch (err) {
    return `Error de servidor. ${err}`;
  }
};

const funcionesValidacionesContenidoValores = {
  tipoInstrumento: (params) => {
    return defaultValidationContentValues(
      params,
      "El campo no corresponde a ninguno de los autorizados por el RMV"
    );
  },
  moneda: (params) => {
    return defaultValidationContentValues(params);
  },
  tipoAmortizacion: (params) => {
    return defaultValidationContentValues(params);
  },
  tipoInteres: (params) => {
    return defaultValidationContentValues(params);
  },
  tipoTasa: (params) => {
    return defaultValidationContentValues(params);
  },
  tasaEmision: (params) => {
    return true;
  },
  plazoEmisionTiposDeDatos: (params) => {
    return true;
  },
  nroPago: (params) => {
    return true;
  },
  plazoCupon: (params) => {
    return true;
  },
  prepago: (params) => {
    return defaultValidationContentValues(params);
  },
  subordinado: (params) => {
    return defaultValidationContentValues(params);
  },
  calificacion: (params) => {
    return defaultValidationContentValues(params);
  },
  calificadora: (params) => {
    return defaultValidationContentValues(params);
  },
  custodio: (params) => {
    return defaultValidationContentValues(params);
  },
  pais: (params) => {
    return defaultValidationContentValues(params);
  },
  emisor: (params) => {
    return defaultValidationContentValues(params);
  },
  tipoAccion: (params) => {
    return defaultValidationContentValues(params);
  },
  serieEmision: (params) => {
    return defaultValidationContentValues(params);
  },
  mayorACero: (params) => {
    try {
      const { value } = params;
      const newValue = parseFloat(value);
      if (!isNumber(newValue)) return "No es un número válido";
      if (value <= 0) return "El valor debe ser mayor a 0";
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  mayorIgualACero: (params) => {
    try {
      const { value } = params;
      const newValue = parseFloat(value);
      if (!isNumber(newValue)) return "No es un número válido";
      if (value < 0) return "El valor debe ser mayor o igual a 0";
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
  operacionMatematica: (params) => {
    try {
      const { value, mathOperation, row } = params;
      const OPERATION_OPTIONS = {
        operationWithValues: [],
        messageFields: [],
      };

      OPERATION_OPTIONS.operationWithValues = map(
        mathOperation,
        (operation) => {
          let valueAux = operation;
          if (isObject(operation)) {
            const { column, number, isDate } = operation;
            if (!isUndefined(column)) {
              OPERATION_OPTIONS.messageFields.push(column);
              const columnValue = row[column];
              if (isDate) {
                valueAux = {
                  date: new Date(
                    DateTime.fromISO(columnValue).toFormat("yyyy-MM-dd")
                  ).getTime(),
                };
                if (operation?.operateResultBy)
                  valueAux.operateResultBy = operation.operateResultBy;
              } else {
                valueAux = columnValue;
              }
            } else {
              OPERATION_OPTIONS.messageFields.push(number);
              valueAux = number;
            }
          } else {
            OPERATION_OPTIONS.messageFields.push(operation);
          }
          return valueAux;
        }
      );
      const datesResult = operateDates(OPERATION_OPTIONS.operationWithValues);
      const { resultFinal, posInit, posEnd } = datesResult;
      if (!isNull(resultFinal)) {
        if (size(OPERATION_OPTIONS.operationWithValues) === posEnd + 1)
          OPERATION_OPTIONS.operationWithValues = [resultFinal];
        else
          OPERATION_OPTIONS.operationWithValues.splice(
            posInit,
            posEnd,
            resultFinal
          );
      }

      const resultOperation = math.evaluate(
        OPERATION_OPTIONS.operationWithValues.join("")
      );

      if (parseFloat(resultOperation) !== parseFloat(value))
        return `El resultado de la operación (${OPERATION_OPTIONS.messageFields.join(
          ""
        )}) no es igual a ${value}`;
      return true;
    } catch (err) {
      return `La operación no se pudo concluir correctamente. ${err}`;
    }
  },
  combinacionUnicaPorArchivo: (params) => {
    const {
      uniqueCombinationPerFile,
      fileContent,
      fileCode,
      nuevaCarga,
      fileName,
    } = params;
    // Inicializar un objeto para agrupar combinaciones únicas
    const groupedCombinations = {};

    // Recorrer el contenido del archivo
    forEach(fileContent, (row, rowIndex) => {
      forEach(row, (value, columnIndex) => {
        // Recorrer las combinaciones únicas del archivo
        forEach(uniqueCombinationPerFile, (combinations, combinationIndex) => {
          // Verificar si la columna actual está en la combinación
          if (includes(combinations, columnIndex)) {
            // Crear una clave única para la combinación y fila
            const key = `${rowIndex}+${combinationIndex}`;

            // Agregar el valor a la combinación agrupada
            groupedCombinations[key] = {
              ...groupedCombinations[key],
              [columnIndex]: { value, rowIndex },
            };
          }
        });
      });
    });

    // Inicializar un objeto para almacenar grupos agrupados
    const groupedObject = {};

    // Recorrer las combinaciones agrupadas
    for (const key in groupedCombinations) {
      const properties = Object.keys(groupedCombinations[key]);
      const propertyKey = properties.join("+");
      groupedObject[propertyKey] = groupedObject[propertyKey] || {};
      groupedObject[propertyKey][key] = groupedCombinations[key];
    }

    // Inicializar un objeto para almacenar objetos únicos y duplicados
    const uniqueObjects = {};
    const duplicates = {};

    // Recorrer los grupos agrupados
    forEach(groupedObject, (group, key) => {
      forEach(group, (valuesGroup) => {
        // Inicializar un objeto para almacenar objetos únicos
        uniqueObjects[key] = uniqueObjects[key] || {};

        // Crear una clave única basada en los índices de fila
        const rowIndexes = [...new Set(map(valuesGroup, "rowIndex"))];
        uniqueObjects[key][rowIndexes.join("+")] = map(
          valuesGroup,
          "value"
        ).join("");
      });

      // Inicializar un objeto para almacenar índices duplicados
      const duplicateIndices = {};

      // Recorrer objetos únicos y buscar duplicados
      forEach(uniqueObjects[key], (value, index) => {
        if (!duplicateIndices[value]) {
          duplicateIndices[value] = [index];
        } else {
          duplicateIndices[value].push(index);
        }
      });

      // Filtrar duplicados y almacenarlos
      duplicates[key] = pickBy(
        duplicateIndices,
        (indices) => indices.length > 1
      );
    });

    if (size(duplicates) > 0) {
      //TODO: codeCurrentFile === "481" ||codeCurrentFile === "482" ||codeCurrentFile === "DC"? "Un valor seriado con idénticas características, no puede estar desagrupado en varios registros"
      const errors = [];
      forEach(duplicates, (values, key) => {
        forEach(values, (rows, value) => {
          forEach(rows, (row) => {
            errors.push({
              id_carga_archivos: nuevaCarga.id_carga_archivos,
              archivo: fileName,
              tipo_error: "VALOR INCORRECTO",
              descripcion: `La combinación de los campos '${key}' debe ser único`,
              valor: value,
              fila: row,
              columna: key,
            });
          });
        });
      });
      return errors;
    }
    return true;
  },
  unicoPor: (params) => {
    try {
      const { fieldsUniqueBy, fileContent, nuevaCarga, fileName } = params;
      const data = map(fileContent, (row, index) => ({
        ...row,
        index,
      }));
      const errors = [];
      forEach(fieldsUniqueBy, (validatesBy, field) => {
        const iteratee = (item) =>
          map(validatesBy, (prop) => item[prop]).join("_");
        const groups = groupBy(data, iteratee);
        const repeatedGroups = filter(groups, (group) => size(group) > 1);
        forEach(repeatedGroups, (repeatedGroup) => {
          const groupsByField = groupBy(repeatedGroup, field);
          const repeatedsByField = filter(
            groupsByField,
            (group) => size(group) > 1
          );
          if (size(repeatedsByField) > 0) {
            forEach(repeatedsByField, (repeateds) => {
              forEach(repeateds, (repeatedRow) => {
                const message = !isEmpty(validatesBy?.[0])
                  ? `El campo debe ser único por '${validatesBy.join(", ")}'`
                  : `El campo debe ser único'`;

                errors.push({
                  id_carga_archivos: nuevaCarga.id_carga_archivos,
                  archivo: fileName,
                  tipo_error: "VALOR INCORRECTO",
                  descripcion: message,
                  valor: repeatedRow[field],
                  fila: repeatedRow.index,
                  columna: field,
                });
              });
            });
          }
        });
      });
      return size(errors) > 0 ? errors : true;
    } catch (err) {
      throw err;
    }
  },
  fechaOperacionIgual: (params) => {
    try {
      const { value, fecha_operacion } = params;
      const newValue = DateTime.fromISO(value);
      const newFechaOperacion = DateTime.fromISO(fecha_operacion);
      if (!newValue.equals(newFechaOperacion))
        return "La fecha debe ser igual a la fecha de operación del nombre de archivo";
      return true;
    } catch (err) {
      return `Error de servidor. ${err}`;
    }
  },
};

module.exports = {
  funcionesValidacionesContenidoValores,
};
